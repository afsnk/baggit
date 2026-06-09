import type { ScoredRoute } from "../../application/scoring/route-scorer"
import type { RouteRequest } from "../../application/routing/route-engine"
import type { Transaction, TransactionRequest } from "../../domain/entities/transaction.entity"
import { RouteEngine } from "../../application/routing/route-engine"
import { RouteScorer } from "../../application/scoring/route-scorer"
import { ProviderRegistry } from "../../registry/provider-registry"
import { SettlementTracker } from "../../application/settlement/settlement-tracker"
import { AnalyticsConsumer } from "../../application/analytics/analytics-consumer"

export interface ApraClientConfig {
  quoteTimeoutMs?: number
  scoringWeights?: Record<string, number>
}

export class ApraClient {
  readonly registry: ProviderRegistry
  readonly scorer: RouteScorer
  readonly engine: RouteEngine
  readonly settlements: SettlementTracker
  readonly analytics: AnalyticsConsumer

  constructor(config?: ApraClientConfig) {
    this.registry = new ProviderRegistry()
    this.scorer = new RouteScorer(config?.scoringWeights)
    this.engine = new RouteEngine(this.registry, this.scorer, undefined, {
      quoteTimeoutMs: config?.quoteTimeoutMs,
    })
    this.settlements = new SettlementTracker()
    this.analytics = new AnalyticsConsumer()
  }

  async getRoutes(request: RouteRequest): Promise<ScoredRoute[]> {
    return this.engine.findRoutes(request)
  }

  async initiateTransaction(request: TransactionRequest): Promise<Transaction> {
    return this.engine.initiateTransaction(request)
  }
}
