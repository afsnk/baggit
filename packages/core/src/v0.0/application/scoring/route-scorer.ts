import type { ProviderQuote } from "../../domain/entities/quote.entity"
import type { ProviderMetrics } from "../analytics/analytics-consumer"
import { calculateEffectiveRate } from "../../domain/value-objects/fee"

/**
 * Wilson score interval LOWER bound at confidence level implied by `z`
 * (default 95%, z = 1.96). Used as the reliability factor so a provider
 * with a high success rate over a tiny sample does not outrank one with a
 * proven record (REQUIREMENTS.md §4).
 */
export function wilsonLowerBound(successes: number, total: number, z = 1.96): number {
  if (!Number.isFinite(successes) || !Number.isFinite(total) || total <= 0) return 0
  const n = Math.max(0, total)
  const s = Math.min(Math.max(0, successes), n)
  const p = s / n
  const z2 = z * z
  const denom = 1 + z2 / n
  const center = p + z2 / (2 * n)
  const margin = z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))
  return Math.min(1, Math.max(0, (center - margin) / denom))
}

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
    // §6d money rule: source/fee amounts are decimal strings; the shared
    // fixed-point helper yields the effective fee percentage.
    const totalFeePercent = calculateEffectiveRate(quote.totalFee, quote.sourceAmount)
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

  /**
   * Reliability factor: Wilson/Beta posterior LOWER bound of the true
   * success rate at 95% confidence — penalizes small samples.
   */
  private scoreFailureRate(metrics: ProviderMetrics | null): number {
    if (!metrics || metrics.totalTransactions <= 0) return 0.5
    return wilsonLowerBound(metrics.successfulSettlements, metrics.totalTransactions)
  }
}
