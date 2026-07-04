import type { QuoteRequest, ProviderQuote } from "../../domain/entities/quote.entity"
import type { Transaction, TransactionRequest } from "../../domain/entities/transaction.entity"
import type { SettlementStatus } from "../../domain/entities/settlement.entity"
import type { ProviderCapabilities } from "../../domain/contracts/provider-contract"
import { BaseProvider } from "../base/base-provider"
import { v4 } from "../../utils/id"

const CAPABILITIES: ProviderCapabilities = {
  capabilities: ["buy", "sell"],
  supportedRegions: ["US", "UK", "EU", "CA", "AU", "BR", "NG", "KE", "ZA", "IN", "CO", "AR", "PE"],
  supportedFiatCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "BRL", "NGN", "KES", "ZAR", "INR", "COP", "ARS", "PEN"],
  supportedCryptoAssets: ["BTC", "ETH", "USDC", "USDT", "DAI", "SOL"],
  supportedPaymentMethods: ["credit_card", "debit_card", "bank_transfer", "pix", "spei", "mpesa", "payid"],
  kycRequired: true,
  kycLevels: ["basic", "intermediate", "advanced"],
}

export class RampProviderImpl extends BaseProvider {
  readonly name = "ramp"
  readonly capabilities = CAPABILITIES

  async isAvailable(region: string): Promise<boolean> {
    return CAPABILITIES.supportedRegions.includes(region as any)
  }

  async quote(request: QuoteRequest): Promise<ProviderQuote> {
    const rate = request.sourceAsset === "USDC" ? 1 : 0.99 + Math.random() * 0.02
    const feePercent = 0.5 + Math.random() * 1.5

    return {
      id: v4(),
      provider: this.name,
      direction: request.direction,
      sourceAsset: request.sourceAsset,
      targetAsset: request.targetAsset,
      sourceAmount: request.sourceAmount!,
      targetAmount: request.sourceAmount! * rate * (1 - feePercent / 100),
      rate,
      fees: [
        { percentage: feePercent, flat: 0, currency: request.sourceAsset, description: "Ramp fee" },
      ],
      totalFee: { percentage: feePercent, flat: 0, currency: request.sourceAsset },
      estimatedSettlementMs: 15_000 + Math.random() * 60_000,
      paymentMethod: request.paymentMethod,
      region: request.region,
      expiresAt: new Date(Date.now() + 120_000),
      createdAt: new Date(),
    }
  }

  async initiate(request: TransactionRequest): Promise<Transaction> {
    return {
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
      providerTxId: `rp_${v4().slice(0, 12)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  async status(txId: string): Promise<SettlementStatus> {
    return Math.random() > 0.05 ? "completed" : "failed"
  }
}
