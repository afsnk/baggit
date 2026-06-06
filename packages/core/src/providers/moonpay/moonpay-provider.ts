import type { QuoteRequest, ProviderQuote } from "../../domain/entities/quote.entity"
import type { Transaction, TransactionRequest } from "../../domain/entities/transaction.entity"
import type { SettlementStatus } from "../../domain/entities/settlement.entity"
import type { ProviderCapabilities } from "../../domain/contracts/provider-contract"
import { BaseProvider } from "../base/base-provider"
import { v4 } from "../../utils/id"

const CAPABILITIES: ProviderCapabilities = {
  capabilities: ["buy", "sell"],
  supportedRegions: ["US", "UK", "EU", "CA", "AU", "SG", "BR", "NG", "KE", "ZA"],
  supportedFiatCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "BRL", "NGN", "KES", "ZAR"],
  supportedCryptoAssets: ["BTC", "ETH", "USDC", "USDT", "SOL", "MATIC"],
  supportedPaymentMethods: ["credit_card", "debit_card", "bank_transfer", "apple_pay", "google_pay"],
  kycRequired: true,
  kycLevels: ["basic", "intermediate", "advanced"],
}

export class MoonpayProvider extends BaseProvider {
  readonly name = "moonpay"
  readonly capabilities = CAPABILITIES

  async isAvailable(region: string): Promise<boolean> {
    return CAPABILITIES.supportedRegions.includes(region as any)
  }

  async quote(request: QuoteRequest): Promise<ProviderQuote> {
    const rate = request.sourceAsset === "USDC" ? 1 : 0.98 + Math.random() * 0.04
    const feePercent = 1.5 + Math.random() * 1.0
    const targetAmount = request.sourceAmount! * rate * (1 - feePercent / 100)

    return {
      id: v4(),
      provider: this.name,
      direction: request.direction,
      sourceAsset: request.sourceAsset,
      targetAsset: request.targetAsset,
      sourceAmount: request.sourceAmount!,
      targetAmount,
      rate,
      fees: [
        { percentage: feePercent, flat: 0.5, currency: request.sourceAsset, description: "Processing fee" },
      ],
      totalFee: { percentage: feePercent, flat: 0.5, currency: request.sourceAsset },
      estimatedSettlementMs: 30_000 + Math.random() * 120_000,
      paymentMethod: request.paymentMethod,
      region: request.region,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    }
  }

  async initiate(request: TransactionRequest): Promise<Transaction> {
    const tx: Transaction = {
      id: request.idempotencyKey,
      provider: this.name,
      quoteId: request.quoteId,
      userId: request.userId,
      sourceAsset: request.sourceAsset,
      targetAsset: request.targetAsset,
      sourceAmount: request.sourceAmount,
      targetAmount: request.targetAmount,
      direction: request.direction,
      paymentMethod: request.paymentMethod,
      region: request.region,
      status: "processing",
      providerTxId: `mp_${v4().slice(0, 12)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    return tx
  }

  async status(txId: string): Promise<SettlementStatus> {
    return Math.random() > 0.1 ? "completed" : "pending"
  }
}
