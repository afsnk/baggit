import type { DBPort } from "../../ports/db.port"
import type { WebhookOutPort } from "../../ports/webhook-out.port"
import type { Emitter } from "../../primitives/emit"
import { signHmac } from "../../utils/hmac"

/**
 * REQUIREMENTS.md §2.6: HMAC-SHA256-signed outbound webhooks with
 * exponential-backoff retries and dead-letter termination. Retries are NOT
 * in-process timers: failed dispatches emit `WebhookFailed` and the
 * host/consumer re-invokes `dispatch`/`redeliver` (§6b).
 */

export interface WebhookDispatcherDeps {
  db: DBPort
  emitter: Emitter
  transport: WebhookOutPort
  maxAttempts?: number
}

const DEFAULT_MAX_ATTEMPTS = 5

/** Exponential backoff schedule in ms for attempts 1..n-1. */
export function backoffMs(attempt: number): number {
  return Math.min(1000 * 2 ** (attempt - 1), 60_000)
}

export interface DispatchRequest {
  merchantId: string
  eventType: string
  eventId: string
  payload: unknown
}

export class WebhookDispatcher {
  private readonly db: DBPort
  private readonly emitter: Emitter
  private readonly transport: WebhookOutPort
  private readonly maxAttempts: number

  constructor(deps: WebhookDispatcherDeps) {
    this.db = deps.db
    this.emitter = deps.emitter
    this.transport = deps.transport
    this.maxAttempts = deps.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  }

  /**
   * Deliver `payload` to every active endpoint of the merchant.
   * Returns per-endpoint outcomes; failures beyond maxAttempts dead-letter.
   */
  async dispatch(request: DispatchRequest): Promise<Array<{ endpointId: string; ok: boolean; deadLettered: boolean }>> {
    const endpoints = await this.db.webhookEndpoints.listActiveByMerchant(request.merchantId)
    const body = JSON.stringify({ type: request.eventType, data: request.payload })
    const outcomes: Array<{ endpointId: string; ok: boolean; deadLettered: boolean }> = []

    for (const endpoint of endpoints) {
      const outcome = await this.deliver(endpoint, request, body, 1)
      outcomes.push(outcome)
    }
    return outcomes
  }

  /** Redeliver a previously failed event (queue/consumer driven, §6b). */
  async redeliver(request: DispatchRequest, endpointId: string): Promise<{ ok: boolean; deadLettered: boolean }> {
    const endpoints = await this.db.webhookEndpoints.listActiveByMerchant(request.merchantId)
    const endpoint = endpoints.find((e) => e.id === endpointId)
    if (!endpoint) throw new Error(`webhook endpoint ${endpointId} not found or inactive`)
    const body = JSON.stringify({ type: request.eventType, data: request.payload })
    const attempt = (await this.db.webhookDeliveries.countAttempts(endpointId, request.eventId)) + 1
    return this.deliver(endpoint, request, body, attempt)
  }

  private async deliver(
    endpoint: { id: string; url: string; secret: string },
    request: DispatchRequest,
    body: string,
    attempt: number,
  ): Promise<{ endpointId: string; ok: boolean; deadLettered: boolean }> {
    const signature = await signHmac(endpoint.secret, body)
    const sentAt = nowIso()
    let ok = false
    let statusCode: number | undefined
    let error: string | undefined

    try {
      const result = await this.transport.send({
        url: endpoint.url,
        signature,
        body,
        headers: {
          "content-type": "application/json",
          "x-apra-signature": signature,
          "x-apra-event-id": request.eventId,
          "x-apra-event-type": request.eventType,
        },
      })
      ok = result.ok
      statusCode = result.statusCode
      error = result.error
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }

    const deadLettered = !ok && attempt >= this.maxAttempts
    await this.db.webhookDeliveries.insert({
      id: crypto.randomUUID(),
      endpointId: endpoint.id,
      eventId: request.eventId,
      eventType: request.eventType,
      payload: body,
      signature,
      attempt,
      statusCode,
      ok,
      error,
      deadLettered,
      deliveredAt: ok ? sentAt : undefined,
      createdAt: sentAt,
    })

    if (ok) {
      await this.emitter.emit("WebhookDelivered", {
        endpointId: endpoint.id,
        eventId: request.eventId,
        attempt,
        statusCode: statusCode ?? 0,
        deliveredAt: sentAt,
      })
    } else {
      await this.emitter.emit("WebhookFailed", {
        endpointId: endpoint.id,
        eventId: request.eventId,
        attempts: attempt,
        lastError: error ?? "unknown error",
        deadLettered,
        failedAt: sentAt,
      })
    }
    return { endpointId: endpoint.id, ok, deadLettered }
  }
}

function nowIso(): string {
  return new Date().toISOString()
}
