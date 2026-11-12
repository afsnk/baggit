import type { QuoteRequest, ProviderQuote } from "../domain/entities/quote.entity"
import type { Transaction, TransactionRequest } from "../domain/entities/transaction.entity"
import type { SettlementStatus } from "../domain/entities/settlement.entity"
import type { ProviderCapabilities, ProviderHealth } from "../domain/contracts/provider-contract"

export interface ProviderPort {
  readonly name: string
  readonly capabilities: ProviderCapabilities

  isAvailable(region: string): Promise<boolean>
  quote(request: QuoteRequest): Promise<ProviderQuote>
  initiate(request: TransactionRequest): Promise<Transaction>
  status(txId: string): Promise<SettlementStatus>
  health(): Promise<ProviderHealth>
}
