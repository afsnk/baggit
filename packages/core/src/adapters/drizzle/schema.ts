import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core"

export const providers = sqliteTable("providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  capabilities: text("capabilities").notNull(),
  status: text("status").notNull().default("active"),
  supportedRegions: text("supported_regions").notNull(),
  supportedFiatCurrencies: text("supported_fiat_currencies").notNull(),
  supportedCryptoAssets: text("supported_crypto_assets").notNull(),
  supportedPaymentMethods: text("supported_payment_methods").notNull(),
  kycRequired: integer("kyc_required", { mode: "boolean" }).notNull().default(false),
  kycLevels: text("kyc_levels").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const quotes = sqliteTable("quotes", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  direction: text("direction").notNull(),
  sourceAsset: text("source_asset").notNull(),
  targetAsset: text("target_asset").notNull(),
  sourceAmount: real("source_amount").notNull(),
  targetAmount: real("target_amount").notNull(),
  rate: real("rate").notNull(),
  fees: text("fees").notNull(),
  totalFeePercentage: real("total_fee_percentage").notNull(),
  totalFeeFlat: real("total_fee_flat").notNull(),
  totalFeeCurrency: text("total_fee_currency").notNull(),
  estimatedSettlementMs: integer("estimated_settlement_ms").notNull(),
  paymentMethod: text("payment_method").notNull(),
  region: text("region").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
})

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  quoteId: text("quote_id").notNull(),
  userId: text("user_id").notNull(),
  sourceAsset: text("source_asset").notNull(),
  targetAsset: text("target_asset").notNull(),
  sourceAmount: real("source_amount").notNull(),
  targetAmount: real("target_amount").notNull(),
  direction: text("direction").notNull(),
  paymentMethod: text("payment_method").notNull(),
  region: text("region").notNull(),
  status: text("status").notNull().default("pending"),
  providerTxId: text("provider_tx_id"),
  failureReason: text("failure_reason"),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const settlements = sqliteTable("settlements", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("pending"),
  durationMs: integer("duration_ms"),
  attempts: integer("attempts").notNull().default(0),
  failureReason: text("failure_reason"),
  webhookReceived: integer("webhook_received", { mode: "boolean" }).notNull().default(false),
  webhookPayload: text("webhook_payload"),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const providerMetrics = sqliteTable("provider_metrics", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull().unique(),
  totalQuotes: integer("total_quotes").notNull().default(0),
  successfulQuotes: integer("successful_quotes").notNull().default(0),
  totalTransactions: integer("total_transactions").notNull().default(0),
  successfulSettlements: integer("successful_settlements").notNull().default(0),
  failedSettlements: integer("failed_settlements").notNull().default(0),
  avgSettlementMs: real("avg_settlement_ms").notNull().default(0),
  p95SettlementMs: real("p95_settlement_ms").notNull().default(0),
  successRate: real("success_rate").notNull().default(1),
  timeoutRate: real("timeout_rate").notNull().default(0),
  failureRate: real("failure_rate").notNull().default(0),
  uptime: real("uptime").notNull().default(1),
  lastUpdated: text("last_updated").notNull(),
})

export const routeMetrics = sqliteTable("route_metrics", {
  id: text("id").primaryKey(),
  sourceAsset: text("source_asset").notNull(),
  targetAsset: text("target_asset").notNull(),
  region: text("region").notNull(),
  totalRequests: integer("total_requests").notNull().default(0),
  successfulRoutes: integer("successful_routes").notNull().default(0),
  avgScore: real("avg_score").notNull().default(0),
  avgSettlementMs: real("avg_settlement_ms").notNull().default(0),
  lastUpdated: text("last_updated").notNull(),
})

export const eventLog = sqliteTable("event_log", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  payload: text("payload").notNull(),
  traceId: text("trace_id").notNull(),
  subject: text("subject").notNull(),
  createdAt: text("created_at").notNull(),
})
