import { z } from "zod";

export const MAX_METADATA_BYTES = 8 * 1024;
export const MAX_ERROR_MESSAGE_CHARACTERS = 2_000;

export const ingestPayloadSchema = z.object({
  service_name: z.string().trim().min(1).max(255),
  route: z.string().trim().min(1).max(255),
  status_code: z.number().int().min(100).max(599),
  duration_ms: z.number().int().nonnegative(),
  error_message: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type IngestPayload = z.infer<typeof ingestPayloadSchema>;

export function getJsonByteSize(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

export function normalizeErrorMessage(value: string | null | undefined) {
  if (value == null) return null;
  return Array.from(value).slice(0, MAX_ERROR_MESSAGE_CHARACTERS).join("");
}
