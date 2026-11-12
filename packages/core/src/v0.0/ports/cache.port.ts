export interface CachePort {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
}

export interface LockPort {
  acquire(key: string, ttl?: number): Promise<boolean>
  release(key: string): Promise<void>
  withLock<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>
}
