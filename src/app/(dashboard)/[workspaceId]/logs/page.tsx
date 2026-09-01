import { TerminalSquare } from "lucide-react";

import { LogStream } from "@/components/log-stream";
import { LogsPageActions } from "@/components/logs-page-actions";
import { WorkspacePageHeader } from "@/components/workspace-page-header";
import {
  getWorkspaceLogs,
  getWorkspaceRoutes,
  getWorkspaceStatusCodes,
  normalizeLogFilters,
} from "@/lib/queries/logs";
import { getWorkspaceContext } from "@/lib/workspace-helpers";

export default async function WorkspaceLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{
    status?: string | string[];
    route?: string | string[];
    q?: string | string[];
    range?: string | string[];
  }>;
}) {
  const [{ workspaceId }, rawSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  await getWorkspaceContext(workspaceId);
  const filters = normalizeLogFilters(rawSearchParams);
  const [logs, routes, statusCodes] = await Promise.all([
    getWorkspaceLogs(workspaceId, filters),
    getWorkspaceRoutes(workspaceId),
    getWorkspaceStatusCodes(workspaceId),
  ]);

  return (
    <>
      <WorkspacePageHeader
        title="Logs"
        description="Search, filter, and inspect every request captured by this workspace."
        icon={TerminalSquare}
        actions={<LogsPageActions />}
      />
      <LogStream
        key={`${filters.status}:${filters.route}:${filters.range}:${filters.q}`}
        workspaceId={workspaceId}
        events={logs.events}
        total={logs.total}
        routes={routes}
        statusCodes={statusCodes}
        filters={filters}
      />
    </>
  );
}
