import type {
  ProviderRepository,
  QuoteRepository,
  TransactionRepository,
  SettlementRepository,
  CustomerRepository,
  AddressRepository,
  DepositInstructionRepository,
  DepositRepository,
  WithdrawalRepository,
  CheckoutSessionRepository,
  WebhookEndpointRepository,
  WebhookDeliveryRepository,
  ScreeningResultRepository,
} from "../domain/contracts/repository-contract"

export interface DBPort {
  connect(): Promise<void>
  disconnect(): Promise<void>
  migrate(): Promise<void>

  providers: ProviderRepository
  quotes: QuoteRepository
  transactions: TransactionRepository
  settlements: SettlementRepository
  customers: CustomerRepository
  addresses: AddressRepository
  depositInstructions: DepositInstructionRepository
  deposits: DepositRepository
  withdrawals: WithdrawalRepository
  checkoutSessions: CheckoutSessionRepository
  webhookEndpoints: WebhookEndpointRepository
  webhookDeliveries: WebhookDeliveryRepository
  screeningResults: ScreeningResultRepository
}
