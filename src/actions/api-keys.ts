"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { apiKey, workspace } from "@/db/schema";
import { getOwnedWorkspace } from "@/data/workspaces";
import { requireAuth } from "@/lib/auth-helpers";

const workspaceIdSchema = z.string().uuid();
const keyIdSchema = z.string().uuid();
const keyNameSchema = z.string().trim().min(2).max(60);

export type CreateApiKeyResult =
  | { success: true; secret: string }
  | { success: false; error: string };

export type DeleteApiKeyResult =
  | { success: true }
  | { success: false; error: string };

export async function createApiKey(
  workspaceId: string,
  name: string,
): Promise<CreateApiKeyResult> {
  const parsedWorkspaceId = workspaceIdSchema.safeParse(workspaceId);
  const parsedName = keyNameSchema.safeParse(name);

  if (!parsedWorkspaceId.success) {
    return { success: false, error: "Invalid workspace." };
  }

  if (!parsedName.success) {
    return {
      success: false,
      error: "Key name must be between 2 and 60 characters.",
    };
  }

  const session = await requireAuth();
  const ownedWorkspace = await getOwnedWorkspace(
    session.user.id,
    parsedWorkspaceId.data,
  );

  if (!ownedWorkspace) {
    return { success: false, error: "Workspace not found." };
  }

  const secret = `pl_live_${randomBytes(24).toString("base64url")}`;
  const keyHash = createHash("sha256").update(secret).digest("hex");

  try {
    await db.insert(apiKey).values({
      workspaceId: ownedWorkspace.id,
      name: parsedName.data,
      keyHash,
    });
  } catch {
    return {
      success: false,
      error: "We could not create the API key. Please try again.",
    };
  }

  revalidatePath(`/${ownedWorkspace.id}/api-keys`);

  return { success: true, secret };
}

export async function deleteApiKey(
  keyId: string,
): Promise<DeleteApiKeyResult> {
  const parsedKeyId = keyIdSchema.safeParse(keyId);

  if (!parsedKeyId.success) {
    return { success: false, error: "Invalid API key." };
  }

  const session = await requireAuth();
  const [ownedKey] = await db
    .select({
      id: apiKey.id,
      workspaceId: apiKey.workspaceId,
    })
    .from(apiKey)
    .innerJoin(workspace, eq(apiKey.workspaceId, workspace.id))
    .where(
      and(
        eq(apiKey.id, parsedKeyId.data),
        eq(workspace.ownerId, session.user.id),
      ),
    )
    .limit(1);

  if (!ownedKey) {
    return { success: false, error: "API key not found." };
  }

  try {
    const [deletedKey] = await db
      .delete(apiKey)
      .where(
        and(
          eq(apiKey.id, ownedKey.id),
          eq(apiKey.workspaceId, ownedKey.workspaceId),
        ),
      )
      .returning({ id: apiKey.id });

    if (!deletedKey) {
      return { success: false, error: "API key not found." };
    }
  } catch {
    return {
      success: false,
      error: "We could not revoke the API key. Please try again.",
    };
  }

  revalidatePath(`/${ownedKey.workspaceId}/api-keys`);

  return { success: true };
}
