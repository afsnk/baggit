import type { ProviderPort } from "../../ports/provider.port"
import type { EventBusPort } from "../../ports/event-bus.port"
import type { CachePort } from "../../ports/cache.port"
import type { ProviderQuote, QuoteRequest } from "../../domain/entities/quote.entity"
import type { Transaction, TransactionRequest } from "../../domain/entities/transaction.entity"
import type { ProviderMetrics } from "../analytics/analytics-consumer"
import { ProviderRegistry, type ProviderFilter } from "../../registry/provider-registry"
import { RouteScorer, type ScoredRoute } from "../scoring/route-scorer"
import { v4 as uuid } from "../../utils/id"

export interface RouteRequest {
  sourceAsset: string
  targetAsset: string
  amount: number
  direction: "buy" | "sell"
  region: string
  paymentMethod: string
  userId?: string
  kycLevel?: string
}

export interface EngineConfig {
  quoteTimeoutMs: number
  maxQuotesPerProvider: number
}

const DEFAULT_CONFIG: EngineConfig = {
  quoteTimeoutMs: 5_000,
  maxQuotesPerProvider: 1,
}

export class RouteEngine {
  private registry: ProviderRegistry
  private scorer: RouteScorer
  private eventBus?: EventBusPort
  private cache?: CachePort
  private config: EngineConfig

  constructor(
    registry: ProviderRegistry,
    scorer: RouteScorer,
    deps?: { eventBus?: EventBusPort; cache?: CachePort },
    config?: Partial<EngineConfig>,
  ) {
    this.registry = registry
    this.scorer = scorer
    this.eventBus = deps?.eventBus
    this.cache = deps?.cache
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async findRoutes(request: RouteRequest): Promise<ScoredRoute[]> {
    const cacheKey = this.buildCacheKey(request)

    if (this.cache) {
      const cached = await this.cache.get<ScoredRoute[]>(cacheKey)
      if (cached) return cached
    }

    const filter: ProviderFilter = {
      regions: [request.region as any],
      paymentMethods: [request.paymentMethod as any],
    }
    if (["buy", "sell"].includes(request.direction)) {
      filter.capabilities = [request.direction as "buy" | "sell"]
    }

    const providers = this.registry.list(filter)

    const quotes = await this.fetchQuotes(providers, request)
    const metricsMap = await this.fetchMetrics(providers)
    const ranked = this.scorer.rank(quotes, metricsMap)

    if (this.eventBus) {
      await this.eventBus.emit("QuoteRequested", {
        requestId: uuid(),
        sourceAsset: request.sourceAsset,
        targetAsset: request.targetAsset,
        direction: request.direction,
        amount: request.amount,
        region: request.region,
        providersQueried: providers.map((p) => p.name),
        responseCount: quotes.length,
        timestamp: new Date().toISOString(),
      })
    }

    if (this.cache && ranked.length > 0) {
      await this.cache.set(cacheKey, ranked, 30)
    }

    return ranked
  }

  async initiateTransaction(request: TransactionRequest): Promise<Transaction> {
    const provider = this.registry.get(request.provider)
    if (!provider) {
      throw new Error(`Provider "${request.provider}" not found in registry`)
    }

    const tx = await provider.initiate(request)

    if (this.eventBus) {
      await this.eventBus.emit("TransactionInitiated", {
        transactionId: tx.id,
        provider: tx.provider,
        userId: tx.userId,
        sourceAsset: tx.sourceAsset,
        targetAsset: tx.targetAsset,
        sourceAmount: tx.sourceAmount,
        targetAmount: tx.targetAmount,
        direction: tx.direction,
        timestamp: new Date().toISOString(),
      })
    }

    return tx
  }

  private async fetchQuotes(
    providers: ProviderPort[],
    request: RouteRequest,
  ): Promise<ProviderQuote[]> {
    const quoteRequest: QuoteRequest = {
      sourceAsset: request.sourceAsset,
      targetAsset: request.targetAsset,
      sourceAmount: request.amount,
      direction: request.direction,
      region: request.region,
      paymentMethod: request.paymentMethod as any,
    }

    const results = await Promise.allSettled(
      providers.map(async (p) => {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`quote timeout for ${p.name}`)), this.config.quoteTimeoutMs),
        )
        return Promise.race([p.quote(quoteRequest), timeout])
      }),
    )

    return results
      .filter(
        (r): r is PromiseFulfilledResult<ProviderQuote> =>
          r.status === "fulfilled" && r.value !== null,
      )
      .map((r) => r.value)
  }

  private async fetchMetrics(
    providers: ProviderPort[],
  ): Promise<Map<string, ProviderMetrics>> {
    const map = new Map<string, ProviderMetrics>()

    for (const p of providers) {
      if (this.cache) {
        const cached = await this.cache.get<ProviderMetrics>(`metrics:${p.name}`)
        if (cached) {
          map.set(p.name, cached)
        }
      }
    }

    return map
  }

  private buildCacheKey(request: RouteRequest): string {
    return `routes:${request.sourceAsset}:${request.targetAsset}:${request.amount}:${request.direction}:${request.region}:${request.paymentMethod}`
  }
}
