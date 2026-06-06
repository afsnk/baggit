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
