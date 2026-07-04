import type { EventBusPort, ConsumerPort } from "../../ports/event-bus.port"
import type { CachePort } from "../../ports/cache.port"

export interface ProviderMetrics {
  provider: string
  totalQuotes: number
  successfulQuotes: number
  totalTransactions: number
  successfulSettlements: number
  failedSettlements: number
  avgSettlementMs: number
  p95SettlementMs: number
  successRate: number
  timeoutRate: number
  failureRate: number
  uptime: number
  lastUpdated: Date
}

export interface RouteMetrics {
  sourceAsset: string
  targetAsset: string
  region: string
  totalRequests: number
  successfulRoutes: number
  avgScore: number
  avgSettlementMs: number
}

export class AnalyticsConsumer {
  private eventBus?: EventBusPort
  private consumer?: ConsumerPort
  private cache?: CachePort
  private metrics = new Map<string, ProviderMetrics>()
  private routeMetrics = new Map<string, RouteMetrics>()

  constructor(deps?: { eventBus?: EventBusPort; consumer?: ConsumerPort; cache?: CachePort }) {
    this.eventBus = deps?.eventBus
    this.consumer = deps?.consumer
    this.cache = deps?.cache
  }

  onSettlementCompleted(data: {
    provider: string
    durationMs: number
  }): void {
    const key = data.provider
    const current = this.metrics.get(key) ?? this.defaultMetrics(data.provider)

    const totalDone = current.successfulSettlements + current.failedSettlements + 1
    current.successfulSettlements += 1
    current.totalTransactions += 1
    current.avgSettlementMs =
      (current.avgSettlementMs * totalDone + data.durationMs) / (totalDone + 1)
    current.successRate = current.successfulSettlements / current.totalTransactions
    current.lastUpdated = new Date()

    this.metrics.set(key, current)
    this.flushMetrics(key)
  }

  onSettlementFailed(data: {
    provider: string
    failureReason: string
  }): void {
    const key = data.provider
    const current = this.metrics.get(key) ?? this.defaultMetrics(data.provider)

    current.failedSettlements += 1
    current.totalTransactions += 1
    current.failureRate = current.failedSettlements / current.totalTransactions
    current.lastUpdated = new Date()

    this.metrics.set(key, current)
    this.flushMetrics(key)
  }

  onQuoteRequested(data: {
    providersQueried: string[]
  }): void {
    for (const provider of data.providersQueried) {
      const current = this.metrics.get(provider) ?? this.defaultMetrics(provider)
      current.totalQuotes += 1
      this.metrics.set(provider, current)
    }
  }

  getProviderMetrics(provider: string): ProviderMetrics | null {
    return this.metrics.get(provider) ?? null
  }

  getAllMetrics(): Map<string, ProviderMetrics> {
    return new Map(this.metrics)
  }

  private async flushMetrics(provider: string): Promise<void> {
    const metrics = this.metrics.get(provider)
    if (metrics && this.cache) {
      await this.cache.set(`metrics:${provider}`, metrics, 300)
    }
  }

  private defaultMetrics(provider: string): ProviderMetrics {
    return {
      provider,
      totalQuotes: 0,
      successfulQuotes: 0,
      totalTransactions: 0,
      successfulSettlements: 0,
      failedSettlements: 0,
      avgSettlementMs: 0,
      p95SettlementMs: 0,
      successRate: 1,
      timeoutRate: 0,
      failureRate: 0,
      uptime: 1,
      lastUpdated: new Date(),
    }
  }
}
