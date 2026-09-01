"use server";

import { redirect } from "next/navigation";

import { createOwnedWorkspace } from "@/data/workspaces";
import type { WorkspaceUseCase } from "@/db/schema";
import { requireAuth } from "@/lib/auth-helpers";

export type CreateWorkspaceState = {
  error?: string;
};

const allowedUsage = new Set<WorkspaceUseCase>(["personal", "team", "company"]);

export async function createWorkspace(
  _previousState: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const session = await requireAuth();
  const name = String(formData.get("name") ?? "").trim();
  const usage = String(formData.get("usage") ?? "");

  if (name.length < 2 || name.length > 60) {
    return { error: "Workspace name must be between 2 and 60 characters." };
  }

  if (!allowedUsage.has(usage as WorkspaceUseCase)) {
    return { error: "Choose how you plan to use PulseLog." };
  }

  let createdWorkspace: { id: string } | undefined;

  try {
    createdWorkspace =
      (await createOwnedWorkspace({
        name,
        useCase: usage as WorkspaceUseCase,
        ownerId: session.user.id,
      })) ?? undefined;
  } catch {
    return { error: "We could not create your workspace. Please try again." };
  }

  if (!createdWorkspace) {
    return { error: "We could not create your workspace. Please try again." };
  }

  redirect(`/${createdWorkspace.id}`);
}
