"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteOwnedWorkspace,
  getOwnedWorkspace,
  renameOwnedWorkspace,
} from "@/data/workspaces";
import { requireAuth } from "@/lib/auth-helpers";

export type WorkspaceActionState = {
  error?: string;
  success?: string;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateWorkspaceName(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const session = await requireAuth();
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!uuidPattern.test(workspaceId)) {
    return { error: "Invalid workspace identifier." };
  }

  if (name.length < 2 || name.length > 60) {
    return { error: "Workspace name must be between 2 and 60 characters." };
  }

  try {
    const updated = await renameOwnedWorkspace({
      name,
      workspaceId,
      ownerId: session.user.id,
    });

    if (!updated) {
      return { error: "Workspace not found or you do not have permission." };
    }
  } catch {
    return { error: "We could not update the workspace. Please try again." };
  }

  revalidatePath(`/${workspaceId}`, "layout");
  return { success: "Workspace name updated." };
}

export async function deleteWorkspace(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const session = await requireAuth();
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!uuidPattern.test(workspaceId)) {
    return { error: "Invalid workspace identifier." };
  }

  const ownedWorkspace = await getOwnedWorkspace(session.user.id, workspaceId);

  if (!ownedWorkspace) {
    return { error: "Workspace not found or you do not have permission." };
  }

  if (confirmation !== ownedWorkspace.name) {
    return { error: "Enter the exact workspace name to confirm deletion." };
  }

  try {
    const deleted = await deleteOwnedWorkspace({
      workspaceId,
      ownerId: session.user.id,
    });

    if (!deleted) {
      return { error: "Workspace not found or you do not have permission." };
    }
  } catch {
    return { error: "We could not delete the workspace. Please try again." };
  }

  redirect("/dashboard");
}
