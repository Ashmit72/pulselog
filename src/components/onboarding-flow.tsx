"use client";

import { useActionState, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleAlert,
  LockKeyhole,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";

import {
  createWorkspace,
  type CreateWorkspaceState,
} from "@/app/onboarding/actions";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, InputAddon, InputGroup } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

const initialState: CreateWorkspaceState = {};

const usageOptions = [
  {
    value: "personal",
    title: "For myself",
    description: "Monitor a side project or learn the PulseLog workflow.",
    icon: UserRound,
  },
  {
    value: "team",
    title: "For my engineering team",
    description: "Debug incidents together and keep services healthy.",
    icon: UsersRound,
  },
  {
    value: "company",
    title: "For my company",
    description: "Standardize observability across products and services.",
    icon: Building2,
  },
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo width={34} height={34} />
      <span className="text-base font-semibold tracking-tight">PulseLog</span>
    </div>
  );
}

function VisualPanel() {
  return (
    <aside className="relative hidden min-h-[720px] overflow-hidden border-r border-border bg-fill1 lg:flex lg:flex-col lg:p-8 xl:p-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 [background-image:radial-gradient(var(--color-alpha)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-32 top-12 size-96 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-28 right-0 size-80 rounded-full bg-info/10 blur-3xl"
      />

      <div className="relative z-10">
        <Brand />
      </div>

      <div className="relative z-10 my-auto mx-auto w-full max-w-xl">
        <div className="mb-7 max-w-md">
          <Badge variant="soft" color="success" className="mb-4">
            <BadgeDot />
            Ingest pipeline ready
          </Badge>
          <h2 className="heading-4 text-balance">
            See every request. Fix what matters.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-fg-secondary">
            Your workspace keeps logs, latency, and errors in one fast,
            developer-friendly stream.
          </p>
        </div>

        <Card className="gap-0 border-alpha bg-bg/80 py-0 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Activity className="size-4 text-primary-text" />
              Live requests
            </div>
            <Badge variant="soft" color="success" size="20">
              <BadgeDot />
              Streaming
            </Badge>
          </div>
          <div className="space-y-1.5 p-2 font-mono text-xs">
            {[
              ["POST", "/api/v1/checkout", "201", "86ms", "success"],
              ["GET", "/api/v1/users/:id", "200", "42ms", "success"],
              ["POST", "/api/v1/webhooks", "500", "321ms", "error"],
              ["GET", "/health", "200", "8ms", "success"],
            ].map(([method, route, status, duration, state]) => (
              <div
                key={`${method}-${route}`}
                className="grid grid-cols-[46px_minmax(0,1fr)_38px_42px] items-center gap-2 rounded-lg px-3 py-2.5 text-fg-secondary odd:bg-fill1-alpha"
              >
                <span className="text-fg">{method}</span>
                <span className="truncate">{route}</span>
                <span
                  className={cn(
                    "font-semibold",
                    state === "error" ? "text-error-text" : "text-success-text",
                  )}
                >
                  {status}
                </span>
                <span className="text-right">{duration}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 border-t border-border">
            {[
              ["Requests", "24.8k"],
              ["p95 latency", "118ms"],
              ["Error rate", "0.82%"],
            ].map(([label, value]) => (
              <div key={label} className="border-r border-border p-3 last:border-r-0">
                <p className="text-[11px] text-fg-tertiary">{label}</p>
                <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="relative z-10 flex items-center gap-2 text-xs text-fg-tertiary">
        <LockKeyhole className="size-3.5" />
        Workspace data is isolated and encrypted in transit.
      </p>
    </aside>
  );
}

export function OnboardingFlow({ userName }: { userName?: string | null }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [usage, setUsage] = useState("team");
  const [workspaceName, setWorkspaceName] = useState(
    userName ? `${userName.split(" ")[0]}'s workspace` : "",
  );
  const [state, formAction, pending] = useActionState(
    createWorkspace,
    initialState,
  );
  const slug = useMemo(
    () => slugify(workspaceName) || "your-workspace",
    [workspaceName],
  );

  return (
    <main className="flex min-h-svh items-center justify-center bg-fill1 p-0 sm:p-4 lg:p-6">
      <Card className="grid min-h-svh w-full max-w-[1480px] grid-cols-1 gap-0 rounded-none border-0 bg-bg py-0 shadow-none sm:min-h-[calc(100svh-2rem)] sm:rounded-2xl sm:border sm:border-border sm:shadow-xl lg:min-h-[min(900px,calc(100svh-3rem))] lg:grid-cols-[minmax(420px,0.96fr)_minmax(520px,1.04fr)]">
        <VisualPanel />

        <section className="relative flex min-w-0 flex-col">
          <div className="relative overflow-hidden border-b border-border bg-fill1 px-5 py-4 lg:hidden">
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-20 size-44 rounded-full bg-primary/25 blur-3xl"
            />
            <div className="relative flex items-center justify-between">
              <Brand />
              <Badge variant="soft" color="success" size="20">
                <BadgeDot />
                Ready
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 pt-6 sm:px-10 lg:px-14 lg:pt-9 xl:px-20">
            <Progress value={step * 50} aria-label={`Step ${step} of 2`} />
            <span className="shrink-0 text-xs font-medium text-fg-secondary">
              {step} / 2
            </span>
          </div>

          <div className="flex flex-1 items-center px-5 py-7 sm:px-10 sm:py-10 lg:px-14 xl:px-20">
            <div className="mx-auto w-full max-w-[500px]">
              <div className="mb-8">
                <div className="mb-5 hidden size-10 items-center justify-center rounded-xl bg-primary-accent text-primary-text lg:flex">
                  {step === 1 ? (
                    <Zap className="size-5" />
                  ) : (
                    <Activity className="size-5" />
                  )}
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
                  Workspace setup
                </p>
                <h1 className="heading-5 text-balance">
                  {step === 1
                    ? "How will you use PulseLog?"
                    : "Create your first workspace"}
                </h1>
                <p className="mt-2 text-sm leading-6 text-fg-secondary sm:text-base">
                  {step === 1
                    ? "We’ll tailor the starting experience to how you monitor your services."
                    : "This is the shared home for your services, logs, and API keys."}
                </p>
              </div>

              {step === 1 ? (
                <div>
                  <RadioGroup
                    value={usage}
                    onValueChange={setUsage}
                    aria-label="How you will use PulseLog"
                  >
                    {usageOptions.map((option) => {
                      const Icon = option.icon;
                      const selected = usage === option.value;

                      return (
                        <Label
                          key={option.value}
                          htmlFor={`usage-${option.value}`}
                          className={cn(
                            "group flex cursor-pointer items-start gap-3 rounded-xl border bg-bg p-3.5 transition-colors sm:p-4",
                            selected
                              ? "border-primary-border bg-primary-accent/30"
                              : "border-border hover:bg-fill1",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border",
                              selected
                                ? "border-primary-border bg-primary-accent text-primary-text"
                                : "border-border bg-fill1 text-fg-secondary",
                            )}
                          >
                            <Icon className="size-4.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-fg">
                              {option.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-fg-secondary sm:text-sm">
                              {option.description}
                            </span>
                          </span>
                          <RadioGroupItem
                            id={`usage-${option.value}`}
                            value={option.value}
                            className="mt-1"
                          />
                        </Label>
                      );
                    })}
                  </RadioGroup>

                  <Button
                    size="44"
                    className="mt-6 w-full"
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ArrowRight />
                  </Button>
                </div>
              ) : (
                <form action={formAction} className="space-y-5">
                  <input type="hidden" name="usage" value={usage} />

                  {state.error ? (
                    <Alert color="error" variant="soft">
                      <AlertIcon>
                        <CircleAlert />
                      </AlertIcon>
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="space-y-1.5">
                    <Label htmlFor="workspace-name">Workspace name</Label>
                    <Input
                      id="workspace-name"
                      name="name"
                      size="44"
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                      placeholder="Acme Engineering"
                      minLength={2}
                      maxLength={60}
                      autoComplete="organization"
                      required
                    />
                    <p className="text-xs leading-5 text-fg-tertiary">
                      You can rename this workspace later in Settings.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="workspace-slug">Workspace slug</Label>
                    <InputGroup>
                      <InputAddon size="44">pulse/</InputAddon>
                      <Input
                        id="workspace-slug"
                        size="44"
                        value={slug}
                        readOnly
                        aria-label="Generated workspace URL"
                      />
                    </InputGroup>
                    <p className="text-xs leading-5 text-fg-tertiary">
                      Saved as the workspace&apos;s stable human-readable identifier.
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-fill1 p-3.5">
                    <div className="flex gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-accent text-success-text">
                        <Check className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Free workspace included</p>
                        <p className="mt-0.5 text-xs leading-5 text-fg-secondary">
                          Start ingesting immediately. No credit card required.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      color="neutral"
                      size="44"
                      className="w-full sm:w-auto"
                      onClick={() => setStep(1)}
                      disabled={pending}
                    >
                      <ArrowLeft />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="44"
                      className="w-full sm:flex-1"
                      loading={pending}
                      disabled={pending || workspaceName.trim().length < 2}
                    >
                      Create workspace
                      {!pending ? <ArrowRight /> : null}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="px-5 pb-6 text-center text-xs text-fg-tertiary sm:px-10 lg:px-14 xl:px-20">
            Need a hand? Contact support@pulselog.dev
          </div>
        </section>
      </Card>
    </main>
  );
}
