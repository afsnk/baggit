import { describe, it, expect } from "vitest"
import { RouteScorer } from "../../application/scoring/route-scorer"
import type { ProviderQuote } from "../../domain/entities/quote.entity"
import type { ProviderMetrics } from "../../application/analytics/analytics-consumer"

function makeQuote(overrides: Partial<ProviderQuote> = {}): ProviderQuote {
  return {
    id: "q1",
    provider: "test-provider",
    direction: "buy",
    sourceAsset: "USD",
    targetAsset: "USDC",
    sourceAmount: 100,
    targetAmount: 99,
    rate: 1,
    fees: [],
    totalFee: { percentage: 1.5, flat: 0, currency: "USD" },
    estimatedSettlementMs: 30_000,
    paymentMethod: "credit_card",
    region: "US",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    ...overrides,
  }
}

describe("RouteScorer", () => {
  it("returns a score between 0 and 1", () => {
    const scorer = new RouteScorer()
    const quote = makeQuote()
    const result = scorer.score(quote, null)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it("prefers lower fees", () => {
    const scorer = new RouteScorer()
    const cheap = makeQuote({
      totalFee: { percentage: 0.5, flat: 0, currency: "USD" },
    })
    const expensive = makeQuote({
      totalFee: { percentage: 5, flat: 0, currency: "USD" },
    })
    const cheapScore = scorer.score(cheap, null)
    const expensiveScore = scorer.score(expensive, null)
    expect(cheapScore.score).toBeGreaterThan(expensiveScore.score)
  })

  it("prefers faster settlement with metrics", () => {
    const scorer = new RouteScorer()
    const quote = makeQuote({ estimatedSettlementMs: 30_000 })
    const fastMetrics: ProviderMetrics = {
      provider: "test-provider",
      totalQuotes: 100,
      successfulQuotes: 95,
      totalTransactions: 50,
      successfulSettlements: 48,
      failedSettlements: 2,
      avgSettlementMs: 2_000,
      p95SettlementMs: 5_000,
      successRate: 0.96,
      timeoutRate: 0.02,
      failureRate: 0.02,
      uptime: 0.99,
      lastUpdated: new Date(),
    }
    const slowMetrics: ProviderMetrics = {
      provider: "test-provider",
      totalQuotes: 100,
      successfulQuotes: 95,
      totalTransactions: 50,
      successfulSettlements: 40,
      failedSettlements: 10,
      avgSettlementMs: 300_000,
      p95SettlementMs: 600_000,
      successRate: 0.8,
      timeoutRate: 0.1,
      failureRate: 0.1,
      uptime: 0.85,
      lastUpdated: new Date(),
    }
    const fast = scorer.score(quote, fastMetrics)
    const slow = scorer.score(quote, slowMetrics)
    expect(fast.score).toBeGreaterThan(slow.score)
  })

  it("ranks multiple quotes in descending order", () => {
    const scorer = new RouteScorer()
    const quotes = [
      makeQuote({ provider: "p1", totalFee: { percentage: 0.5, flat: 0, currency: "USD" } }),
      makeQuote({ provider: "p2", totalFee: { percentage: 3, flat: 0, currency: "USD" } }),
      makeQuote({ provider: "p3", totalFee: { percentage: 1, flat: 0, currency: "USD" } }),
    ]
    const ranked = scorer.rank(quotes, new Map())
    expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score)
    expect(ranked[1].score).toBeGreaterThanOrEqual(ranked[2].score)
  })

  it("handles empty quote list", () => {
    const scorer = new RouteScorer()
    const ranked = scorer.rank([], new Map())
    expect(ranked).toHaveLength(0)
  })
})
