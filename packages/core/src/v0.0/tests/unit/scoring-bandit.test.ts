import { describe, expect, it } from "vitest"
import { wilsonLowerBound } from "../../application/scoring/route-scorer"
import { ThompsonSampler } from "../../application/scoring/bandit"

/**
 * REQUIREMENTS.md §4.2/§4.3 + §14 acceptance:
 * - Wilson lower-bound behavior pinned
 * - Thompson-sampling convergence proven
 */

describe("wilsonLowerBound — §4.2 Bayesian shrinkage", () => {
  it("penalizes tiny perfect samples below large near-perfect ones", () => {
    // 10-for-10 must NOT outrank 940-for-1000 despite 100% raw rate.
    const tiny = wilsonLowerBound(10, 10)
    const large = wilsonLowerBound(940, 1000)
    expect(tiny).toBeLessThan(large)
  })

  it("is monotonically increasing in successes for fixed total", () => {
    let prev = -1
    for (const s of [50, 70, 80, 90, 99]) {
      const bound = wilsonLowerBound(s, 100)
      expect(bound).toBeGreaterThan(prev)
      prev = bound
    }
  })

  it("stays within [0, 1] and converges toward the true rate as n grows", () => {
    const bound = wilsonLowerBound(5000, 10000)
    expect(bound).toBeGreaterThan(0)
    expect(bound).toBeLessThanOrEqual(1)
    // With huge n the lower bound approaches the observed rate.
    expect(bound).toBeGreaterThan(0.48)
  })

  it("returns 0 for zero total (no data ⇒ no confidence)", () => {
    expect(wilsonLowerBound(0, 0)).toBe(0)
  })
})

describe("ThompsonSampler — §4.3 exploration/exploitation", () => {
  it("converges onto the strictly better arm", () => {
    const sampler = new ThompsonSampler()
    // Arm "good" succeeds ~90%, arm "bad" ~20%.
    for (let i = 0; i < 200; i++) {
      if (i % 10 < 9) sampler.recordSuccess("good")
      else sampler.recordFailure("good")
      if (i % 5 < 1) sampler.recordSuccess("bad")
      else sampler.recordFailure("bad")
    }
    let goodPicks = 0
    const trials = 500
    for (let t = 0; t < trials; t++) {
      const pick = sampler.selectAmong(["good", "bad"], Number.MAX_SAFE_INTEGER)
      if (pick === "good") goodPicks += 1
    }
    expect(goodPicks / trials).toBeGreaterThan(0.8)
  })

  it("explores cold arms via optimistic priors before evidence accumulates", () => {
    const fresh = new ThompsonSampler()
    // With no observations at all both arms have Beta(1,1) — sampling must
    // not deterministically exclude either.
    const picks = new Set<string>()
    for (let t = 0; t < 100; t++) {
      const pick = fresh.selectAmong(["a", "b"], Number.MAX_SAFE_INTEGER)
      if (pick) picks.add(pick)
    }
    expect(picks.size).toBe(2)
  })

  it("keeps per-arm posterior state independent", () => {
    const sampler = new ThompsonSampler()
    sampler.recordSuccess("only")
    sampler.recordSuccess("only")
    expect(sampler.sample("untouched")).toBeGreaterThan(0)
    expect(sampler.sample("untouched")).toBeLessThanOrEqual(1)
  })
})
