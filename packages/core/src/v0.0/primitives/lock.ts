import type { LockPort } from "../ports/cache.port"

/**
 * REQUIREMENTS.md §6c: distributed-lock support primitive.
 *
 * The kernel receives a `LockPort` whose adapter provides atomic
 * acquire/release (e.g. NATS KV revision CAS). `MemoryLockPort` here is
 * for tests and single-instance hosts only — it is NOT distributed.
 */
export class MemoryLockPort implements LockPort {
  private held = new Map<string, Promise<unknown>>()

  async acquire(key: string): Promise<boolean> {
    if (this.held.has(key)) return false
    this.held.set(key, Promise.resolve())
    return true
  }

  async release(key: string): Promise<void> {
    this.held.delete(key)
  }

  async withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.held.get(key) ?? Promise.resolve()
    let release!: () => void
    const gate = new Promise<void>((res) => {
      release = res
    })
    const chained = previous.then(() => gate, () => gate)
    this.held.set(key, chained)
    await previous.catch(() => undefined)
    try {
      return await fn()
    } finally {
      release()
      if (this.held.get(key) === chained) this.held.delete(key)
    }
  }
}
