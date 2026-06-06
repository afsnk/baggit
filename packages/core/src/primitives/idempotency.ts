export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
  cache: { get<T>(k: string): Promise<T | null>; set<T>(k: string, v: T, ttl?: number): Promise<void> },
  ttl = 3600,
): Promise<T | null> {
  const existing = await cache.get<T>(key)
  if (existing !== null) {
    return existing
  }
  const result = await fn()
  await cache.set(key, result, ttl)
  return result
}
