/**
 * REQUIREMENTS.md §2.6: outbound webhook transport abstraction.
 * Signing (HMAC-SHA256) and retry policy live in core; only the HTTP hop
 * lives behind this port so tests can stub delivery.
 */
export interface WebhookDeliveryAttempt {
  url: string
  /** HMAC-SHA256 hex digest over the exact body bytes. */
  signature: string
  body: string
  headers: Record<string, string>
}

export interface WebhookDeliveryOutcome {
  ok: boolean
  statusCode?: number
  error?: string
  attemptedAt: string
}

export interface WebhookOutPort {
  send(attempt: WebhookDeliveryAttempt): Promise<WebhookDeliveryOutcome>
}
