import { describe, it, expect, beforeAll, afterAll } from "vitest"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "../../adapters/drizzle/schema"
import {
  DrizzleProviderRepository,
  DrizzleTransactionRepository,
} from "../../adapters/drizzle/repositories"
import type { Provider } from "../../domain/entities/provider.entity"
import type { Transaction } from "../../domain/entities/transaction.entity"

describe("Drizzle Repositories", () => {
  let client: Database.Database
  let db: any
  let providerRepo: DrizzleProviderRepository
  let txRepo: DrizzleTransactionRepository

  beforeAll(async () => {
    client = new Database(":memory:")
    client.pragma("journal_mode = WAL")
    client.pragma("foreign_keys = ON")
    db = drizzle(client, { schema }) as any

    client.exec(`
      CREATE TABLE IF NOT EXISTS providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        capabilities TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        supported_regions TEXT NOT NULL,
        supported_fiat_currencies TEXT NOT NULL,
        supported_crypto_assets TEXT NOT NULL,
        supported_payment_methods TEXT NOT NULL,
        kyc_required INTEGER NOT NULL DEFAULT 0,
        kyc_levels TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        quote_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        source_asset TEXT NOT NULL,
        target_asset TEXT NOT NULL,
        source_amount REAL NOT NULL,
        target_amount REAL NOT NULL,
        direction TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        region TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        provider_tx_id TEXT,
        failure_reason TEXT,
        idempotency_key TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settlements (
        id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL REFERENCES transactions(id),
        provider TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        duration_ms INTEGER,
        attempts INTEGER NOT NULL DEFAULT 0,
        failure_reason TEXT,
        webhook_received INTEGER NOT NULL DEFAULT 0,
        webhook_payload TEXT,
        started_at TEXT NOT NULL,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `)

    providerRepo = new DrizzleProviderRepository(db as any)
    txRepo = new DrizzleTransactionRepository(db as any)
  })

  afterAll(() => {
    client.close()
  })

  it("inserts and retrieves a provider", async () => {
    const provider: Provider = {
      id: "test-1",
      name: "test-provider",
      capabilities: ["buy", "sell"],
      status: "active",
      supportedRegions: ["US", "EU"],
      supportedFiatCurrencies: ["USD", "EUR"],
      supportedCryptoAssets: ["BTC", "ETH"],
      supportedPaymentMethods: ["credit_card"],
      kycRequired: true,
      kycLevels: ["basic"],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await providerRepo.upsert(provider)
    const retrieved = await providerRepo.get("test-1")
    expect(retrieved).not.toBeNull()
    expect(retrieved!.name).toBe("test-provider")
    expect(retrieved!.capabilities).toEqual(["buy", "sell"])
  })

  it("lists all providers", async () => {
    const providers = await providerRepo.list()
    expect(providers.length).toBeGreaterThanOrEqual(1)
  })

  it("inserts and retrieves a transaction", async () => {
    const tx: Transaction = {
      id: "tx-1",
      provider: "test-provider",
      quoteId: "q-1",
      userId: "user-1",
      sourceAsset: "USD",
      targetAsset: "USDC",
      sourceAmount: 100,
      targetAmount: 99,
      direction: "buy",
      paymentMethod: "credit_card",
      region: "US",
      status: "pending",
      idempotencyKey: "ik-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await txRepo.insert(tx)
    const retrieved = await txRepo.get("tx-1")
    expect(retrieved).not.toBeNull()
    expect(retrieved!.status).toBe("pending")
  })

  it("updates a transaction", async () => {
    await txRepo.update({
      id: "tx-1",
      provider: "test-provider",
      quoteId: "q-1",
      userId: "user-1",
      sourceAsset: "USD",
      targetAsset: "USDC",
      sourceAmount: 100,
      targetAmount: 99,
      direction: "buy",
      paymentMethod: "credit_card",
      region: "US",
      status: "settled",
      idempotencyKey: "ik-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const retrieved = await txRepo.get("tx-1")
    expect(retrieved!.status).toBe("settled")
  })
})
