import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Braces,
  CheckCircle2,
  Clock3,
  Database,
  Filter,
  KeyRound,
  LockKeyhole,
  Search,
  ShieldCheck,
  TerminalSquare,
  TimerReset,
} from "lucide-react";

import Logo from "@/components/Logo";
import { ThemeToggler } from "@/components/theme-toggler";
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeArea } from "@/components/ui/code-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const requestExample = `await fetch("https://pulselog.ashmitbastola.com.np/api/v1/ingest", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": "pl_live_YOUR_API_KEY",
  },
  body: JSON.stringify({
    service_name: "checkout-api",
    route: "/api/orders",
    status_code: 201,
    duration_ms: 86,
    metadata: {
      method: "POST",
      region: "ap-south-1",
      request_id: "req_01J...",
    },
  }),
});`;

const acceptedResponse = `{
  "success": true,
  "eventId": "7ad8c5d4-..."
}`;

const features = [
  {
    title: "Real request analytics",
    description:
      "Track request volume, p95 latency, and 5xx error rate across the latest 24 hours.",
    icon: BarChart3,
  },
  {
    title: "Searchable event stream",
    description:
      "Filter by status, route, time range, service, errors, or deeply nested JSON metadata.",
    icon: Search,
  },
  {
    title: "Full request context",
    description:
      "Open any event to inspect its error message, stack trace, timing, and formatted JSON payload.",
    icon: Braces,
  },
  {
    title: "Isolated workspaces",
    description:
      "Better Auth sessions and ownership-scoped queries keep every workspace and credential private.",
    icon: LockKeyhole,
  },
] as const;

const flow = [
  {
    step: "01",
    title: "Create a workspace",
    description:
      "Sign up, complete onboarding, and PulseLog stores a workspace owned by your authenticated user.",
    icon: Activity,
  },
  {
    step: "02",
    title: "Issue an API key",
    description:
      "Generate a pl_live_ credential. Copy it once; only its SHA-256 hash is stored.",
    icon: KeyRound,
  },
  {
    step: "03",
    title: "Send events",
    description:
      "POST request telemetry to the Edge ingestion endpoint and explore it immediately.",
    icon: TerminalSquare,
  },
] as const;

const payloadFields = [
  ["service_name", "string", "Yes", "Service emitting the event; 1–255 characters."],
  ["route", "string", "Yes", "Normalized request route; 1–255 characters."],
  ["status_code", "integer", "Yes", "HTTP status between 100 and 599."],
  ["duration_ms", "integer", "Yes", "Non-negative request duration in milliseconds."],
  ["error_message", "string | null", "No", "Error summary, truncated to 2,000 characters."],
  ["metadata", "JSON object", "No", "Structured context with an 8 KB serialized limit."],
] as const;

const filterRows = [
  ["status", "500 or 5xx", "Exact status code or the 2xx, 4xx, and 5xx classes."],
  ["route", "/api/orders", "Exact route match."],
  ["q", "timeout", "Search service, route, error message, and JSON metadata."],
  ["range", "15m", "One of 15m, 1h, 24h, or 7d. Defaults to 24h."],
] as const;

const docsNavigation = [
  ["Quick start", "quick-start"],
  ["Ingest API", "ingest-api"],
  ["Dashboard and logs", "dashboard-logs"],
  ["Security and retention", "security-retention"],
] as const;

export function DocumentationHome() {
  return (
    <div className="min-h-svh bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="PulseLog home">
            <Logo width={32} height={32} />
            <span className="font-semibold tracking-tight">PulseLog</span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="ml-6 hidden items-center gap-5 text-sm text-fg-secondary md:flex"
          >
            <Link href="#features" className="transition-colors hover:text-fg">
              Features
            </Link>
            <Link
              href="#documentation"
              className="transition-colors hover:text-fg"
            >
              Documentation
            </Link>
            <Link href="#security-retention" className="transition-colors hover:text-fg">
              Security
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggler />
            <Button
              asChild
              variant="ghost"
              color="neutral"
              className="hidden sm:inline-flex"
            >
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Open dashboard
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--color-alpha)_1px,transparent_1px)] [background-size:24px_24px]"
          />
          <div
            aria-hidden="true"
            className="absolute -left-36 top-0 size-[30rem] rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.82fr)] lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <Badge variant="soft" color="success" className="mb-5">
                <BadgeDot />
                Developer-first API observability
              </Badge>
              <h1 className="heading-1 max-w-4xl text-balance">
                Understand every request without the observability overhead.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-fg-secondary sm:text-lg">
                PulseLog is a lightweight, multi-tenant request monitoring and
                error-tracking engine. Ingest structured events, inspect
                failures, and monitor latency from one focused dashboard.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="44">
                  <Link href="/signup">
                    Create a workspace
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="44" variant="outline" color="neutral">
                  <Link href="#documentation">
                    <BookOpen />
                    Read the documentation
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-fg-tertiary">
                {["Edge ingestion", "Shareable URL filters", "14-day retention"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-success-text" />
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <Card className="gap-0 border-alpha bg-bg/85 py-0 shadow-xl backdrop-blur-xl">
              <CardHeader className="border-b py-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TerminalSquare className="size-4 text-primary-text" />
                    Send an event
                  </CardTitle>
                  <CardDescription className="mt-1">
                    JavaScript · Edge ingestion
                  </CardDescription>
                </div>
                <Badge variant="soft" color="success" size="20">
                  HTTP 202
                </Badge>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <CodeArea
                  code={requestExample}
                  language="javascript"
                  theme="github-dark-high-contrast"
                  lineNumbers
                  className="max-h-[34rem] border border-border bg-elevation-negative"
                />
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
                Built for debugging
              </p>
              <h2 className="heading-3 mt-2 text-balance">
                The signal you need, without the noise.
              </h2>
              <p className="mt-3 text-sm leading-6 text-fg-secondary sm:text-base">
                Every screen is backed by workspace-scoped Neon queries. There
                is no sample traffic in the dashboard.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Card key={feature.title} className="gap-4 py-5 shadow-none">
                    <CardHeader className="px-5">
                      <div className="mb-2 flex size-9 items-center justify-center rounded-lg border border-primary-border bg-primary-accent text-primary-text">
                        <Icon className="size-[18px]" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="leading-6">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-fill1">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-3">
              {flow.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.step} className="relative gap-4 py-5 shadow-none">
                    <CardHeader className="px-5">
                      <div className="flex items-center justify-between">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary-accent text-primary-text">
                          <Icon className="size-[18px]" />
                        </div>
                        <span className="font-mono text-xs text-fg-tertiary">
                          {item.step}
                        </span>
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription className="leading-6">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="documentation"
          className="scroll-mt-16"
          aria-labelledby="documentation-heading"
        >
          <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
            <aside className="hidden lg:block">
              <nav
                aria-label="Documentation sections"
                className="sticky top-24 space-y-1"
              >
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-fg-tertiary">
                  On this page
                </p>
                {docsNavigation.map(([label, id]) => (
                  <Link
                    key={id}
                    href={`#${id}`}
                    className="block rounded-lg px-3 py-2 text-sm text-fg-secondary transition-colors hover:bg-fill1 hover:text-fg"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 max-w-5xl space-y-20">
              <div>
                <Badge variant="soft" color="primary">
                  Documentation
                </Badge>
                <h2 id="documentation-heading" className="heading-2 mt-3">
                  Get PulseLog running
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-fg-secondary">
                  This guide covers the complete path from creating an account
                  to ingesting, filtering, and retaining production events.
                </p>
              </div>

              <article id="quick-start" className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary-accent text-primary-text">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-fg-tertiary">01</p>
                    <h3 className="heading-5">Quick start</h3>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Create an account", "Sign up and verify your email, or use a configured OAuth provider."],
                    ["Complete onboarding", "Choose a use case and create a private workspace."],
                    ["Generate a key", "Open API Keys, create a named credential, and copy it once."],
                    ["Send telemetry", "Call the ingest endpoint and refresh Overview or Logs."],
                  ].map(([title, description], index) => (
                    <Card key={title} className="gap-3 py-5 shadow-none">
                      <CardHeader className="px-5">
                        <Badge variant="soft" color="neutral" size="20">
                          Step {index + 1}
                        </Badge>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription className="leading-6">
                          {description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </article>

              <article id="ingest-api" className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-info-accent text-info-text">
                    <TerminalSquare className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-fg-tertiary">02</p>
                    <h3 className="heading-5">Ingest API</h3>
                  </div>
                </div>
                <p className="mb-5 max-w-3xl text-sm leading-6 text-fg-secondary">
                  Send a JSON object to{" "}
                  <code className="rounded bg-fill2 px-1.5 py-0.5 font-mono text-xs text-fg">
                    POST /api/v1/ingest
                  </code>
                  . Include the raw API key in the{" "}
                  <code className="rounded bg-fill2 px-1.5 py-0.5 font-mono text-xs text-fg">
                    x-api-key
                  </code>{" "}
                  header. The key determines the destination workspace.
                </p>

                <Card className="gap-0 py-0 shadow-none">
                  <CardHeader className="border-b py-4">
                    <CardTitle>Request body</CardTitle>
                    <CardDescription>
                      Content-Type: application/json
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead className="hidden sm:table-cell">Type</TableHead>
                          <TableHead className="w-20">Required</TableHead>
                          <TableHead className="hidden md:table-cell">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payloadFields.map(([field, type, required, description]) => (
                          <TableRow key={field}>
                            <TableCell className="font-mono text-xs">{field}</TableCell>
                            <TableCell className="hidden font-mono text-xs text-fg-secondary sm:table-cell">
                              {type}
                            </TableCell>
                            <TableCell>{required}</TableCell>
                            <TableCell className="hidden text-fg-secondary md:table-cell">
                              {description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.55fr)]">
                  <Card className="gap-0 py-0 shadow-none">
                    <CardHeader className="border-b py-4">
                      <CardTitle>JavaScript example</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <CodeArea
                        code={requestExample}
                        language="javascript"
                        theme="github-dark-high-contrast"
                        lineNumbers
                        className="max-h-[36rem] border border-border bg-elevation-negative"
                      />
                    </CardContent>
                  </Card>
                  <Card className="gap-0 py-0 shadow-none">
                    <CardHeader className="border-b py-4">
                      <CardTitle>Accepted response</CardTitle>
                      <CardDescription>HTTP 202</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3">
                      <CodeArea
                        code={acceptedResponse}
                        language="json"
                        theme="github-dark-high-contrast"
                        className="border border-border bg-elevation-negative"
                      />
                    </CardContent>
                  </Card>
                </div>

                <Alert color="warning" variant="soft-outline" className="mt-5">
                  <AlertIcon>
                    <ShieldCheck />
                  </AlertIcon>
                  <AlertContent>
                    <AlertTitle>Payload guardrails</AlertTitle>
                    <AlertDescription>
                      Metadata over 8,192 bytes is rejected with HTTP 413.
                      Error messages are safely truncated to 2,000 Unicode
                      characters before storage.
                    </AlertDescription>
                  </AlertContent>
                </Alert>
              </article>

              <article id="dashboard-logs" className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-success-accent text-success-text">
                    <Filter className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-fg-tertiary">03</p>
                    <h3 className="heading-5">Dashboard and logs</h3>
                  </div>
                </div>
                <p className="mb-5 max-w-3xl text-sm leading-6 text-fg-secondary">
                  Overview calculates request count, p95 latency, 5xx error
                  rate, and hourly 2xx/4xx/5xx buckets from the latest 24 hours.
                  Logs are ordered newest first and limited to 100 rows per
                  query.
                </p>
                <Card className="gap-0 py-0 shadow-none">
                  <CardHeader className="border-b py-4">
                    <CardTitle>Shareable log filters</CardTitle>
                    <CardDescription>
                      Filters are encoded in the URL and evaluated by the server.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parameter</TableHead>
                          <TableHead>Example</TableHead>
                          <TableHead className="hidden sm:table-cell">Behavior</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterRows.map(([parameter, example, behavior]) => (
                          <TableRow key={parameter}>
                            <TableCell className="font-mono text-xs">{parameter}</TableCell>
                            <TableCell className="font-mono text-xs text-primary-text">
                              {example}
                            </TableCell>
                            <TableCell className="hidden text-fg-secondary sm:table-cell">
                              {behavior}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <p className="mt-4 break-all rounded-xl border border-border bg-fill1 p-4 font-mono text-xs text-fg-secondary">
                  /&lt;workspaceId&gt;/logs?status=5xx&amp;route=%2Fapi%2Forders&amp;q=timeout&amp;range=24h
                </p>
              </article>

              <article id="security-retention" className="scroll-mt-24">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-error-accent text-error-text">
                    <LockKeyhole className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-fg-tertiary">04</p>
                    <h3 className="heading-5">Security and retention</h3>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="gap-4 py-5 shadow-none">
                    <CardHeader className="px-5">
                      <ShieldCheck className="size-5 text-success-text" />
                      <CardTitle>Tenant isolation</CardTitle>
                      <CardDescription className="leading-6">
                        Every dashboard read and mutation validates the Better
                        Auth user against the workspace owner. API keys can
                        ingest only into their associated workspace.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="gap-4 py-5 shadow-none">
                    <CardHeader className="px-5">
                      <KeyRound className="size-5 text-primary-text" />
                      <CardTitle>One-time credentials</CardTitle>
                      <CardDescription className="leading-6">
                        API keys contain 192 bits of random entropy. Only a
                        SHA-256 hash is stored, and revocation deletes the
                        credential immediately.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="gap-4 py-5 shadow-none">
                    <CardHeader className="px-5">
                      <TimerReset className="size-5 text-warning-text" />
                      <CardTitle>Automatic retention</CardTitle>
                      <CardDescription className="leading-6">
                        The cleanup job removes events older than 14 days and
                        retains no more than the newest 50,000 events in each
                        workspace.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="gap-4 py-5 shadow-none">
                    <CardHeader className="px-5">
                      <Clock3 className="size-5 text-info-text" />
                      <CardTitle>Scheduled cleanup</CardTitle>
                      <CardDescription className="leading-6">
                        Vercel invokes the protected cleanup endpoint daily at
                        03:00 UTC using the CRON_SECRET bearer token.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-fill1">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <h2 className="heading-5">Ready to inspect your first request?</h2>
              <p className="mt-2 text-sm text-fg-secondary">
                Create a workspace, issue a key, and start sending structured events.
              </p>
            </div>
            <Button asChild size="44">
              <Link href="/signup">
                Get started
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-8 text-xs text-fg-tertiary sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Logo width={24} height={24} />
            <span>PulseLog · Developer-first API observability</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#documentation" className="hover:text-fg">
              Documentation
            </Link>
            <Link href="/signin" className="hover:text-fg">
              Sign in
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <Database className="size-3.5" />
              Powered by Neon
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
