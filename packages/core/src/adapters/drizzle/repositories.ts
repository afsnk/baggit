import { eq } from "drizzle-orm"
import type { DB } from "./db"
import * as schema from "./schema"
import type {
  ProviderRepository,
  QuoteRepository,
  TransactionRepository,
  SettlementRepository,
} from "../../domain/contracts/repository-contract"
import type { Provider } from "../../domain/entities/provider.entity"
import type { ProviderQuote } from "../../domain/entities/quote.entity"
import type { Transaction } from "../../domain/entities/transaction.entity"
import type { Settlement } from "../../domain/entities/settlement.entity"

export class DrizzleProviderRepository implements ProviderRepository {
  constructor(private db: DB) {}

  async upsert(provider: Provider): Promise<void> {
    await this.db
      .insert(schema.providers)
      .values({
        id: provider.id,
        name: provider.name,
        capabilities: JSON.stringify(provider.capabilities),
        status: provider.status,
        supportedRegions: JSON.stringify(provider.supportedRegions),
        supportedFiatCurrencies: JSON.stringify(provider.supportedFiatCurrencies),
        supportedCryptoAssets: JSON.stringify(provider.supportedCryptoAssets),
        supportedPaymentMethods: JSON.stringify(provider.supportedPaymentMethods),
        kycRequired: provider.kycRequired,
        kycLevels: JSON.stringify(provider.kycLevels),
        metadata: provider.metadata ? JSON.stringify(provider.metadata) : null,
        createdAt: provider.createdAt.toISOString(),
        updatedAt: provider.updatedAt.toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.providers.id,
        set: {
          status: provider.status,
          metadata: provider.metadata ? JSON.stringify(provider.metadata) : null,
          updatedAt: provider.updatedAt.toISOString(),
        },
      })
  }

  async get(id: string): Promise<Provider | null> {
    const row = await this.db
      .select()
      .from(schema.providers)
      .where(eq(schema.providers.id, id))
      .get()

    if (!row) return null
    return this.mapRow(row)
  }

  async getByName(name: string): Promise<Provider | null> {
    const row = await this.db
      .select()
      .from(schema.providers)
      .where(eq(schema.providers.name, name))
      .get()

    if (!row) return null
    return this.mapRow(row)
  }

  async list(): Promise<Provider[]> {
    const rows = await this.db.select().from(schema.providers).all()
    return rows.map((r) => this.mapRow(r))
  }

  private mapRow(row: any): Provider {
    return {
      id: row.id,
      name: row.name,
      capabilities: JSON.parse(row.capabilities),
      status: row.status,
      supportedRegions: JSON.parse(row.supportedRegions),
      supportedFiatCurrencies: JSON.parse(row.supportedFiatCurrencies),
      supportedCryptoAssets: JSON.parse(row.supportedCryptoAssets),
      supportedPaymentMethods: JSON.parse(row.supportedPaymentMethods),
      kycRequired: Boolean(row.kycRequired),
      kycLevels: JSON.parse(row.kycLevels),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }
  }
}

export class DrizzleQuoteRepository implements QuoteRepository {
  constructor(private db: DB) {}

  async insert(quote: ProviderQuote): Promise<void> {
    await this.db.insert(schema.quotes).values({
      id: quote.id,
      provider: quote.provider,
      direction: quote.direction,
      sourceAsset: quote.sourceAsset,
      targetAsset: quote.targetAsset,
      sourceAmount: quote.sourceAmount,
      targetAmount: quote.targetAmount,
      rate: quote.rate,
      fees: JSON.stringify(quote.fees),
      totalFeePercentage: quote.totalFee.percentage,
      totalFeeFlat: quote.totalFee.flat,
      totalFeeCurrency: quote.totalFee.currency,
      estimatedSettlementMs: quote.estimatedSettlementMs,
      paymentMethod: quote.paymentMethod,
      region: quote.region,
      expiresAt: quote.expiresAt.toISOString(),
      createdAt: quote.createdAt.toISOString(),
    })
  }

  async get(id: string): Promise<ProviderQuote | null> {
    const row = await this.db
      .select()
      .from(schema.quotes)
      .where(eq(schema.quotes.id, id))
      .get()

    if (!row) return null
    return {
      id: row.id,
      provider: row.provider,
      direction: row.direction as any,
      sourceAsset: row.sourceAsset,
      targetAsset: row.targetAsset,
      sourceAmount: row.sourceAmount,
      targetAmount: row.targetAmount,
      rate: row.rate,
      fees: JSON.parse(row.fees),
      totalFee: {
        percentage: row.totalFeePercentage,
        flat: row.totalFeeFlat,
        currency: row.totalFeeCurrency,
      },
      estimatedSettlementMs: row.estimatedSettlementMs,
      paymentMethod: row.paymentMethod as any,
      region: row.region,
      expiresAt: new Date(row.expiresAt),
      createdAt: new Date(row.createdAt),
    }
  }
}

