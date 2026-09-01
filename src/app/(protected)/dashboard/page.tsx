import { redirect } from "next/navigation";

import { listOwnedWorkspaces } from "@/data/workspaces";
import { requireAuth } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const session = await requireAuth();
  const [firstWorkspace] = await listOwnedWorkspaces(session.user.id);

  redirect(firstWorkspace ? `/${firstWorkspace.id}` : "/onboarding");
}
