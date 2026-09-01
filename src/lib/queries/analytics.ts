import "server-only";

import { sql } from "drizzle-orm";

import { db } from "@/db";
import { event } from "@/db/schema";

export type WorkspaceStats = {
  totalRequests: number;
  p95LatencyMs: number;
  errorRate: number;
  serviceCount: number;
};

export type TimeSeriesPoint = {
  timestamp: string;
  successful: number;
  clientErrors: number;
  serverErrors: number;
};

type StatsRow = {
  total_requests: number | string;
  p95_latency_ms: number | string;
  error_rate: number | string;
  service_count: number | string;
};

type TimeSeriesRow = {
  bucket: Date | string;
  successful: number | string;
  client_errors: number | string;
  server_errors: number | string;
};

export async function getWorkspaceStats(
  workspaceId: string,
): Promise<WorkspaceStats> {
  const result = await db.execute(sql`
    select
      count(*)::int as total_requests,
      coalesce(
        percentile_cont(0.95) within group (order by ${event.durationMs}),
        0
      )::float8 as p95_latency_ms,
      coalesce(
        count(*) filter (where ${event.statusCode} between 500 and 599)::float8
          / nullif(count(*), 0)::float8 * 100,
        0
      )::float8 as error_rate,
      count(distinct ${event.serviceName})::int as service_count
    from ${event}
    where ${event.workspaceId} = ${workspaceId}
      and ${event.createdAt} >= now() - interval '24 hours'
  `);

  const row = result.rows[0] as StatsRow | undefined;

  return {
    totalRequests: Number(row?.total_requests ?? 0),
    p95LatencyMs: Number(row?.p95_latency_ms ?? 0),
    errorRate: Number(row?.error_rate ?? 0),
    serviceCount: Number(row?.service_count ?? 0),
  };
}

export async function getTimeSeriesData(
  workspaceId: string,
): Promise<TimeSeriesPoint[]> {
  const result = await db.execute(sql`
    with hour_buckets as (
      select generate_series(
        date_trunc('hour', now()) - interval '23 hours',
        date_trunc('hour', now()),
        interval '1 hour'
      ) as bucket
    )
    select
      hour_buckets.bucket,
      count(${event.id}) filter (
        where ${event.statusCode} between 200 and 299
      )::int as successful,
      count(${event.id}) filter (
        where ${event.statusCode} between 400 and 499
      )::int as client_errors,
      count(${event.id}) filter (
        where ${event.statusCode} between 500 and 599
      )::int as server_errors
    from hour_buckets
    left join ${event}
      on ${event.workspaceId} = ${workspaceId}
      and ${event.createdAt} >= hour_buckets.bucket
      and ${event.createdAt} < hour_buckets.bucket + interval '1 hour'
    group by hour_buckets.bucket
    order by hour_buckets.bucket asc
  `);

  return (result.rows as TimeSeriesRow[]).map((row) => ({
    timestamp: new Date(row.bucket).toISOString(),
    successful: Number(row.successful),
    clientErrors: Number(row.client_errors),
    serverErrors: Number(row.server_errors),
  }));
}
