import type { CachePort, LockPort } from "../ports/cache.port"

/**
 * REQUIREMENTS.md §6c: `withIdempotency` takes the distributed lock BEFORE its
 * check-then-set, so concurrent duplicate requests execute `fn` exactly once.
 */
export interface IdempotencyDeps {
  cache: Pick<CachePort, "get" | "set">
  lock: LockPort
}

export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
  deps: IdempotencyDeps,
  ttl = 3600,
): Promise<T | null> {
  const { cache, lock } = deps
  const existing = await cache.get<T>(key)
  if (existing !== null) return existing

  return lock.withLock(`idempotency:${key}`, async () => {
    // Re-check inside the lock: another waiter may have won the race.
    const winner = await cache.get<T>(key)
    if (winner !== null) return winner

    const result = await fn()
    await cache.set(key, result, ttl)
    return result
  })
}
