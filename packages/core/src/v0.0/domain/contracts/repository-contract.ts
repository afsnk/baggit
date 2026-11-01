import type { Provider } from "../entities/provider.entity"
import type { ProviderQuote } from "../entities/quote.entity"
import type { Transaction } from "../entities/transaction.entity"
import type { Settlement } from "../entities/settlement.entity"

export interface ProviderRepository {
  upsert(provider: Provider): Promise<void>
  get(id: string): Promise<Provider | null>
  getByName(name: string): Promise<Provider | null>
  list(): Promise<Provider[]>
}

export interface QuoteRepository {
  insert(quote: ProviderQuote): Promise<void>
  get(id: string): Promise<ProviderQuote | null>
}

export interface TransactionRepository {
  insert(tx: Transaction): Promise<void>
  update(tx: Transaction): Promise<void>
  get(id: string): Promise<Transaction | null>
  getByProviderTxId(provider: string, txId: string): Promise<Transaction | null>
}

export interface SettlementRepository {
  insert(s: Settlement): Promise<void>
  update(s: Settlement): Promise<void>
  get(id: string): Promise<Settlement | null>
  getByTransactionId(txId: string): Promise<Settlement | null>
}

// ---------------------------------------------------------------------------
// payment-surface repositories (REQUIREMENTS.md §7)
// ---------------------------------------------------------------------------

import type {
  AddressRecord,
  CheckoutSession,
  Customer,
  DepositInstruction,
  DepositRecord,
  WithdrawalRecord,
} from "../entities/payments.entity"
import type { ScreeningOutcome } from "../../ports/compliance.port"
import type { VirtualAccount } from "../../ports/fiat-rail.port"

export interface CustomerRepository {
  upsert(customer: Customer): Promise<void>
  get(id: string): Promise<Customer | null>
  getByExternalId(externalId: string): Promise<Customer | null>
}

export interface AddressRepository {
  insert(record: AddressRecord): Promise<void>
  get(id: string): Promise<AddressRecord | null>
  getByCustomerAndChain(customerId: string, chain: string): Promise<AddressRecord | null>
  getByAddress(address: string): Promise<AddressRecord | null>
  updateAllowlist(id: string, state: AddressRecord["allowlistState"], activeAt?: string): Promise<void>
}

export interface DepositInstructionRepository {
  insert(instruction: DepositInstruction & { virtualAccount: VirtualAccount }): Promise<void>
  get(id: string): Promise<DepositInstruction | null>
  getByReference(reference: string): Promise<DepositInstruction | null>
  listByVirtualAccountIds(ids: string[]): Promise<DepositInstruction[]>
}

export interface DepositRepository {
  insert(deposit: DepositRecord): Promise<void>
  update(deposit: DepositRecord): Promise<void>
  get(id: string): Promise<DepositRecord | null>
  getByCreditId(creditId: string): Promise<DepositRecord | null>
  listUnsettled(): Promise<DepositRecord[]>
}


export interface WithdrawalRepository {
  insert(withdrawal: WithdrawalRecord): Promise<void>
  update(withdrawal: WithdrawalRecord): Promise<void>
  get(id: string): Promise<WithdrawalRecord | null>
  getByIdempotencyKey(key: string): Promise<WithdrawalRecord | null>
  countRecentByCustomer(customerId: string, sinceIso: string): Promise<number>
}

export interface CheckoutSessionRepository {
  insert(session: CheckoutSession): Promise<void>
  update(session: CheckoutSession): Promise<void>
  get(id: string): Promise<CheckoutSession | null>
  getByToken(token: string): Promise<CheckoutSession | null>
}

export interface WebhookEndpointRepository {
  insert(endpoint: { id: string; merchantId: string; url: string; secret: string; status: string; createdAt: string; updatedAt: string }): Promise<void>
  listActiveByMerchant(merchantId: string): Promise<Array<{ id: string; merchantId: string; url: string; secret: string }>>
  rotateSecret(id: string, secret: string): Promise<void>
  setStatus(id: string, status: "active" | "disabled"): Promise<void>
}

export interface WebhookDeliveryRepository {
  insert(delivery: {
    id: string
    endpointId: string
    eventId: string
    eventType: string
    payload: string
    signature: string
    attempt: number
    statusCode?: number
    ok: boolean
    error?: string
    deadLettered: boolean
    deliveredAt?: string
    createdAt: string
  }): Promise<void>
  countAttempts(endpointId: string, eventId: string): Promise<number>
}

export interface ScreeningResultRepository {
  insert(outcome: ScreeningOutcome & { subjectType: string; subjectId: string }): Promise<void>
}
