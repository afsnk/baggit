import { z } from "zod"
import { FiatMoneySchema, CryptoAmountSchema } from "../value-objects/money"
import type { ChainId, SettlementAsset } from "../../ports/chain.port"
import type { ScreeningVerdict } from "../../ports/compliance.port"

/**
 * Event catalog (REQUIREMENTS.md §5).
 * Legacy ramp-aggregation events retained for the ExternalRampPort surface;
 * payment-surface events carry money-typed payloads (§6d).
 */

export const EVENT_TYPES = [
  // legacy ramp aggregation
  "TransactionInitiated",
  "QuoteRequested",
  "SettlementStarted",
  "SettlementCompleted",
  "SettlementFailed",
  "LiquidityUnavailable",
  "WebhookReceived",
  "KYCRejected",
  // deposits
  "DepositInitiated",
  "DepositFundsDetected",
  "DepositScreened",
  "DepositDelivered",
  "DepositSettled",
  "DepositFailed",
  // withdrawals
  "WithdrawalInitiated",
  "WithdrawalProcessing",
  "WithdrawalBroadcast",
  "WithdrawalConfirmed",
  "WithdrawalSettled",
  "WithdrawalFailed",
  // checkout
  "CheckoutSessionCreated",
  "CheckoutSessionExpired",
  "CheckoutCompleted",
  // routing / compliance / webhooks / queue
  "RouteFailedOver",
  "ScreeningFlagged",
  "WebhookDelivered",
  "WebhookFailed",
  "SettlementCheckDue",
] as const

export type EventType = (typeof EVENT_TYPES)[number]

// ---------------------------------------------------------------------------
// legacy payloads (unchanged shapes)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// payment-surface payloads — money-typed per §6d
// ---------------------------------------------------------------------------

export const DepositInitiatedPayload = z.object({
  depositId: z.string(),
  customerId: z.string(),
  rail: z.string(),
  fiat: FiatMoneySchema,
  createdAt: z.string(),
})

export const DepositFundsDetectedPayload = z.object({
  depositId: z.string(),
  creditId: z.string(),
  fiat: FiatMoneySchema,
  detectedAt: z.string(),
})

export const DepositScreenedPayload = z.object({
  depositId: z.string(),
  verdict: z.enum(["clear", "flagged", "rejected"]),
  screenedAt: z.string(),
})

export const DepositDeliveredPayload = z.object({
  depositId: z.string(),
  chain: z.string() as z.ZodType<ChainId>,
  asset: z.string() as z.ZodType<SettlementAsset>,
  toAddress: z.string(),
  txHash: z.string(),
  amount: CryptoAmountSchema,
  deliveredAt: z.string(),
})

export const DepositSettledPayload = z.object({
  depositId: z.string(),
  txHash: z.string(),
  confirmations: z.number().int().nonnegative(),
  settledAt: z.string(),
})

export const DepositFailedPayload = z.object({
  depositId: z.string(),
  stage: z.enum(["initiated", "funds_detected", "screened", "delivered"]),
  reason: z.string(),
  failedAt: z.string(),
})

export const WithdrawalInitiatedPayload = z.object({
  withdrawalId: z.string(),
  customerId: z.string(),
  method: z.enum(["fiat", "crypto"]),
  /** Stablecoin debited from the custodial wallet. */
  amount: CryptoAmountSchema,
  fiat: FiatMoneySchema.optional(),
  createdAt: z.string(),
})

export const WithdrawalProcessingPayload = z.object({
  withdrawalId: z.string(),
  rail: z.string(),
  startedAt: z.string(),
})

export const WithdrawalBroadcastPayload = z.object({
  withdrawalId: z.string(),
  chain: z.string() as z.ZodType<ChainId>,
  txHash: z.string(),
  amount: CryptoAmountSchema,
  broadcastAt: z.string(),
})

export const WithdrawalConfirmedPayload = z.object({
  withdrawalId: z.string(),
  txHash: z.string(),
  confirmations: z.number().int().nonnegative(),
  confirmedAt: z.string(),
})

export const WithdrawalSettledPayload = z.object({
  withdrawalId: z.string(),
  settledAt: z.string(),
})

export const WithdrawalFailedPayload = z.object({
  withdrawalId: z.string(),
  reason: z.string(),
  failedAt: z.string(),
})

export const CheckoutSessionCreatedPayload = z.object({
  sessionId: z.string(),
  merchantId: z.string(),
  amount: CryptoAmountSchema,
  fiat: FiatMoneySchema.optional(),
  expiresAt: z.string(),
  createdAt: z.string(),
})

export const CheckoutSessionExpiredPayload = z.object({
  sessionId: z.string(),
  expiredAt: z.string(),
})

export const CheckoutCompletedPayload = z.object({
  sessionId: z.string(),
  method: z.enum(["fiat", "crypto"]),
  amount: CryptoAmountSchema,
  reference: z.string(),
  completedAt: z.string(),
})

export const RouteFailedOverPayload = z.object({
  corridor: z.string(),
  fromRail: z.string(),
  toRail: z.string(),
  reason: z.string(),
  failedAt: z.string(),
})

export const ScreeningFlaggedPayload = z.object({
  resultId: z.string(),
  subjectType: z.enum(["customer", "counterparty"]),
  subjectId: z.string(),
  vendor: z.string(),
  flaggedAt: z.string(),
})

export const WebhookDeliveredPayload = z.object({
  endpointId: z.string(),
  eventId: z.string(),
  attempt: z.number().int().positive(),
  statusCode: z.number().int(),
  deliveredAt: z.string(),
})

export const WebhookFailedPayload = z.object({
  endpointId: z.string(),
  eventId: z.string(),
  attempts: z.number().int().positive(),
  lastError: z.string(),
  deadLettered: z.boolean(),
  failedAt: z.string(),
})

/** Queue-driven settlement check (§6b) — replaces in-process polling. */
export const SettlementCheckDuePayload = z.object({
  settlementId: z.string(),
  transactionId: z.string(),
  provider: z.string(),
  attempt: z.number().int().nonnegative(),
  dueAt: z.string(),
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
  DepositInitiated: DepositInitiatedPayload,
  DepositFundsDetected: DepositFundsDetectedPayload,
  DepositScreened: DepositScreenedPayload,
  DepositDelivered: DepositDeliveredPayload,
  DepositSettled: DepositSettledPayload,
  DepositFailed: DepositFailedPayload,
  WithdrawalInitiated: WithdrawalInitiatedPayload,
  WithdrawalProcessing: WithdrawalProcessingPayload,
  WithdrawalBroadcast: WithdrawalBroadcastPayload,
  WithdrawalConfirmed: WithdrawalConfirmedPayload,
  WithdrawalSettled: WithdrawalSettledPayload,
  WithdrawalFailed: WithdrawalFailedPayload,
  CheckoutSessionCreated: CheckoutSessionCreatedPayload,
  CheckoutSessionExpired: CheckoutSessionExpiredPayload,
  CheckoutCompleted: CheckoutCompletedPayload,
  RouteFailedOver: RouteFailedOverPayload,
  ScreeningFlagged: ScreeningFlaggedPayload,
  WebhookDelivered: WebhookDeliveredPayload,
  WebhookFailed: WebhookFailedPayload,
  SettlementCheckDue: SettlementCheckDuePayload,
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
