import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { event } from "@/db/schema";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RETENTION_DAYS = 14;
const MAX_EVENTS_PER_WORKSPACE = 50_000;

type DeletedCountRow = {
  deleted_count: number | string;
};

function readDeletedCount(result: { rows: unknown[] }) {
  const row = result.rows[0] as DeletedCountRow | undefined;
  return Number(row?.deleted_count ?? 0);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret) {
    return NextResponse.json(
      { purged: false, error: "Cron is not configured" },
      { status: 500 },
    );
  }

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { purged: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const retentionResult = await db.execute(sql`
      with deleted as (
        delete from ${event}
        where ${event.createdAt} < now() - (${RETENTION_DAYS} * interval '1 day')
        returning ${event.id}
      )
      select count(*)::int as deleted_count from deleted
    `);

    const capResult = await db.execute(sql`
      with ranked as (
        select
          ${event.id} as id,
          row_number() over (
            partition by ${event.workspaceId}
            order by ${event.createdAt} desc, ${event.id} desc
          ) as row_position
        from ${event}
      ),
      deleted as (
        delete from ${event}
        using ranked
        where ${event.id} = ranked.id
          and ranked.row_position > ${MAX_EVENTS_PER_WORKSPACE}
        returning ${event.id}
      )
      select count(*)::int as deleted_count from deleted
    `);

    const retentionDeleted = readDeletedCount(retentionResult);
    const excessDeleted = readDeletedCount(capResult);

    return NextResponse.json({
      purged: true,
      deletedCount: retentionDeleted + excessDeleted,
      retentionDeleted,
      excessDeleted,
      retentionDays: RETENTION_DAYS,
      maxEventsPerWorkspace: MAX_EVENTS_PER_WORKSPACE,
    });
  } catch {
    return NextResponse.json(
      { purged: false, error: "Cleanup failed" },
      { status: 500 },
    );
  }
}
