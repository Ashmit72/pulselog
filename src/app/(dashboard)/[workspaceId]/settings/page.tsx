import { WorkspaceSettings } from "@/components/workspace-settings";
import { getWorkspaceContext } from "@/lib/workspace-helpers";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const { currentWorkspace } = await getWorkspaceContext(workspaceId);

  return (
    <WorkspaceSettings
      workspaceId={currentWorkspace.id}
      workspaceName={currentWorkspace.name}
      createdAt={currentWorkspace.createdAt.toISOString()}
    />
  );
}
