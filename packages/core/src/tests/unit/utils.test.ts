import { describe, it, expect } from "vitest"
import { CircuitBreaker } from "../../utils/circuit-breaker"
import { retry } from "../../utils/retry"
import { calculateTotalFee, calculateEffectiveRate } from "../../domain/value-objects/fee"
import { meetsKYCRequirement } from "../../domain/value-objects/kyc"

describe("CircuitBreaker", () => {
  it("starts closed", () => {
    const cb = new CircuitBreaker("test", 3)
    expect(cb.isOpen()).toBe(false)
  })

  it("opens after threshold failures", () => {
    const cb = new CircuitBreaker("test", 3)
    cb.onFailure()
    cb.onFailure()
    cb.onFailure()
    expect(cb.isOpen()).toBe(true)
  })

  it("resets on success", () => {
    const cb = new CircuitBreaker("test", 3)
    cb.onFailure()
    cb.onFailure()
    cb.onSuccess()
    expect(cb.isOpen()).toBe(false)
  })

  it("rejects calls when open", async () => {
    const cb = new CircuitBreaker("test", 1)
    cb.onFailure()
    await expect(cb.call(async () => "ok")).rejects.toThrow("Circuit breaker is OPEN")
  })
})

describe("retry", () => {
  it("succeeds on first attempt", async () => {
    const result = await retry(async () => "ok", { maxRetries: 3 })
    expect(result).toBe("ok")
  })

  it("retries on failure and eventually succeeds", async () => {
    let attempts = 0
    const result = await retry(async () => {
      attempts++
      if (attempts < 3) throw new Error("not yet")
      return "finally"
    }, { maxRetries: 3, baseDelayMs: 10 })
    expect(result).toBe("finally")
    expect(attempts).toBe(3)
  })

  it("throws after exhausting retries", async () => {
    await expect(
      retry(async () => { throw new Error("always fail") }, { maxRetries: 2, baseDelayMs: 10 }),
    ).rejects.toThrow("always fail")
  })
})

describe("Fee calculations", () => {
  it("calculates total fee correctly", () => {
    const fee = { percentage: 2, flat: 1, currency: "USD" }
    expect(calculateTotalFee(fee, 100)).toBe(3)
  })

  it("calculates effective rate", () => {
    const fee = { percentage: 2, flat: 1, currency: "USD" }
    expect(calculateEffectiveRate(fee, 100)).toBe(3)
  })
})

describe("KYC requirements", () => {
  it("basic meets basic", () => {
    expect(meetsKYCRequirement("basic", "basic")).toBe(true)
  })

  it("advanced meets intermediate", () => {
    expect(meetsKYCRequirement("advanced", "intermediate")).toBe(true)
  })

  it("basic does not meet advanced", () => {
    expect(meetsKYCRequirement("basic", "advanced")).toBe(false)
  })
})