export class DrizzleTransactionRepository implements TransactionRepository {
  constructor(private db: DB) {}

  async insert(tx: Transaction): Promise<void> {
    await this.db.insert(schema.transactions).values({
      id: tx.id,
      provider: tx.provider,
      quoteId: tx.quoteId,
      userId: tx.userId,
      sourceAsset: tx.sourceAsset,
      targetAsset: tx.targetAsset,
      sourceAmount: tx.sourceAmount,
      targetAmount: tx.targetAmount,
      direction: tx.direction,
      paymentMethod: tx.paymentMethod,
      region: tx.region,
      status: tx.status,
      providerTxId: tx.providerTxId ?? null,
      failureReason: tx.failureReason ?? null,
      idempotencyKey: tx.idempotencyKey ?? tx.id,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
    })
  }

  async update(tx: Transaction): Promise<void> {
    await this.db
      .update(schema.transactions)
      .set({
        status: tx.status,
        providerTxId: tx.providerTxId ?? null,
        failureReason: tx.failureReason ?? null,
        updatedAt: tx.updatedAt.toISOString(),
      })
      .where(eq(schema.transactions.id, tx.id))
      .run()
  }

  async get(id: string): Promise<Transaction | null> {
    const row = await this.db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.id, id))
      .get()

    if (!row) return null
    return this.mapTxRow(row)
  }

  async getByProviderTxId(
    provider: string,
    txId: string,
  ): Promise<Transaction | null> {
    const row = await this.db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.providerTxId, txId))
      .get()

    if (!row) return null
    return this.mapTxRow(row)
  }

  private mapTxRow(row: any): Transaction {
    return {
      id: row.id,
      provider: row.provider,
      quoteId: row.quoteId,
      userId: row.userId,
      sourceAsset: row.sourceAsset,
      targetAsset: row.targetAsset,
      sourceAmount: row.sourceAmount,
      targetAmount: row.targetAmount,
      direction: row.direction as any,
      paymentMethod: row.paymentMethod as any,
      region: row.region,
      status: row.status as any,
      providerTxId: row.providerTxId ?? undefined,
      failureReason: row.failureReason ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }
  }
}

export class DrizzleSettlementRepository implements SettlementRepository {
  constructor(private db: DB) {}

  async insert(s: Settlement): Promise<void> {
    await this.db.insert(schema.settlements).values({
      id: s.id,
      transactionId: s.transactionId,
      provider: s.provider,
      status: s.status,
      durationMs: s.durationMs ?? null,
      attempts: s.attempts,
      failureReason: s.failureReason ?? null,
      webhookReceived: s.webhookReceived,
      webhookPayload: s.webhookPayload ? JSON.stringify(s.webhookPayload) : null,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })
  }

  async update(s: Settlement): Promise<void> {
    await this.db
      .update(schema.settlements)
      .set({
        status: s.status,
        durationMs: s.durationMs ?? null,
        attempts: s.attempts,
        failureReason: s.failureReason ?? null,
        webhookReceived: s.webhookReceived,
        webhookPayload: s.webhookPayload ? JSON.stringify(s.webhookPayload) : null,
        completedAt: s.completedAt?.toISOString() ?? null,
        updatedAt: s.updatedAt.toISOString(),
      })
      .where(eq(schema.settlements.id, s.id))
      .run()
  }

  async get(id: string): Promise<Settlement | null> {
    const row = await this.db
      .select()
      .from(schema.settlements)
      .where(eq(schema.settlements.id, id))
      .get()

    if (!row) return null
    return this.mapRow(row)
  }

  async getByTransactionId(txId: string): Promise<Settlement | null> {
    const row = await this.db
      .select()
      .from(schema.settlements)
      .where(eq(schema.settlements.transactionId, txId))
      .get()

    if (!row) return null
    return this.mapRow(row)
  }

  private mapRow(row: any): Settlement {
    return {
      id: row.id,
      transactionId: row.transactionId,
      provider: row.provider,
      status: row.status as any,
      durationMs: row.durationMs ?? undefined,
      attempts: row.attempts,
      failureReason: row.failureReason ?? undefined,
      webhookReceived: Boolean(row.webhookReceived),
      webhookPayload: row.webhookPayload ? JSON.parse(row.webhookPayload) : undefined,
      startedAt: new Date(row.startedAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }
  }
}
