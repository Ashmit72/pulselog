import { WorkspaceShell } from "@/components/workspace-shell";
import { getWorkspaceContext } from "@/lib/workspace-helpers";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const context = await getWorkspaceContext(workspaceId);
  const workspaces = context.workspaces.map(({ id, name }) => ({ id, name }));
  const currentWorkspace = {
    id: context.currentWorkspace.id,
    name: context.currentWorkspace.name,
  };

  return (
    <WorkspaceShell
      user={context.user}
      workspaces={workspaces}
      currentWorkspace={currentWorkspace}
    >
      {children}
    </WorkspaceShell>
  );
}
