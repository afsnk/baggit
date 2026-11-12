import { CircuitBreaker } from "../../utils/circuit-breaker"
import { ThompsonSampler } from "../scoring/bandit"

/**
 * REQUIREMENTS.md §4: internal rail selection.
 * Healthy default wins outright (no exploration); on failure the highest
 * deterministic score among healthy candidates is selected, with
 * Thompson-sampling tie-breaking inside `epsilon`. Event emission is left
 * to the caller.
 */

export interface SmartRouterDeps<R> {
  /** Circuit breakers keyed by candidate name; open ⇒ unhealthy. */
  circuitBreakers?: Map<string, CircuitBreaker>
  /** Explicit health probe; takes precedence over breakers when given. */
  probe?: (candidate: R) => boolean
}

export interface SelectOptions {
  /** Near-tie bandwidth for Thompson sampling. */
  epsilon: number
}

export interface RouteSelection<R> {
  selected: R
  failedOver: boolean
  reason?: string
}

export class SmartRouter<R extends { name: string }> {
  private readonly sampler = new ThompsonSampler()
  private readonly isHealthy: (candidate: R) => boolean

  constructor(deps: SmartRouterDeps<R> = {}) {
    if (deps.probe) {
      this.isHealthy = deps.probe
    } else if (deps.circuitBreakers) {
      const breakers = deps.circuitBreakers
      this.isHealthy = (candidate) => {
        const breaker = breakers.get(candidate.name)
        // Unknown candidate without a breaker is treated as healthy.
        return breaker ? !breaker.isOpen() : true
      }
    } else {
      this.isHealthy = () => true
    }
  }

  /** Record outcomes so near-tie exploration adapts over time. */
  recordSuccess(name: string): void {
    this.sampler.recordSuccess(name)
  }

  recordFailure(name: string): void {
    this.sampler.recordFailure(name)
  }

  select(
    requestedDefault: R | null,
    eligible: R[],
    scoreOf: (candidate: R) => number,
    opts: SelectOptions,
  ): RouteSelection<R> {
    const healthy = eligible.filter((r) => this.isHealthy(r))
    const pool = healthy.length > 0 ? healthy : eligible

    if (requestedDefault && pool.includes(requestedDefault) && this.isHealthy(requestedDefault)) {
      return { selected: requestedDefault, failedOver: false }
    }

    if (pool.length === 0) {
      throw new Error("SmartRouter: no eligible candidates")
    }

    const byScore = [...pool].sort((a, b) => scoreOf(b) - scoreOf(a))
    const best = byScore[0]
    const bestScore = scoreOf(best)

    // Near-tie set: everything within epsilon of the best deterministic score.
    const nearTie = byScore.filter((r) => bestScore - scoreOf(r) <= opts.epsilon).map((r) => r.name)
    const sampled = this.sampler.selectAmong(nearTie, opts.epsilon)
    const picked = (sampled && pool.find((r) => r.name === sampled)) || best

    const reason = requestedDefault
      ? `default "${requestedDefault.name}" unhealthy`
      : "no default requested"
    return { selected: picked, failedOver: true, reason }
  }
}
