import type {
  ProviderRepository,
  QuoteRepository,
  TransactionRepository,
  SettlementRepository,
} from "../domain/contracts/repository-contract"

export interface DBPort {
  connect(): Promise<void>
  disconnect(): Promise<void>
  migrate(): Promise<void>

  providers: ProviderRepository
  quotes: QuoteRepository
  transactions: TransactionRepository
  settlements: SettlementRepository
}
