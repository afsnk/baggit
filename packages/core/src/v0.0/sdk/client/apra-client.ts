import type { ScoredRoute } from "../../application/scoring/route-scorer"
import type { RouteRequest } from "../../application/routing/route-engine"
import type { Transaction, TransactionRequest } from "../../domain/entities/transaction.entity"
import { RouteEngine } from "../../application/routing/route-engine"
import { RouteScorer } from "../../application/scoring/route-scorer"
import { ProviderRegistry } from "../../registry/provider-registry"
import { SettlementCheckScheduler } from "../../application/settlement/settlement-tracker"
import type { EventBusPort } from "../../ports/event-bus.port"
import { AnalyticsConsumer } from "../../application/analytics/analytics-consumer"

export interface ApraClientConfig {
  quoteTimeoutMs?: number
  scoringWeights?: Record<string, number>
  /** Required for durable settlement checks and event emission (§6a/§6b). */
  eventBus?: EventBusPort
}

export class ApraClient {
  readonly registry: ProviderRegistry
  readonly scorer: RouteScorer
  readonly engine: RouteEngine
  /** Present only when an event bus is injected — checks are queue tasks now. */
  readonly settlementChecks?: SettlementCheckScheduler
  readonly analytics: AnalyticsConsumer

  constructor(config?: ApraClientConfig) {
    this.registry = new ProviderRegistry()
    this.scorer = new RouteScorer(config?.scoringWeights)
    this.engine = new RouteEngine(this.registry, this.scorer, { eventBus: config?.eventBus }, {
      quoteTimeoutMs: config?.quoteTimeoutMs,
    })
    this.settlementChecks = config?.eventBus
      ? new SettlementCheckScheduler({ bus: config.eventBus })
      : undefined
    this.analytics = new AnalyticsConsumer()
  }

  async getRoutes(request: RouteRequest): Promise<ScoredRoute[]> {
    return this.engine.findRoutes(request)
  }

  async initiateTransaction(request: TransactionRequest): Promise<Transaction> {
    return this.engine.initiateTransaction(request)
  }
}
