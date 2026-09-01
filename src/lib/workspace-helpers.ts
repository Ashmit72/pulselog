import "server-only";

import { redirect } from "next/navigation";

import {
  listOwnedWorkspaces,
} from "@/data/workspaces";
import { requireAuth } from "@/lib/auth-helpers";

export async function getWorkspaceContext(workspaceId: string) {
  const session = await requireAuth();
  const ownedWorkspaces = await listOwnedWorkspaces(session.user.id);

  if (ownedWorkspaces.length === 0) {
    redirect("/onboarding");
  }

  const ownedCurrentWorkspace = ownedWorkspaces.find(
    (item) => item.id === workspaceId,
  );

  if (!ownedCurrentWorkspace) {
    redirect(`/${ownedWorkspaces[0].id}`);
  }

  return {
    user: {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    workspaces: ownedWorkspaces,
    currentWorkspace: ownedCurrentWorkspace,
  };
}
