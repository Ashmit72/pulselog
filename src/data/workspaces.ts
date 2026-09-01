import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  workspace,
  type WorkspaceUseCase,
} from "@/db/schema";

export type OwnedWorkspace = {
  id: string;
  name: string;
  slug: string;
  useCase: WorkspaceUseCase;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function createWorkspaceSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 63) || "workspace"
  );
}

export async function listOwnedWorkspaces(ownerId: string) {
  return db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      useCase: workspace.useCase,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    })
    .from(workspace)
    .where(eq(workspace.ownerId, ownerId))
    .orderBy(asc(workspace.createdAt));
}

export async function getOwnedWorkspace(ownerId: string, workspaceId: string) {
  const [ownedWorkspace] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      useCase: workspace.useCase,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    })
    .from(workspace)
    .where(
      and(
        eq(workspace.id, workspaceId),
        eq(workspace.ownerId, ownerId),
      ),
    )
    .limit(1);

  return ownedWorkspace ?? null;
}

export async function createOwnedWorkspace({
  ownerId,
  name,
  useCase,
}: {
  ownerId: string;
  name: string;
  useCase: WorkspaceUseCase;
}) {
  const baseSlug = createWorkspaceSlug(name);
  const existingSlugs = await db
    .select({ slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.ownerId, ownerId));
  const unavailableSlugs = new Set(existingSlugs.map((item) => item.slug));
  let slug = baseSlug;
  let suffix = 2;

  while (unavailableSlugs.has(slug)) {
    const suffixText = `-${suffix}`;
    slug = `${baseSlug.slice(0, 63 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  const [createdWorkspace] = await db
    .insert(workspace)
    .values({
      name,
      slug,
      useCase,
      ownerId,
    })
    .returning({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    });

  return createdWorkspace ?? null;
}

export async function renameOwnedWorkspace({
  ownerId,
  workspaceId,
  name,
}: {
  ownerId: string;
  workspaceId: string;
  name: string;
}) {
  const [updatedWorkspace] = await db
    .update(workspace)
    .set({ name, updatedAt: new Date() })
    .where(
      and(
        eq(workspace.id, workspaceId),
        eq(workspace.ownerId, ownerId),
      ),
    )
    .returning({ id: workspace.id });

  return updatedWorkspace ?? null;
}

export async function deleteOwnedWorkspace({
  ownerId,
  workspaceId,
}: {
  ownerId: string;
  workspaceId: string;
}) {
  const [deletedWorkspace] = await db
    .delete(workspace)
    .where(
      and(
        eq(workspace.id, workspaceId),
        eq(workspace.ownerId, ownerId),
      ),
    )
    .returning({ id: workspace.id });

  return deletedWorkspace ?? null;
}
