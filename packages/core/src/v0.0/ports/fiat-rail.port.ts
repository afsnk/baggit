import type { FiatMoney } from "../domain/value-objects/money"

/**
 * REQUIREMENTS.md §3: fiat rail abstraction.
 * Virtual accounts, inbound credit detection, fiat payouts.
 */
export type FiatRailName = string

export interface VirtualAccount {
  id: string
  customerId: string
  rail: FiatRailName
  /** ISO-4217 code. */
  currency: string
  accountNumber: string
  /** Unique reference that maps an inbound credit back to the customer. */
  reference: string
  bankName?: string
  instructions: Record<string, string>
}

export interface InboundCredit {
  creditId: string
  virtualAccountId: string
  reference: string
  amount: FiatMoney
  senderName?: string
  receivedAt: string
}

export interface FiatPayoutRequest {
  withdrawalId: string
  currency: string
  amountMinor: number
  beneficiary: {
    name: string
    accountNumber: string
    bankCode?: string
    country?: string
  }
}

export type FiatPayoutStatus = "accepted" | "processing" | "settled" | "failed"

export interface FiatPayoutResult {
  railTxId: string
  status: FiatPayoutStatus
  failureReason?: string
}

export interface FiatRailCapabilities {
  currencies: string[]
  supportsVirtualAccounts: boolean
  supportsPayouts: boolean
}

/**
 * Implementations must be stateless: inbound credits are surfaced via
 * `pollInboundCredits` (durable scheduler drives polling, never in-process
 * timers — REQUIREMENTS.md §6b).
 */
export interface FiatRailPort {
  readonly name: FiatRailName
  readonly capabilities: FiatRailCapabilities

  createVirtualAccount(customerId: string, currency: string): Promise<VirtualAccount>
  pollInboundCredits(virtualAccountIds: string[], sinceIso?: string): Promise<InboundCredit[]>
  payout(request: FiatPayoutRequest): Promise<FiatPayoutResult>
  getPayoutStatus(railTxId: string): Promise<FiatPayoutStatus>
}
