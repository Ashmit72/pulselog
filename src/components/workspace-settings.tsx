"use client";

import { useActionState, useEffect, useState } from "react";
import {
  CalendarClock,
  Check,
  Copy,
  Database,
  Settings,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteWorkspace,
  updateWorkspaceName,
  type WorkspaceActionState,
} from "@/app/(dashboard)/[workspaceId]/settings/actions";
import { WorkspacePageHeader } from "@/components/workspace-page-header";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, InputWrapper } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialActionState: WorkspaceActionState = {};

export function WorkspaceSettings({
  workspaceId,
  workspaceName,
  createdAt,
}: {
  workspaceId: string;
  workspaceName: string;
  createdAt: string;
}) {
  const [name, setName] = useState(workspaceName);
  const [confirmation, setConfirmation] = useState("");
  const [copied, setCopied] = useState(false);
  const [renameState, renameAction, renamePending] = useActionState(
    updateWorkspaceName,
    initialActionState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteWorkspace,
    initialActionState,
  );

  useEffect(() => {
    if (renameState.success) toast.success(renameState.success);
    if (renameState.error) toast.error(renameState.error);
  }, [renameState]);

  useEffect(() => {
    if (deleteState.error) toast.error(deleteState.error);
  }, [deleteState]);

  async function copyWorkspaceId() {
    try {
      await navigator.clipboard.writeText(workspaceId);
      setCopied(true);
      toast.success("Workspace ID copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy workspace ID");
    }
  }

  return (
    <>
      <WorkspacePageHeader
        title="Settings"
        description="Manage workspace identity, retention, and destructive actions."
        icon={Settings}
      />

      <div className="space-y-6">
        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <div>
              <CardTitle>General</CardTitle>
              <CardDescription className="mt-1">
                Workspace details visible to everyone on your team.
              </CardDescription>
            </div>
            <CardAction>
              <Badge variant="soft" color="primary">Owner only</Badge>
            </CardAction>
          </CardHeader>
          <form action={renameAction}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <CardContent className="grid gap-5 py-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="settings-workspace-name">Workspace name</Label>
                <Input
                  id="settings-workspace-name"
                  name="name"
                  size="40"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={60}
                  required
                />
                <p className="text-xs leading-5 text-fg-tertiary">
                  Used throughout navigation, reports, and alerts.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settings-workspace-id">Workspace ID</Label>
                <InputWrapper size="40" className="font-mono">
                  <Input
                    id="settings-workspace-id"
                    value={workspaceId}
                    readOnly
                    aria-label="Workspace ID"
                  />
                  <IconButton
                    type="button"
                    aria-label="Copy workspace ID"
                    variant="ghost"
                    color="neutral"
                    size="32"
                    onClick={copyWorkspaceId}
                  >
                    {copied ? <Check /> : <Copy />}
                  </IconButton>
                </InputWrapper>
                <p className="text-xs leading-5 text-fg-tertiary">
                  Created {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(createdAt))}
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t py-4">
              <Button
                type="submit"
                size="36"
                loading={renamePending}
                disabled={
                  renamePending ||
                  name.trim().length < 2 ||
                  name.trim() === workspaceName
                }
              >
                Save changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <div>
              <CardTitle>Data retention</CardTitle>
              <CardDescription className="mt-1">
                Storage policy for the PulseLog free tier.
              </CardDescription>
            </div>
            <CardAction>
              <Badge variant="soft" color="success">Automatic</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-5 py-5">
            <Alert color="info" variant="soft-outline">
              <AlertIcon>
                <CalendarClock />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>Logs are retained for 14 days</AlertTitle>
                <AlertDescription>
                  Events older than 14 days are automatically removed to keep storage fast and predictable.
                </AlertDescription>
              </AlertContent>
            </Alert>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Retention window", value: "14 days", icon: Database },
                { label: "Cleanup schedule", value: "Daily", icon: CalendarClock },
                { label: "Transport", value: "Encrypted", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg border border-border bg-fill1 p-4">
                    <Icon className="size-4 text-fg-tertiary" />
                    <p className="mt-3 text-xs text-fg-secondary">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-error-border py-0 shadow-none">
          <CardHeader className="border-b border-error-border py-5">
            <div>
              <CardTitle className="text-error-text">Danger zone</CardTitle>
              <CardDescription className="mt-1">
                Destructive actions for this workspace.
              </CardDescription>
            </div>
            <CardAction>
              <TriangleAlert className="size-5 text-error-text" />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Delete workspace</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-fg-secondary sm:text-sm">
                Permanently delete this workspace, its API keys, and all ingested logs. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" color="error" className="shrink-0">
                  <Trash2 />
                  Delete workspace
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <form action={deleteAction}>
                  <input type="hidden" name="workspaceId" value={workspaceId} />
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {workspaceName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes all workspace data. Enter the workspace name to confirm.
                    </AlertDialogDescription>
                    <div className="space-y-1.5 pt-3">
                      <Label htmlFor="delete-confirmation">
                        Type <span className="font-mono text-fg">{workspaceName}</span>
                      </Label>
                      <Input
                        id="delete-confirmation"
                        name="confirmation"
                        value={confirmation}
                        onChange={(event) => setConfirmation(event.target.value)}
                        autoComplete="off"
                        placeholder={workspaceName}
                      />
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                      <Button type="button" variant="outline" color="neutral">
                        Cancel
                      </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        type="submit"
                        color="error"
                        loading={deletePending}
                        disabled={deletePending || confirmation !== workspaceName}
                      >
                        Delete permanently
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
