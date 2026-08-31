export type MockEvent = {
	id: string
	workspaceId: string
	serviceName: string
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
	route: string
	statusCode: number
	durationMs: number
	errorMessage: string | null
	metadata: Record<string, unknown>
	createdAt: Date
}

const hourlyRequestVolume = [
	76, 71, 69, 65, 68, 74, 82, 91, 104, 116, 128, 135,
	142, 151, 147, 156, 162, 174, 168, 158, 149, 141, 132, 124,
]

const services = ["gateway-api", "auth-service", "billing-service"]
const successStatuses = [200, 200, 200, 201, 204]
const clientErrorStatuses = [400, 401, 404, 429]
const serverErrorStatuses = [500, 502, 503]
const endpoints = [
	{ method: "GET", route: "/v1/users" },
	{ method: "POST", route: "/v1/events" },
	{ method: "GET", route: "/v1/health" },
	{ method: "POST", route: "/v1/checkout" },
	{ method: "PATCH", route: "/v1/subscriptions/:id" },
	{ method: "DELETE", route: "/v1/sessions/:id" },
] as const
const regions = ["us-east-1", "eu-west-1", "ap-south-1"]
const workspaceId = "7f2f26d5-42a8-4e7b-9a5d-c27cd6c6de72"

const startTime = Date.UTC(2026, 7, 30, 17)

export const mockEvents: MockEvent[] = hourlyRequestVolume.flatMap(
	(requestCount, hourIndex) =>
		Array.from({ length: requestCount }, (_, requestIndex) => {
			const fingerprint = requestIndex * 37 + hourIndex * 29
			const endpoint = endpoints[fingerprint % endpoints.length]
			const hasElevatedErrors = hourIndex === 17 || hourIndex === 18
			const isServerError = hasElevatedErrors
				? fingerprint % 23 === 0
				: fingerprint % 47 === 0
			const isClientError = !isServerError && fingerprint % 17 === 0

			const statusCode = isServerError
				? serverErrorStatuses[fingerprint % serverErrorStatuses.length]
				: isClientError
					? clientErrorStatuses[fingerprint % clientErrorStatuses.length]
					: successStatuses[fingerprint % successStatuses.length]

			const durationMs =
				38 +
				(fingerprint % 172) +
				(isClientError ? 72 : 0) +
				(isServerError ? 480 : 0)
			const errorMessage = isServerError
				? statusCode === 503
					? "Upstream service unavailable"
					: "Request failed while processing the upstream response"
				: isClientError
					? statusCode === 429
						? "Rate limit exceeded for this workspace"
						: "The requested resource could not be completed"
					: null

			return {
				id: `evt_${String(hourIndex).padStart(2, "0")}_${String(requestIndex).padStart(3, "0")}`,
				workspaceId,
				serviceName: services[fingerprint % services.length],
				method: endpoint.method,
				route: endpoint.route,
				statusCode,
				durationMs,
				errorMessage,
				metadata: {
					requestId: `req_${hourIndex.toString(16)}${requestIndex.toString(16)}`,
					traceId: `trace_${(fingerprint * 7919).toString(16).padStart(12, "0")}`,
					environment: "production",
					region: regions[fingerprint % regions.length],
					release: `2026.08.${28 + (hourIndex % 3)}`,
					request: {
						contentType: "application/json",
						userAgent: "PulseLog SDK/1.4.2",
						ip: `10.0.${hourIndex % 8}.${(requestIndex % 240) + 10}`,
					},
					query: requestIndex % 4 === 0 ? { include: "profile,team" } : {},
					...(isServerError
						? {
							stack: `${errorMessage}\n    at fetchUpstream (/srv/app/services/gateway.ts:184:17)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at async handleRequest (/srv/app/routes${endpoint.route.replace(":id", "[id]")}.ts:42:11)\n    at async middleware (/srv/app/lib/telemetry.ts:76:9)`,
							upstream: {
								host: `${services[fingerprint % services.length]}.internal`,
								retryCount: fingerprint % 3,
								retryable: statusCode === 503,
							},
						}
						: {}),
				},
				createdAt: new Date(
					startTime +
						hourIndex * 60 * 60 * 1000 +
						Math.floor((requestIndex / requestCount) * 60) * 60 * 1000
				),
			}
		})
)
