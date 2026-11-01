import { describe, expect, it } from "vitest"
import {
  addCrypto,
  addFiat,
  compareCrypto,
  compareFiat,
  cryptoFromDecimal,
  cryptoToDecimal,
  fiatFromMajor,
  subCrypto,
  subFiat,
} from "../../domain/value-objects/money"

describe("fiat money — integer minor units", () => {
  it("parses major-unit strings without floats", () => {
    expect(fiatFromMajor("12.34")).toEqual({ amountMinor: 1234 })
    expect(fiatFromMajor("0.01")).toEqual({ amountMinor: 1 })
    expect(fiatFromMajor("5")).toEqual({ amountMinor: 500 })
    expect(fiatFromMajor("12.3")).toEqual({ amountMinor: 1230 })
  })

  it("rejects malformed or over-precision input", () => {
    expect(() => fiatFromMajor("1.234")).toThrow()
    expect(() => fiatFromMajor("-1.00")).toThrow()
    expect(() => fiatFromMajor("abc")).toThrow()
  })

  it("adds and subtracts in minor units with currency guards", () => {
    const a = { amountMinor: 100, currency: "USD" }
    const b = { amountMinor: 250, currency: "USD" }
    expect(addFiat(a, b)).toEqual({ amountMinor: 350, currency: "USD" })
    expect(subFiat(b, a)).toEqual({ amountMinor: 150, currency: "USD" })
    expect(() => addFiat(a, { ...b, currency: "EUR" })).toThrow(/Currency mismatch/)
    expect(() => subFiat(a, b)).toThrow(/underflow/)
  })

  it("compares deterministically", () => {
    expect(compareFiat({ amountMinor: 1, currency: "USD" }, { amountMinor: 2, currency: "USD" })).toBe(-1)
    expect(compareFiat({ amountMinor: 2, currency: "USD" }, { amountMinor: 2, currency: "USD" })).toBe(0)
  })
})

describe("crypto amounts — decimal strings of atomic units", () => {
  it("converts human decimals to atomic strings via pure string math", () => {
    expect(cryptoFromDecimal("1.5", 6)).toEqual({ atomic: "1500000", decimals: 6 })
    expect(cryptoFromDecimal("0.000001", 6)).toEqual({ atomic: "1", decimals: 6 })
    expect(cryptoFromDecimal("42", 6)).toEqual({ atomic: "42000000", decimals: 6 })
  })

  it("rejects over-precision instead of rounding silently", () => {
    expect(() => cryptoFromDecimal("0.0000001", 6)).toThrow(/precision/)
    expect(() => cryptoFromDecimal("1e9", 6)).toThrow()
    expect(() => cryptoFromDecimal("-1", 6)).toThrow()
  })

  it("round-trips atomic → decimal → atomic", () => {
    const original = cryptoFromDecimal("12345.678901", 6)
    expect(cryptoToDecimal(original)).toBe("12345.678901")
    // trailing zeros trimmed on display
    expect(cryptoToDecimal(cryptoFromDecimal("1.500000", 6))).toBe("1.5")
  })

  it("does not lose precision at 18 decimals where floats break", () => {
    // 0.1 + 0.2 !== 0.3 in floats; must be exact here
    const sum = addCrypto(cryptoFromDecimal("0.1", 18), cryptoFromDecimal("0.2", 18))
    expect(cryptoToDecimal(sum)).toBe("0.3")
  })

  it("adds/subtracts/compares with decimals guards", () => {
    const a = cryptoFromDecimal("1", 6)
    const b = cryptoFromDecimal("0.5", 6)
    expect(addCrypto(a, b).atomic).toBe("1500000")
    expect(subCrypto(a, b).atomic).toBe("500000")
    expect(() => subCrypto(b, a)).toThrow(/underflow/)
    expect(() => addCrypto(a, { atomic: "1", decimals: 9 })).toThrow(/Decimals mismatch/)
    expect(compareCrypto(a, b)).toBe(1)
    expect(compareCrypto(b, b)).toBe(0)
  })
})
