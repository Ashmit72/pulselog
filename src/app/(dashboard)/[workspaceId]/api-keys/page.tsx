import { desc, eq } from "drizzle-orm";

import { ApiKeysPage } from "@/components/api-keys-page";
import { db } from "@/db";
import { apiKey } from "@/db/schema";
import { getWorkspaceContext } from "@/lib/workspace-helpers";

export default async function WorkspaceApiKeysPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  await getWorkspaceContext(workspaceId);
  const keys = await db
    .select({
      id: apiKey.id,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
    })
    .from(apiKey)
    .where(eq(apiKey.workspaceId, workspaceId))
    .orderBy(desc(apiKey.createdAt));
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  return (
    <ApiKeysPage
      workspaceId={workspaceId}
      ingestUrl={`${appUrl}/api/v1/ingest`}
      keys={keys.map((key) => ({
        ...key,
        createdAt: key.createdAt.toISOString(),
      }))}
    />
  );
}
