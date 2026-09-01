import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/components/onboarding-flow";
import { listOwnedWorkspaces } from "@/data/workspaces";
import { requireAuth } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Create your workspace",
  description: "Set up your first PulseLog workspace.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: createNew } = await searchParams;
  const session = await requireAuth();
  const [existingWorkspace] = await listOwnedWorkspaces(session.user.id);

  if (existingWorkspace && createNew !== "1") {
    redirect(`/${existingWorkspace.id}`);
  }

  return <OnboardingFlow userName={session.user.name} />;
}
