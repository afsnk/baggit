/**
 * REQUIREMENTS.md §4: Thompson sampling over Beta posteriors.
 * Pure instance state (per-rail success/failure counts); no globals, no
 * timers. Sampling uses the sum-of-gammas identity
 * Beta(a, b) = G(a) / (G(a) + G(b)) with Marsaglia–Tsang gamma variates.
 */

interface Posterior {
  alpha: number // successes + 1
  beta: number // failures + 1
}

function standardNormal(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function gammaSample(shape: number): number {
  if (shape < 1) {
    // Boost trick: G(x) = G(x+1) * U^(1/x).
    return gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape)
  }
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  for (;;) {
    let x: number
    let v: number
    do {
      x = standardNormal()
      v = 1 + c * x
    } while (v <= 0)
    v = v * v * v
    const u = Math.random()
    if (u < 1 - 0.0331 * x * x * x * x) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

export class ThompsonSampler {
  private posteriors = new Map<string, Posterior>()

  private posteriorOf(name: string): Posterior {
    let p = this.posteriors.get(name)
    if (!p) {
      p = { alpha: 1, beta: 1 } // uniform prior Beta(1, 1)
      this.posteriors.set(name, p)
    }
    return p
  }

  recordSuccess(name: string): void {
    this.posteriorOf(name).alpha++
  }

  recordFailure(name: string): void {
    this.posteriorOf(name).beta++
  }

  /** Draw one sample from the rail's Beta posterior. */
  sample(name: string): number {
    const p = this.posteriorOf(name)
    const gA = gammaSample(p.alpha)
    const gB = gammaSample(p.beta)
    return gA / (gA + gB)
  }

  /** Posterior mean — the deterministic score used for tie detection. */
  mean(name: string): number {
    const p = this.posteriorOf(name)
    return p.alpha / (p.alpha + p.beta)
  }

  /**
   * Sample among `candidates`. Returns the sampled pick only when the
   * candidates' deterministic posterior means are within `epsilon` of each
   * other (a near-tie set — the caller may pre-filter to that set);
   * otherwise returns null so the caller falls back to its deterministic
   * ranking.
   */
  selectAmong(candidates: string[], epsilon: number): string | null {
    if (candidates.length === 0) return null
    if (candidates.length === 1) return candidates[0]
    const means = candidates.map((c) => this.mean(c))
    const spread = Math.max(...means) - Math.min(...means)
    if (spread > epsilon) return null
    // Thompson step: one posterior sample per candidate, argmax wins.
    let best = candidates[0]
    let bestSample = -1
    for (const c of candidates) {
      const drawn = this.sample(c)
      if (drawn > bestSample) {
        bestSample = drawn
        best = c
      }
    }
    return best
  }
}
