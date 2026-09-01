"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  Gauge,
  TriangleAlert,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyAction,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  TimeSeriesPoint,
  WorkspaceStats,
} from "@/lib/queries/analytics";
import { cn } from "@/lib/utils";

const chartConfig = {
  successful: {
    label: "2xx success",
    color: "var(--color-success)",
  },
  clientErrors: {
    label: "4xx client error",
    color: "var(--color-warning)",
  },
  serverErrors: {
    label: "5xx server error",
    color: "var(--color-error)",
  },
} satisfies ChartConfig;

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  iconClassName: string;
};

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <Card className="gap-4 py-5 shadow-none">
      <CardHeader className="grid grid-cols-[1fr_auto] gap-3 px-5">
        <div>
          <CardDescription className="font-medium">
            {metric.label}
          </CardDescription>
          <CardTitle className="mt-2 text-[1.75rem] leading-none tabular-nums">
            {metric.value}
          </CardTitle>
        </div>
        <CardAction
          className={cn(
            "flex size-9 items-center justify-center rounded-lg border",
            metric.iconClassName,
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </CardAction>
      </CardHeader>
      <CardContent className="px-5">
        <span className="text-xs text-fg-tertiary">{metric.detail}</span>
      </CardContent>
    </Card>
  );
}

function EmptyAnalytics({ workspaceId }: { workspaceId: string }) {
  return (
    <Card className="py-0 shadow-none">
      <Empty className="min-h-[420px] px-5 py-14 sm:min-h-[480px]">
        <EmptyMedia variant="icon">
          <ChartNoAxesColumnIncreasing />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle id="analytics-heading">Nothing here yet</EmptyTitle>
          <EmptyDescription>
            Send your first event to PulseLog and request volume, latency, and
            errors will appear here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyAction>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/${workspaceId}/api-keys`}>
              Get started
              <ArrowRight />
            </Link>
          </Button>
        </EmptyAction>
      </Empty>
    </Card>
  );
}

export function AnalyticsOverview({
  workspaceId,
  stats,
  timeSeries,
}: {
  workspaceId: string;
  stats: WorkspaceStats;
  timeSeries: TimeSeriesPoint[];
}) {
  if (stats.totalRequests === 0) {
    return (
      <section aria-labelledby="analytics-heading">
        <EmptyAnalytics workspaceId={workspaceId} />
      </section>
    );
  }

  const serviceLabel = stats.serviceCount === 1 ? "service" : "services";
  const metrics: Metric[] = [
    {
      label: "Total requests",
      value: compactNumber.format(stats.totalRequests),
      detail: `Across ${stats.serviceCount} ${serviceLabel} · last 24h`,
      icon: Activity,
      iconClassName:
        "border-primary-border bg-primary-accent text-primary-text",
    },
    {
      label: "P95 latency",
      value: `${Math.round(stats.p95LatencyMs)} ms`,
      detail: "95th percentile · last 24h",
      icon: Gauge,
      iconClassName: "border-info-border bg-info-accent text-info-text",
    },
    {
      label: "Error rate",
      value: `${stats.errorRate.toFixed(2)}%`,
      detail: "HTTP 5xx responses · last 24h",
      icon: TriangleAlert,
      iconClassName: "border-error-border bg-error-accent text-error-text",
    },
  ];
  const chartData = timeSeries.map((point) => ({
    ...point,
    time: hourFormatter.format(new Date(point.timestamp)),
  }));

  return (
    <section aria-labelledby="analytics-heading" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <Card className="gap-0 py-0 shadow-none">
        <CardHeader className="border-b py-5">
          <div>
            <CardTitle id="analytics-heading">Request volume</CardTitle>
            <CardDescription className="mt-1">
              Requests grouped hourly by response class · last 24h UTC
            </CardDescription>
          </div>
          <CardAction className="hidden items-center gap-4 sm:flex">
            {Object.entries(chartConfig).map(([key, item]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-xs text-fg-secondary"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </CardAction>
        </CardHeader>

        <CardContent className="px-2 pb-4 pt-5 sm:px-5">
          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 px-3 sm:hidden">
            {Object.entries(chartConfig).map(([key, item]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-[11px] text-fg-secondary"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>

          <ChartContainer
            config={chartConfig}
            className="h-[280px] aspect-auto w-full sm:h-[340px]"
            initialDimension={{ width: 900, height: 340 }}
          >
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="fill-successful"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-success)"
                    stopOpacity={0.42}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-success)"
                    stopOpacity={0.04}
                  />
                </linearGradient>
                <linearGradient
                  id="fill-client-errors"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-warning)"
                    stopOpacity={0.42}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-warning)"
                    stopOpacity={0.04}
                  />
                </linearGradient>
                <linearGradient
                  id="fill-server-errors"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-error)"
                    stopOpacity={0.5}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-error)"
                    stopOpacity={0.06}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={34}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{
                  stroke: "var(--color-border)",
                  strokeDasharray: "4 4",
                }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(value) => `${String(value)} UTC`}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="successful"
                stackId="requests"
                stroke="var(--color-success)"
                fill="url(#fill-successful)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="clientErrors"
                stackId="requests"
                stroke="var(--color-warning)"
                fill="url(#fill-client-errors)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="serverErrors"
                stackId="requests"
                stroke="var(--color-error)"
                fill="url(#fill-server-errors)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
