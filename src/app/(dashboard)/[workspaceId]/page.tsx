import { CircleGauge } from "lucide-react";

import { AnalyticsOverview } from "@/components/analytics-overview";
import { WorkspacePageHeader } from "@/components/workspace-page-header";
import {
  getTimeSeriesData,
  getWorkspaceStats,
} from "@/lib/queries/analytics";
import { getWorkspaceContext } from "@/lib/workspace-helpers";

export default async function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  await getWorkspaceContext(workspaceId);
  const [stats, timeSeries] = await Promise.all([
    getWorkspaceStats(workspaceId),
    getTimeSeriesData(workspaceId),
  ]);

  return (
    <>
      <WorkspacePageHeader
        title="Overview"
        description="Monitor request health, latency, and errors across your services."
        icon={CircleGauge}
      />
      <AnalyticsOverview
        workspaceId={workspaceId}
        stats={stats}
        timeSeries={timeSeries}
      />
    </>
  );
}
