/**
 * Event-driven delay/timeout helpers (§6b): no in-process timer handles.
 * Built on AbortSignal.timeout so the platform/runtime owns scheduling.
 */

/** Resolve after `ms` milliseconds via an abort signal — no timer handle. */
export function delay(ms: number): Promise<void> {
  const wholeMs = Math.max(0, Math.round(ms))
  if (wholeMs === 0) return Promise.resolve()
  const signal = AbortSignal.timeout(wholeMs)
  const { promise, resolve } = Promise.withResolvers<void>()
  signal.addEventListener("abort", () => resolve(), { once: true })
  return promise
}

/** Reject with `error` if `promise` does not settle within `ms`. */
export function raceWithTimeout<T>(promise: Promise<T>, ms: number, error: Error): Promise<T> {
  const signal = AbortSignal.timeout(ms)
  const { promise: gated, reject } = Promise.withResolvers<never>()
  signal.addEventListener("abort", () => reject(error), { once: true })
  return Promise.race([promise, gated])
}
