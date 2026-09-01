import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db";
import { event } from "@/db/schema";

const LOG_LIMIT = 100;
const routeLimit = 250;
const rangeDurations = {
  "15m": 15 * 60 * 1_000,
  "1h": 60 * 60 * 1_000,
  "24h": 24 * 60 * 60 * 1_000,
  "7d": 7 * 24 * 60 * 60 * 1_000,
} as const;

export type LogTimeRange = keyof typeof rangeDurations;

export type LogFilters = {
  status: string;
  route: string;
  q: string;
  range: LogTimeRange;
};

export type WorkspaceLog = {
  id: string;
  serviceName: string;
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type WorkspaceLogsResult = {
  events: WorkspaceLog[];
  total: number;
};

function normalizeStatus(status: string | string[] | undefined) {
  const value = Array.isArray(status) ? status[0] : status;

  if (value === "2xx" || value === "4xx" || value === "5xx") return value;
  if (value && /^(?:[1-5][0-9]{2})$/.test(value)) return value;
  return "all";
}

function normalizeRange(range: string | string[] | undefined): LogTimeRange {
  const value = Array.isArray(range) ? range[0] : range;
  return value && value in rangeDurations
    ? (value as LogTimeRange)
    : "24h";
}

function normalizeText(value: string | string[] | undefined, maxLength: number) {
  const text = Array.isArray(value) ? value[0] : value;
  return text?.trim().slice(0, maxLength) ?? "";
}

export function normalizeLogFilters(searchParams: {
  status?: string | string[];
  route?: string | string[];
  q?: string | string[];
  range?: string | string[];
}): LogFilters {
  return {
    status: normalizeStatus(searchParams.status),
    route: normalizeText(searchParams.route, 255) || "all",
    q: normalizeText(searchParams.q, 200),
    range: normalizeRange(searchParams.range),
  };
}

function getMethod(metadata: Record<string, unknown>) {
  const request =
    metadata.request &&
    typeof metadata.request === "object" &&
    !Array.isArray(metadata.request)
      ? (metadata.request as Record<string, unknown>)
      : null;
  const method = metadata.method ?? request?.method;

  return typeof method === "string" && method.trim()
    ? method.trim().toUpperCase().slice(0, 12)
    : "—";
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function buildLogConditions(workspaceId: string, filters: LogFilters) {
  const conditions: SQL[] = [
    eq(event.workspaceId, workspaceId),
    gte(event.createdAt, new Date(Date.now() - rangeDurations[filters.range])),
  ];

  if (filters.status === "2xx") {
    conditions.push(gte(event.statusCode, 200), lte(event.statusCode, 299));
  } else if (filters.status === "4xx") {
    conditions.push(gte(event.statusCode, 400), lte(event.statusCode, 499));
  } else if (filters.status === "5xx") {
    conditions.push(gte(event.statusCode, 500), lte(event.statusCode, 599));
  } else if (filters.status !== "all") {
    conditions.push(eq(event.statusCode, Number(filters.status)));
  }

  if (filters.route !== "all") {
    conditions.push(eq(event.route, filters.route));
  }

  if (filters.q) {
    const escapedQuery = filters.q.replace(/[\\%_]/g, "\\$&");
    const pattern = `%${escapedQuery}%`;
    conditions.push(
      or(
        ilike(event.serviceName, pattern),
        ilike(event.route, pattern),
        ilike(event.errorMessage, pattern),
        sql`${event.metadata}::text ilike ${pattern}`,
      )!,
    );
  }

  return and(...conditions)!;
}

export async function getWorkspaceLogs(
  workspaceId: string,
  filters: LogFilters,
): Promise<WorkspaceLogsResult> {
  const whereClause = buildLogConditions(workspaceId, filters);
  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        id: event.id,
        serviceName: event.serviceName,
        route: event.route,
        statusCode: event.statusCode,
        durationMs: event.durationMs,
        errorMessage: event.errorMessage,
        metadata: event.metadata,
        createdAt: event.createdAt,
      })
      .from(event)
      .where(whereClause)
      .orderBy(desc(event.createdAt), desc(event.id))
      .limit(LOG_LIMIT),
    db.select({ value: count() }).from(event).where(whereClause),
  ]);

  return {
    events: rows.map((row) => {
      const metadata = normalizeMetadata(row.metadata);

      return {
        ...row,
        method: getMethod(metadata),
        metadata,
        createdAt: row.createdAt.toISOString(),
      };
    }),
    total: totalRow?.value ?? 0,
  };
}

export async function getWorkspaceRoutes(workspaceId: string) {
  const rows = await db
    .selectDistinct({ route: event.route })
    .from(event)
    .where(eq(event.workspaceId, workspaceId))
    .orderBy(asc(event.route))
    .limit(routeLimit);

  return rows.map((row) => row.route);
}

export async function getWorkspaceStatusCodes(workspaceId: string) {
  const rows = await db
    .selectDistinct({ statusCode: event.statusCode })
    .from(event)
    .where(eq(event.workspaceId, workspaceId))
    .orderBy(asc(event.statusCode))
    .limit(100);

  return rows.map((row) => row.statusCode);
}
