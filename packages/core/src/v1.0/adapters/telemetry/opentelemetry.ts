import { trace, context, type Span, SpanStatusCode } from "@opentelemetry/api"

const tracer = trace.getTracer("apra-core")

export function startSpan(
  name: string,
  fn: (span: Span) => Promise<void>,
): Promise<void> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      })
      throw error
    } finally {
      span.end()
    }
  })
}

export function getTraceId(): string {
  const span = trace.getActiveSpan()
  if (!span) return crypto.randomUUID()
  const spanContext = span.spanContext()
  return spanContext.traceId
}

export function injectTraceId(): string {
  const span = trace.getActiveSpan()
  if (!span) return crypto.randomUUID()
  return span.spanContext().traceId
}

export interface StructuredLog {
  level: "info" | "warn" | "error" | "debug"
  message: string
  traceId?: string
  provider?: string
  durationMs?: number
  error?: string
  [key: string]: unknown
}

export function log(entry: StructuredLog): void {
  const traceId = entry.traceId ?? getTraceId()
  const output = {
    ...entry,
    traceId,
    timestamp: new Date().toISOString(),
    service: "apra-core",
  }
  const method = entry.level === "error" ? "error" : entry.level === "warn" ? "warn" : "log"
  console[method](JSON.stringify(output))
}
