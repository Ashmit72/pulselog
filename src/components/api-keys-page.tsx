"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  KeyRound,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { createApiKey, deleteApiKey } from "@/actions/api-keys";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeArea } from "@/components/ui/code-area";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyAction,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input, InputWrapper } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ApiKeyItem = {
  id: string;
  name: string;
  createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function createCurlSnippet(ingestUrl: string) {
  return `curl --request POST \\
  --url ${ingestUrl} \\
  --header 'content-type: application/json' \\
  --header 'x-api-key: pl_live_YOUR_API_KEY' \\
  --data '{
    "service_name": "checkout-api",
    "route": "/api/orders",
    "status_code": 201,
    "duration_ms": 86,
    "metadata": {
      "method": "POST",
      "region": "us-east-1"
    }
  }'`;
}

export function ApiKeysPage({
  workspaceId,
  ingestUrl,
  keys,
}: {
  workspaceId: string;
  ingestUrl: string;
  keys: ApiKeyItem[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const curlSnippet = createCurlSnippet(ingestUrl);
  const revokeKeyItem = keys.find((key) => key.id === revokeId);

  function handleDialogChange(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setKeyName("");
      setRawKey(null);
      setCreateError(null);
      setCopiedKey(false);
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = keyName.trim();

    if (trimmedName.length < 2 || isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createApiKey(workspaceId, trimmedName);

      if (!result.success) {
        setCreateError(result.error);
        return;
      }

      setRawKey(result.secret);
      setKeyName("");
      toast.success("API key created");
      router.refresh();
    } catch {
      setCreateError("We could not create the API key. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  }

  async function copyRawKey() {
    if (!rawKey) return;
    await copyText(rawKey, "API key");
    setCopiedKey(true);
    window.setTimeout(() => setCopiedKey(false), 1_600);
  }

  async function revokeKey() {
    if (!revokeId || isRevoking) return;

    setIsRevoking(true);

    try {
      const result = await deleteApiKey(revokeId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("API key revoked");
      router.refresh();
    } catch {
      toast.error("We could not revoke the API key. Please try again.");
    } finally {
      setIsRevoking(false);
      setRevokeId(null);
    }
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <WorkspacePageHeader
          title="API Keys"
          description="Create and revoke credentials used to send telemetry into this workspace."
          icon={KeyRound}
          actions={
            <DialogTrigger asChild>
              <Button size="36">
                <Plus />
                Create new key
              </Button>
            </DialogTrigger>
          }
        />

        <DialogContent
          onEscapeKeyDown={(event) => {
            if (rawKey) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (rawKey) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {rawKey ? "Save your API key" : "Generate API key"}
            </DialogTitle>
            <DialogDescription>
              {rawKey
                ? "Copy this credential now before closing the dialog."
                : "Name the key so you know which integration uses it."}
            </DialogDescription>
          </DialogHeader>

          {rawKey ? (
            <>
              <DialogBody className="space-y-4">
                <Alert color="warning" variant="soft-outline">
                  <AlertIcon>
                    <ShieldAlert />
                  </AlertIcon>
                  <AlertContent>
                    <AlertTitle>This key will never be shown again</AlertTitle>
                    <AlertDescription>
                      PulseLog stores only its SHA-256 hash. Save the key before
                      closing this window.
                    </AlertDescription>
                  </AlertContent>
                </Alert>
                <div className="space-y-1.5">
                  <Label htmlFor="generated-api-key">Your new API key</Label>
                  <InputWrapper size="44" className="font-mono">
                    <Input
                      id="generated-api-key"
                      value={rawKey}
                      readOnly
                      aria-label="Generated API key"
                    />
                    <IconButton
                      aria-label="Copy generated API key"
                      variant="ghost"
                      color="neutral"
                      size="32"
                      onClick={copyRawKey}
                    >
                      {copiedKey ? <Check /> : <Copy />}
                    </IconButton>
                  </InputWrapper>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button onClick={() => handleDialogChange(false)}>
                  I&apos;ve saved the key
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleGenerate}>
              <DialogBody className="space-y-4">
                {createError ? (
                  <Alert color="error" variant="soft-outline">
                    <AlertIcon>
                      <ShieldAlert />
                    </AlertIcon>
                    <AlertContent>
                      <AlertTitle>API key could not be created</AlertTitle>
                      <AlertDescription>{createError}</AlertDescription>
                    </AlertContent>
                  </Alert>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="key-name">Key name</Label>
                  <Input
                    id="key-name"
                    value={keyName}
                    onChange={(event) => setKeyName(event.target.value)}
                    placeholder="Production API"
                    size="44"
                    minLength={2}
                    maxLength={60}
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs leading-5 text-fg-tertiary">
                    Use a descriptive name such as the environment or service.
                  </p>
                </div>
              </DialogBody>
              <DialogFooter className="flex-col-reverse sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  disabled={isCreating}
                  onClick={() => handleDialogChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isCreating}
                  disabled={keyName.trim().length < 2 || isCreating}
                >
                  Generate key
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <div>
              <CardTitle>Active keys</CardTitle>
              <CardDescription className="mt-1">
                {keys.length} credential{keys.length === 1 ? "" : "s"} can
                ingest data.
              </CardDescription>
            </div>
            <CardAction>
              <Badge
                variant="soft"
                color={keys.length > 0 ? "success" : "neutral"}
              >
                {keys.length > 0 ? "Active" : "No keys"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {keys.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Created
                    </TableHead>
                    <TableHead className="w-14" aria-label="Key actions" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="mt-1 text-xs text-fg-tertiary sm:hidden">
                            Created {dateFormatter.format(new Date(key.createdAt))}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-fg-secondary sm:table-cell">
                        {dateFormatter.format(new Date(key.createdAt))}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <IconButton
                              aria-label={`Actions for ${key.name}`}
                              variant="ghost"
                              color="neutral"
                              size="32"
                            >
                              <MoreHorizontal />
                            </IconButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              className="text-error-text focus:bg-error-accent"
                              onSelect={() => setRevokeId(key.id)}
                            >
                              <Trash2 />
                              Revoke key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty className="min-h-56 px-5 py-10">
                <EmptyMedia variant="icon">
                  <KeyRound />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No active API keys</EmptyTitle>
                  <EmptyDescription>
                    Generate a key to authenticate your first ingest request.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyAction>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus />
                    Create API key
                  </Button>
                </EmptyAction>
              </Empty>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b py-5">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TerminalSquare className="size-4 text-primary-text" />
                Developer quickstart
              </CardTitle>
              <CardDescription className="mt-1">
                Send your first event with a single HTTP request.
              </CardDescription>
            </div>
            <CardAction>
              <Button
                variant="outline"
                color="neutral"
                size="32"
                onClick={() => copyText(curlSnippet, "cURL snippet")}
              >
                <Copy />
                Copy
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <CodeArea
              code={curlSnippet}
              language="bash"
              theme="github-dark-high-contrast"
              lineNumbers
              className="max-h-[26rem] border border-border bg-elevation-negative"
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={revokeId !== null}
        onOpenChange={(open) => {
          if (!open && !isRevoking) setRevokeId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeKeyItem
                ? `Services using “${revokeKeyItem.name}” will immediately stop sending logs.`
                : "Services using this key will immediately stop sending logs."}{" "}
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                color="neutral"
                disabled={isRevoking}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                color="error"
                loading={isRevoking}
                disabled={isRevoking}
                onClick={revokeKey}
              >
                Revoke key
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
