"use client"

import { useDeferredValue, useMemo, useState } from "react"
import {
	Check,
	ChevronRight,
	Clock3,
	Copy,
	FilterX,
	Route,
	Search,
	TriangleAlert,
	X,
} from "lucide-react"
import { toast } from "sonner"

import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, IconButton } from "@/components/ui/button"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { CodeArea } from "@/components/ui/code-area"
import {
	Drawer,
	DrawerBody,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer"
import { Input, InputWrapper } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { mockEvents, type MockEvent } from "@/lib/mock-events"

const rangeInMilliseconds = {
	"15m": 15 * 60 * 1000,
	"1h": 60 * 60 * 1000,
	"24h": 24 * 60 * 60 * 1000,
	"7d": 7 * 24 * 60 * 60 * 1000,
} as const

type TimeRange = keyof typeof rangeInMilliseconds

const statusOptions = [200, 201, 204, 400, 401, 404, 429, 500, 502, 503]
const routeOptions = Array.from(new Set(mockEvents.map((event) => event.route))).sort()
const latestEventTimestamp = Math.max(
	...mockEvents.map((event) => event.createdAt.getTime())
)

function matchesStatus(event: MockEvent, status: string) {
	if (status === "all") return true
	if (status === "2xx") return event.statusCode >= 200 && event.statusCode < 300
	if (status === "4xx") return event.statusCode >= 400 && event.statusCode < 500
	if (status === "5xx") return event.statusCode >= 500 && event.statusCode < 600
	return event.statusCode === Number(status)
}

function statusColor(statusCode: number): "success" | "warning" | "error" {
	if (statusCode >= 500) return "error"
	if (statusCode >= 400) return "warning"
	return "success"
}

function formatTimestamp(date: Date) {
	return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")} ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")}`
}

function formatFullTimestamp(date: Date) {
	return `${date.toISOString().replace("T", " ").replace("Z", "")} UTC`
}

function StatusBadge({ statusCode }: { statusCode: number }) {
	return (
		<Badge
			variant="soft"
			color={statusColor(statusCode)}
			size="20"
			className="min-w-11 justify-center font-mono tabular-nums">
			{statusCode}
		</Badge>
	)
}

function LogInspector({ event }: { event: MockEvent }) {
	const [copied, setCopied] = useState(false)
	const stackTrace =
		typeof event.metadata.stack === "string" ? event.metadata.stack : null
	const metadataJson = JSON.stringify(event.metadata, null, 2)

	async function copyMetadata() {
		try {
			await navigator.clipboard.writeText(metadataJson)
			setCopied(true)
			toast.success("Metadata copied to clipboard")
			window.setTimeout(() => setCopied(false), 1600)
		} catch {
			toast.error("Could not copy metadata")
		}
	}

	return (
		<DrawerContent className="w-full gap-0 p-0 sm:w-[min(92vw,44rem)]">
			<DrawerHeader className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
				<div className="flex items-start gap-3">
					<div className="min-w-0 flex-1">
						<div className="mb-2 flex flex-wrap items-center gap-2">
							<StatusBadge statusCode={event.statusCode} />
							<Badge variant="outline" color="neutral" size="20" className="font-mono">
								{event.method}
							</Badge>
						</div>
						<DrawerTitle className="truncate font-mono text-base sm:text-lg">
							{event.route}
						</DrawerTitle>
						<DrawerDescription className="mt-1 font-mono text-xs">
							{event.id} · {formatFullTimestamp(event.createdAt)}
						</DrawerDescription>
					</div>
					<DrawerClose>
						<IconButton aria-label="Close log inspector" variant="ghost" color="neutral" size="32">
							<X />
						</IconButton>
					</DrawerClose>
				</div>
			</DrawerHeader>

			<DrawerBody className="min-h-0 px-5 py-5 sm:px-6">
				<div className="space-y-6">
					<section aria-labelledby="request-summary-heading">
						<h3 id="request-summary-heading" className="mb-3 text-sm font-semibold">
							Request summary
						</h3>
						<dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border sm:grid-cols-4">
							<div className="border-b border-r border-border p-3 sm:border-b-0">
								<dt className="text-[11px] font-medium uppercase tracking-wide text-fg-tertiary">Status</dt>
								<dd className="mt-1 font-mono text-sm font-semibold tabular-nums">{event.statusCode}</dd>
							</div>
							<div className="border-b border-border p-3 sm:border-b-0 sm:border-r">
								<dt className="text-[11px] font-medium uppercase tracking-wide text-fg-tertiary">Duration</dt>
								<dd className="mt-1 font-mono text-sm font-semibold tabular-nums">{event.durationMs} ms</dd>
							</div>
							<div className="border-r border-border p-3">
								<dt className="text-[11px] font-medium uppercase tracking-wide text-fg-tertiary">Service</dt>
								<dd className="mt-1 truncate text-sm font-medium">{event.serviceName}</dd>
							</div>
							<div className="p-3">
								<dt className="text-[11px] font-medium uppercase tracking-wide text-fg-tertiary">Region</dt>
								<dd className="mt-1 truncate font-mono text-sm font-medium">{String(event.metadata.region)}</dd>
							</div>
						</dl>
					</section>

					{event.errorMessage && (
						<section aria-labelledby="error-heading" className="space-y-3">
							<h3 id="error-heading" className="text-sm font-semibold">Error</h3>
							<Alert color={event.statusCode >= 500 ? "error" : "warning"} variant="soft-outline">
								<AlertIcon>
									<TriangleAlert />
								</AlertIcon>
								<AlertContent>
									<AlertTitle>{event.errorMessage}</AlertTitle>
									<AlertDescription>
										Request returned HTTP {event.statusCode} after {event.durationMs} ms.
									</AlertDescription>
								</AlertContent>
							</Alert>

							{stackTrace && (
								<div className="overflow-hidden rounded-lg border border-error-border bg-error-accent">
									<div className="border-b border-error-border px-3 py-2 text-xs font-medium text-error-text">
										Stack trace
									</div>
									<pre className="no-scrollbar overflow-auto p-3 font-mono text-xs leading-5 text-fg">
										<code>{stackTrace}</code>
									</pre>
								</div>
							)}
						</section>
					)}

					<section aria-labelledby="metadata-heading">
						<div className="mb-3 flex items-center justify-between gap-3">
							<div>
								<h3 id="metadata-heading" className="text-sm font-semibold">Metadata payload</h3>
								<p className="mt-0.5 text-xs text-fg-tertiary">Complete JSON captured for this event</p>
							</div>
							<Button variant="outline" color="neutral" size="32" onClick={copyMetadata}>
								{copied ? <Check /> : <Copy />}
								{copied ? "Copied" : "Copy JSON"}
							</Button>
						</div>
						<CodeArea
							code={metadataJson}
							language="json"
							theme="github-dark-high-contrast"
							lineNumbers
							className="max-h-[32rem] border border-border bg-elevation-negative"
						/>
					</section>
				</div>
			</DrawerBody>

			<DrawerFooter className="shrink-0 border-t border-border px-5 py-3 sm:px-6">
				<DrawerClose>
					<Button variant="outline" color="neutral" size="36">Close inspector</Button>
				</DrawerClose>
			</DrawerFooter>
		</DrawerContent>
	)
}

export function LogStream() {
	const [query, setQuery] = useState("")
	const [status, setStatus] = useState("all")
	const [route, setRoute] = useState("all")
	const [timeRange, setTimeRange] = useState<TimeRange>("24h")
	const [selectedEvent, setSelectedEvent] = useState<MockEvent | null>(null)
	const deferredQuery = useDeferredValue(query.trim().toLowerCase())

	const filteredEvents = useMemo(() => {
		const rangeStart = latestEventTimestamp - rangeInMilliseconds[timeRange]

		return [...mockEvents]
			.reverse()
			.filter((event) => {
				if (event.createdAt.getTime() < rangeStart) return false
				if (!matchesStatus(event, status)) return false
				if (route !== "all" && event.route !== route) return false

				if (deferredQuery) {
					const searchablePayload = [
						event.serviceName,
						event.method,
						event.route,
						event.statusCode,
						event.errorMessage,
						JSON.stringify(event.metadata),
					]
						.join(" ")
						.toLowerCase()

					if (!searchablePayload.includes(deferredQuery)) return false
				}

				return true
			})
	}, [deferredQuery, route, status, timeRange])

	const visibleEvents = filteredEvents.slice(0, 50)
	const hasActiveFilters =
		query.length > 0 || status !== "all" || route !== "all" || timeRange !== "24h"

	function clearFilters() {
		setQuery("")
		setStatus("all")
		setRoute("all")
		setTimeRange("24h")
	}

	return (
		<Drawer
			direction="right"
			backdrop="blur"
			open={selectedEvent !== null}
			onOpenChange={(open) => {
				if (!open) setSelectedEvent(null)
			}}>
		<section id="logs" aria-labelledby="logs-heading" className="space-y-4 scroll-mt-20">
			<Card className="gap-4 py-4 shadow-none">
				<CardContent className="grid gap-2 px-4 lg:grid-cols-[minmax(260px,1fr)_160px_220px_150px_auto]">
					<InputWrapper size="36" className="min-w-0 px-2.5">
						<Search aria-hidden="true" />
						<Input
							id="log-search"
							aria-label="Search logs and JSON metadata"
							placeholder="Search logs or JSON metadata…"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
						{query && (
							<IconButton
								aria-label="Clear search"
								variant="ghost"
								color="neutral"
								size="28"
								className="-mr-1 shrink-0"
								onClick={() => setQuery("")}>
								<X />
							</IconButton>
						)}
					</InputWrapper>

					<Select value={status} onValueChange={setStatus}>
						<SelectTrigger aria-label="Filter by HTTP status" size="36">
							<SelectValue placeholder="All statuses" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All statuses</SelectItem>
							<SelectGroup>
								<SelectLabel>Status class</SelectLabel>
								<SelectItem value="2xx">2xx success</SelectItem>
								<SelectItem value="4xx">4xx client error</SelectItem>
								<SelectItem value="5xx">5xx server error</SelectItem>
							</SelectGroup>
							<SelectGroup>
								<SelectLabel>Exact status</SelectLabel>
								{statusOptions.map((statusCode) => (
									<SelectItem key={statusCode} value={String(statusCode)}>
										{statusCode}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					<Select value={route} onValueChange={setRoute}>
						<SelectTrigger aria-label="Filter by route" size="36">
							<Route aria-hidden="true" className="size-4 text-fg-tertiary" />
							<SelectValue placeholder="All routes" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All routes</SelectItem>
							{routeOptions.map((routeOption) => (
								<SelectItem key={routeOption} value={routeOption}>
									{routeOption}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Select
						value={timeRange}
						onValueChange={(value) => setTimeRange(value as TimeRange)}>
						<SelectTrigger aria-label="Filter by time range" size="36">
							<Clock3 aria-hidden="true" className="size-4 text-fg-tertiary" />
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="15m">Last 15 minutes</SelectItem>
							<SelectItem value="1h">Last hour</SelectItem>
							<SelectItem value="24h">Last 24 hours</SelectItem>
							<SelectItem value="7d">Last 7 days</SelectItem>
						</SelectContent>
					</Select>

					<Button
						variant="ghost"
						color="neutral"
						size="36"
						disabled={!hasActiveFilters}
						onClick={clearFilters}>
						<FilterX />
						<span className="lg:sr-only xl:not-sr-only">Clear</span>
					</Button>
				</CardContent>
			</Card>

			<Card className="gap-0 py-0 shadow-none">
				<CardHeader className="border-b py-5">
					<div>
						<CardTitle id="logs-heading">Live log stream</CardTitle>
						<CardDescription className="mt-1">
							Showing {visibleEvents.length.toLocaleString()} of{" "}
							{filteredEvents.length.toLocaleString()} matching events
						</CardDescription>
					</div>
					<CardAction>
						<Badge variant="soft" color="success" size="24">
							<span className="relative flex size-2">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50" />
								<span className="relative inline-flex size-2 rounded-full bg-success" />
							</span>
							Live
						</Badge>
					</CardAction>
				</CardHeader>

				<CardContent className="hidden px-0 md:block">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-40">Timestamp (UTC)</TableHead>
								<TableHead>Method / Route</TableHead>
								<TableHead className="hidden lg:table-cell">Service</TableHead>
								<TableHead className="w-24">Status</TableHead>
								<TableHead className="w-28 text-right">Duration</TableHead>
								<TableHead className="w-10" aria-label="Open event" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{visibleEvents.map((event) => (
								<TableRow
									key={event.id}
									role="button"
									tabIndex={0}
									aria-label={`Inspect ${event.method} ${event.route}, status ${event.statusCode}`}
									className="group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-focus"
									onClick={() => setSelectedEvent(event)}
									onKeyDown={(keyboardEvent) => {
										if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
											keyboardEvent.preventDefault()
											setSelectedEvent(event)
										}
									}}>
									<TableCell className="font-mono text-xs tabular-nums text-fg-secondary">
										{formatTimestamp(event.createdAt)}
									</TableCell>
									<TableCell>
										<div className="flex min-w-0 items-center gap-3">
											<span className="w-12 shrink-0 font-mono text-xs font-semibold text-fg-secondary">
												{event.method}
											</span>
											<span className="truncate font-mono text-[13px]">{event.route}</span>
										</div>
									</TableCell>
									<TableCell className="hidden text-xs text-fg-secondary lg:table-cell">
										{event.serviceName}
									</TableCell>
									<TableCell>
										<StatusBadge statusCode={event.statusCode} />
									</TableCell>
									<TableCell className="text-right font-mono text-xs tabular-nums">
										{event.durationMs} ms
									</TableCell>
									<TableCell className="pl-0">
										<ChevronRight className="size-4 text-fg-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-fg" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>

				<CardContent className="divide-y divide-border px-0 md:hidden">
					{visibleEvents.slice(0, 20).map((event) => (
						<Button
							key={event.id}
							onClick={() => setSelectedEvent(event)}
							variant="ghost"
							color="neutral"
							className="group h-auto w-full justify-start rounded-none px-4 py-3 text-left">
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<span className="font-mono text-xs font-semibold text-fg-secondary">
										{event.method}
									</span>
									<span className="truncate font-mono text-[13px] text-fg">{event.route}</span>
								</div>
								<div className="mt-2 flex items-center gap-2 text-[11px] text-fg-tertiary">
									<span className="font-mono tabular-nums">{formatTimestamp(event.createdAt)}</span>
									<span aria-hidden="true">·</span>
									<span className="font-mono tabular-nums">{event.durationMs} ms</span>
								</div>
							</div>
							<StatusBadge statusCode={event.statusCode} />
							<ChevronRight className="size-4 shrink-0 text-fg-tertiary" />
						</Button>
					))}
				</CardContent>

				{visibleEvents.length === 0 && (
					<CardContent className="grid min-h-48 place-items-center border-t px-6 py-12 text-center">
						<div>
							<p className="font-medium">No matching events</p>
							<p className="mt-1 text-sm text-fg-secondary">Try widening the time range or clearing a filter.</p>
						</div>
					</CardContent>
				)}
			</Card>
		</section>
			{selectedEvent && <LogInspector key={selectedEvent.id} event={selectedEvent} />}
		</Drawer>
	)
}
