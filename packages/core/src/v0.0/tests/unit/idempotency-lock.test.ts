import { describe, expect, it } from "vitest"
import { withIdempotency } from "../../primitives/idempotency"
import { MemoryLockPort } from "../../primitives/lock"
import type { CachePort } from "../../ports/cache.port"

/** In-memory CachePort standing in for NATS KV in unit tests. */
function memoryCache(): CachePort & { store: Map<string, unknown> } {
  const store = new Map<string, unknown>()
  return {
    store,
    async get<T>(key: string) {
      return (store.get(key) as T) ?? null
    },
    async set<T>(key: string, value: T) {
      store.set(key, value)
    },
    async delete(key: string) {
      store.delete(key)
    },
    async exists(key: string) {
      return store.has(key)
    },
  }
}

describe("withIdempotency — §6c lock-proven exactly-once", () => {
  it("executes fn exactly once under concurrent duplicate requests", async () => {
    const cache = memoryCache()
    const lock = new MemoryLockPort()
    let executions = 0

    const run = () =>
      withIdempotency(
        "req-1",
        async () => {
          executions += 1
          // widen the race window so concurrent callers overlap inside fn
          await new Promise((r) => setTimeout(r, 10))
          return { ok: true, n: executions }
        },
        { cache, lock },
      )

    const results = await Promise.all([run(), run(), run(), run(), run()])
    expect(executions).toBe(1)
    for (const r of results) expect(r).toEqual({ ok: true, n: 1 })
  })

  it("short-circuits on cache hit without touching the lock path", async () => {
    const cache = memoryCache()
    const lock = new MemoryLockPort()
    let executions = 0

    const first = await withIdempotency("k", async () => ++executions, { cache, lock })
    const second = await withIdempotency("k", async () => ++executions, { cache, lock })

    expect(executions).toBe(1)
    expect(first).toBe(1)
    expect(second).toBe(1)
  })
})

describe("MemoryLockPort", () => {
  it("serializes critical sections per key", async () => {
    const lock = new MemoryLockPort()
    const order: string[] = []

    const worker = (name: string, delayMs: number) =>
      lock.withLock("same-key", async () => {
        order.push(`${name}:start`)
        await new Promise((r) => setTimeout(r, delayMs))
        order.push(`${name}:end`)
      })

    await Promise.all([worker("a", 20), worker("b", 5)])
    expect(order).toEqual(["a:start", "a:end", "b:start", "b:end"])
  })
})
