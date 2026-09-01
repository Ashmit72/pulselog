import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { apiKey, event } from "@/db/schema";
import { db } from "@/lib/db";
import {
  getJsonByteSize,
  ingestPayloadSchema,
  MAX_METADATA_BYTES,
  normalizeErrorMessage,
} from "@/lib/ingest-validation";

export const runtime = "edge";

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status },
  );
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export async function POST(request: Request) {
  const rawApiKey = request.headers.get("x-api-key")?.trim();

  if (!rawApiKey) {
    return jsonError("Unauthorized", 401);
  }

  const keyHash = await sha256Hex(rawApiKey);
  let matchedKey: { workspaceId: string } | undefined;

  try {
    [matchedKey] = await db
      .select({ workspaceId: apiKey.workspaceId })
      .from(apiKey)
      .where(eq(apiKey.keyHash, keyHash))
      .limit(1);
  } catch {
    return jsonError("Ingestion is temporarily unavailable", 503);
  }

  if (!matchedKey) {
    return jsonError("Unauthorized", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid JSON", 400);
  }

  const parsed = ingestPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Invalid event payload",
      400,
      parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const metadataBytes = getJsonByteSize(parsed.data.metadata);

  if (metadataBytes > MAX_METADATA_BYTES) {
    return jsonError(
      `Metadata exceeds the ${MAX_METADATA_BYTES}-byte limit`,
      413,
      { metadataBytes, maxMetadataBytes: MAX_METADATA_BYTES },
    );
  }

  try {
    const [createdEvent] = await db
      .insert(event)
      .values({
        workspaceId: matchedKey.workspaceId,
        serviceName: parsed.data.service_name,
        route: parsed.data.route,
        statusCode: parsed.data.status_code,
        durationMs: parsed.data.duration_ms,
        errorMessage: normalizeErrorMessage(parsed.data.error_message),
        metadata: parsed.data.metadata,
      })
      .returning({ id: event.id });

    if (!createdEvent) {
      return jsonError("Event could not be accepted", 500);
    }

    return NextResponse.json(
      { success: true, eventId: createdEvent.id },
      { status: 202 },
    );
  } catch {
    return jsonError("Event could not be accepted", 500);
  }
}
