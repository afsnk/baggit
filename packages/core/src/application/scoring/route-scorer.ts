import type { ProviderQuote } from "../../domain/entities/quote.entity"
import type { ProviderMetrics } from "../analytics/analytics-consumer"

export interface ScoringWeights {
  settlementSpeed: number
  feePercentage: number
  liquidityDepth: number
  failureRate: number
  providerUptime: number
  regionalAvailability: number
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  settlementSpeed: 0.25,
  feePercentage: 0.25,
  liquidityDepth: 0.15,
  failureRate: 0.15,
  providerUptime: 0.1,
  regionalAvailability: 0.1,
}

export interface ScoredRoute {
  provider: string
  quote: ProviderQuote
  score: number
  factorScores: Record<string, number>
  metrics: ProviderMetrics | null
}

export class RouteScorer {
  private weights: ScoringWeights

  constructor(weights: Partial<ScoringWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights }
  }

  score(
    quote: ProviderQuote,
    metrics: ProviderMetrics | null,
  ): Omit<ScoredRoute, "metrics"> {
    const factorScores: Record<string, number> = {}

    factorScores.feePercentage = this.scoreFee(quote)
    factorScores.settlementSpeed = this.scoreSettlementSpeed(quote, metrics)
    factorScores.providerUptime = this.scoreUptime(metrics)
    factorScores.failureRate = this.scoreFailureRate(metrics)

    const totalScore = Object.entries(this.weights).reduce(
      (acc, [key, weight]) => {
        const factorScore = factorScores[key] ?? 0.5
        return acc + factorScore * weight
      },
      0,
    )

    return {
      provider: quote.provider,
      quote,
      score: Math.min(1, Math.max(0, totalScore)),
      factorScores,
    }
  }

  rank(
    quotes: ProviderQuote[],
    metricsMap: Map<string, ProviderMetrics>,
  ): ScoredRoute[] {
    const scored = quotes.map((q) => ({
      ...this.score(q, metricsMap.get(q.provider) ?? null),
      metrics: metricsMap.get(q.provider) ?? null,
    }))
    return scored.sort((a, b) => b.score - a.score)
  }

  private scoreFee(quote: ProviderQuote): number {
    const totalFeePercent = quote.totalFee.percentage + (quote.totalFee.flat / quote.sourceAmount) * 100
    return Math.max(0, 1 - totalFeePercent / 10)
  }

  private scoreSettlementSpeed(
    quote: ProviderQuote,
    metrics: ProviderMetrics | null,
  ): number {
    const estimated = metrics?.avgSettlementMs ?? quote.estimatedSettlementMs
    if (estimated <= 1_000) return 1
    if (estimated <= 5_000) return 0.8
    if (estimated <= 30_000) return 0.5
    if (estimated <= 120_000) return 0.2
    return 0.05
  }

  private scoreUptime(metrics: ProviderMetrics | null): number {
    if (!metrics) return 0.5
    return metrics.uptime
  }

  private scoreFailureRate(metrics: ProviderMetrics | null): number {
    if (!metrics) return 0.5
    return Math.max(0, 1 - metrics.failureRate)
  }
}
