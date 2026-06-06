import type { QuoteRequest, ProviderQuote } from "../entities/quote.entity"
import type { Transaction, TransactionRequest } from "../entities/transaction.entity"
import type { Settlement, SettlementStatus } from "../entities/settlement.entity"
import type { ProviderCapability, ProviderStatus } from "../entities/provider.entity"
import type { CryptoAsset, FiatCurrency } from "../value-objects/currency"
import type { Region } from "../value-objects/region"
import type { PaymentMethod } from "../value-objects/payment-method"
import type { KYCLevel } from "../value-objects/kyc"

export interface ProviderCapabilities {
  capabilities: ProviderCapability[]
  supportedRegions: Region[]
  supportedFiatCurrencies: FiatCurrency[]
  supportedCryptoAssets: CryptoAsset[]
  supportedPaymentMethods: PaymentMethod[]
  kycRequired: boolean
  kycLevels: KYCLevel[]
}

export interface ProviderHealth {
  status: ProviderStatus
  uptime: number
  lastChecked: Date
  failureRate: number
  avgResponseTime: number
}


