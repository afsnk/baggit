import { z } from "zod"

export const EVENT_TYPES = [
  "TransactionInitiated",
  "QuoteRequested",
  "SettlementStarted",
  "SettlementCompleted",
  "SettlementFailed",
  "LiquidityUnavailable",
  "WebhookReceived",
  "KYCRejected",
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export const TransactionInitiatedPayload = z.object({
  transactionId: z.string(),
  provider: z.string(),
  userId: z.string(),
  sourceAsset: z.string(),
  targetAsset: z.string(),
  sourceAmount: z.number(),
  targetAmount: z.number(),
  direction: z.enum(["buy", "sell"]),
  timestamp: z.string(),
})

export const QuoteRequestedPayload = z.object({
  requestId: z.string(),
  sourceAsset: z.string(),
  targetAsset: z.string(),
  direction: z.enum(["buy", "sell"]),
  amount: z.number(),
  region: z.string(),
  providersQueried: z.array(z.string()),
  responseCount: z.number(),
  timestamp: z.string(),
})

export const SettlementStartedPayload = z.object({
  settlementId: z.string(),
  transactionId: z.string(),
  provider: z.string(),
  timestamp: z.string(),
})

export const SettlementCompletedPayload = z.object({
  settlementId: z.string(),
  transactionId: z.string(),
  provider: z.string(),
  durationMs: z.number(),
  timestamp: z.string(),
})

export const SettlementFailedPayload = z.object({
  settlementId: z.string(),
  transactionId: z.string(),
  provider: z.string(),
  failureReason: z.string(),
  attempts: z.number(),
  timestamp: z.string(),
})

export const LiquidityUnavailablePayload = z.object({
  provider: z.string(),
  asset: z.string(),
  region: z.string(),
  amount: z.number(),
  timestamp: z.string(),
})

export const WebhookReceivedPayload = z.object({
  provider: z.string(),
  transactionId: z.string(),
  eventType: z.string(),
  rawPayload: z.unknown(),
  timestamp: z.string(),
})

export const KYCRejectedPayload = z.object({
  provider: z.string(),
  userId: z.string(),
  reason: z.string(),
  kycLevel: z.string(),
  timestamp: z.string(),
})

export const EventPayloads = {
  TransactionInitiated: TransactionInitiatedPayload,
  QuoteRequested: QuoteRequestedPayload,
  SettlementStarted: SettlementStartedPayload,
  SettlementCompleted: SettlementCompletedPayload,
  SettlementFailed: SettlementFailedPayload,
  LiquidityUnavailable: LiquidityUnavailablePayload,
  WebhookReceived: WebhookReceivedPayload,
  KYCRejected: KYCRejectedPayload,
} as const

export type EventPayloadMap = {
  [K in EventType]: z.infer<(typeof EventPayloads)[K]>
}

export interface DomainEvent<T extends EventType = EventType> {
  type: T
  payload: EventPayloadMap[T]
  id: string
  timestamp: string
  traceId: string
  subject: string
}
