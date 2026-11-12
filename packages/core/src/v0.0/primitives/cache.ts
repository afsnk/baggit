import type { CachePort, LockPort } from "../ports/cache.port"

let defaultCache: CachePort | null = null
let defaultLock: LockPort | null = null

export function setCache(cache: CachePort): void {
  defaultCache = cache
}

export function getCache(): CachePort {
  if (!defaultCache) {
    throw new Error("Cache not configured. Call setCache() first.")
  }
  return defaultCache
}

export function setLock(lock: LockPort): void {
  defaultLock = lock
}

export function getLock(): LockPort {
  if (!defaultLock) {
    throw new Error("Lock not configured. Call setLock() first.")
  }
  return defaultLock
}

export const cache = {
  get<T>(key: string): Promise<T | null> {
    return getCache().get<T>(key)
  },
  set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return getCache().set(key, value, ttl)
  },
  delete(key: string): Promise<void> {
    return getCache().delete(key)
  },
  exists(key: string): Promise<boolean> {
    return getCache().exists(key)
  },
}

export const lock = {
  acquire(key: string, ttl?: number): Promise<boolean> {
    return getLock().acquire(key, ttl)
  },
  release(key: string): Promise<void> {
    return getLock().release(key)
  },
  withLock<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    return getLock().withLock(key, fn, ttl)
  },
}
