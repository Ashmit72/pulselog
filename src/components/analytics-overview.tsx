"use client"

import {
	Activity,
	ArrowDownRight,
	ArrowUpRight,
	Gauge,
	TriangleAlert,
} from "lucide-react"
import {
	Area,
	AreaChart,
	CartesianGrid,
	XAxis,
	YAxis,
} from "recharts"

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart"
import { mockEvents, type MockEvent } from "@/lib/mock-events"
import { cn } from "@/lib/utils"

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
} satisfies ChartConfig

const compactNumber = new Intl.NumberFormat("en-US", {
	notation: "compact",
	maximumFractionDigits: 1,
})

function getP95(events: MockEvent[]) {
	if (events.length === 0) return 0

	const durations = events.map((event) => event.durationMs).sort((a, b) => a - b)
	return durations[Math.ceil(durations.length * 0.95) - 1]
}

function getServerErrorRate(events: MockEvent[]) {
	if (events.length === 0) return 0

	const errorCount = events.filter((event) => event.statusCode >= 500).length
	return (errorCount / events.length) * 100
}

const splitTimestamp = Date.UTC(2026, 7, 31, 5)
const previousPeriod = mockEvents.filter(
	(event) => event.createdAt.getTime() < splitTimestamp
)
const currentPeriod = mockEvents.filter(
	(event) => event.createdAt.getTime() >= splitTimestamp
)

const requestTrend =
	((currentPeriod.length - previousPeriod.length) / previousPeriod.length) * 100
const latencyTrend =
	((getP95(currentPeriod) - getP95(previousPeriod)) / getP95(previousPeriod)) * 100
const errorRateTrend =
	getServerErrorRate(currentPeriod) - getServerErrorRate(previousPeriod)

const metrics = [
	{
		label: "Total requests",
		value: compactNumber.format(mockEvents.length),
		detail: "Across 3 services",
		trend: requestTrend,
		trendSuffix: "%",
		trendLabel: "vs prior 12h",
		icon: Activity,
		iconClassName: "border-primary-border bg-primary-accent text-primary-text",
		inverseTrend: false,
	},
	{
		label: "P95 latency",
		value: `${getP95(mockEvents)} ms`,
		detail: "95th percentile",
		trend: latencyTrend,
		trendSuffix: "%",
		trendLabel: "vs prior 12h",
		icon: Gauge,
		iconClassName: "border-info-border bg-info-accent text-info-text",
		inverseTrend: true,
	},
	{
		label: "Error rate",
		value: `${getServerErrorRate(mockEvents).toFixed(2)}%`,
		detail: "HTTP 5xx responses",
		trend: errorRateTrend,
		trendSuffix: "pp",
		trendLabel: "vs prior 12h",
		icon: TriangleAlert,
		iconClassName: "border-error-border bg-error-accent text-error-text",
		inverseTrend: true,
	},
]

const chartData = Array.from({ length: 24 }, (_, hourIndex) => {
	const hourStart = Date.UTC(2026, 7, 30, 17 + hourIndex)
	const hourEnd = hourStart + 60 * 60 * 1000
	const events = mockEvents.filter((event) => {
		const timestamp = event.createdAt.getTime()
		return timestamp >= hourStart && timestamp < hourEnd
	})

	return {
		time: `${String(new Date(hourStart).getUTCHours()).padStart(2, "0")}:00`,
		successful: events.filter((event) => event.statusCode < 400).length,
		clientErrors: events.filter(
			(event) => event.statusCode >= 400 && event.statusCode < 500
		).length,
		serverErrors: events.filter((event) => event.statusCode >= 500).length,
	}
})

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
	const Icon = metric.icon
	const isPositive = metric.inverseTrend ? metric.trend <= 0 : metric.trend >= 0
	const TrendIcon = metric.trend >= 0 ? ArrowUpRight : ArrowDownRight

	return (
		<Card className="gap-4 py-5 shadow-none">
			<CardHeader className="grid grid-cols-[1fr_auto] gap-3 px-5">
				<div>
					<CardDescription className="font-medium">{metric.label}</CardDescription>
					<CardTitle className="mt-2 text-[1.75rem] leading-none tabular-nums">
						{metric.value}
					</CardTitle>
				</div>
				<CardAction
					className={cn(
						"flex size-9 items-center justify-center rounded-lg border",
						metric.iconClassName
					)}>
					<Icon className="size-[18px]" aria-hidden="true" />
				</CardAction>
			</CardHeader>
			<CardContent className="flex items-center justify-between gap-3 px-5">
				<span className="text-xs text-fg-tertiary">{metric.detail}</span>
				<span
					className={cn(
						"inline-flex items-center gap-1 text-xs font-medium tabular-nums",
						isPositive ? "text-success-text" : "text-error-text"
					)}>
					<TrendIcon className="size-3.5" aria-hidden="true" />
					{metric.trend > 0 ? "+" : ""}
					{metric.trend.toFixed(1)}{metric.trendSuffix}
					<span className="hidden font-normal text-fg-tertiary xl:inline">
						{metric.trendLabel}
					</span>
				</span>
			</CardContent>
		</Card>
	)
}

export function AnalyticsOverview() {
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
							Requests grouped hourly by response class · UTC
						</CardDescription>
					</div>
					<CardAction className="hidden items-center gap-4 sm:flex">
						{Object.entries(chartConfig).map(([key, item]) => (
							<span key={key} className="inline-flex items-center gap-1.5 text-xs text-fg-secondary">
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
							<span key={key} className="inline-flex items-center gap-1.5 text-[11px] text-fg-secondary">
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
						className="h-[280px] w-full aspect-auto sm:h-[340px]"
						initialDimension={{ width: 900, height: 340 }}>
						<AreaChart
							accessibilityLayer
							data={chartData}
							margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
							<defs>
								<linearGradient id="fill-successful" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.42} />
									<stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.04} />
								</linearGradient>
								<linearGradient id="fill-client-errors" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.42} />
									<stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.04} />
								</linearGradient>
								<linearGradient id="fill-server-errors" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.5} />
									<stop offset="95%" stopColor="var(--color-error)" stopOpacity={0.06} />
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
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
								cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
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
	)
}
