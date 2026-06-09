import type { CachePort, LockPort } from "../../ports/cache.port"
import type { NatsConnectionManager } from "./nats-connection"

export class NatsCache implements CachePort {
  constructor(private nats: NatsConnectionManager) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const nc = this.nats.getConnection()
      const js = nc.jetstream()
      const bucket = await js.views.kv("apra_cache")
      const entry = await bucket.get(key)
      if (!entry) return null
      return JSON.parse(new TextDecoder().decode(entry.value)) as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const nc = this.nats.getConnection()
    const js = nc.jetstream()
    const bucket = await js.views.kv("apra_cache")
    const data = new TextEncoder().encode(JSON.stringify(value))
    await bucket.put(key, data)
  }

  async delete(key: string): Promise<void> {
    const nc = this.nats.getConnection()
    const js = nc.jetstream()
    const bucket = await js.views.kv("apra_cache")
    await bucket.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    const val = await this.get(key)
    return val !== null
  }
}

export class NatsLock implements LockPort {
  constructor(private nats: NatsConnectionManager) {}

  async acquire(key: string, ttl = 10_000): Promise<boolean> {
    const nc = this.nats.getConnection()
    const js = nc.jetstream()
    const bucket = await js.views.kv("apra_locks")

    try {
      const data = new TextEncoder().encode(
        JSON.stringify({ locked: true, acquired: Date.now() }),
      )
      await bucket.create(key, data)
      return true
    } catch {
      return false
    }
  }

  async release(key: string): Promise<void> {
    const nc = this.nats.getConnection()
    const js = nc.jetstream()
    const bucket = await js.views.kv("apra_locks")
    await bucket.delete(key)
  }

  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const acquired = await this.acquire(key, ttl)
    if (!acquired) {
      throw new Error(`Failed to acquire lock: ${key}`)
    }
    try {
      return await fn()
    } finally {
      await this.release(key)
    }
  }
}
