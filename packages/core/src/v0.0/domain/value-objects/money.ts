import { z } from "zod"

/**
 * Canonical money representation (REQUIREMENTS.md §2.2 / §6d).
 *
 * - Fiat: integer minor units + ISO-4217 code.
 * - Crypto: decimal string of atomic units + asset decimals metadata.
 *
 * Floating-point amounts are prohibited everywhere. All arithmetic on
 * crypto amounts is done in decimal-string space (bigint on atomic units).
 */

const ISO4217 = /^[A-Z]{3}$/
const DECIMAL_ATOMIC = /^\d+$/

export const FiatMoneySchema = z.object({
  /** Integer minor units (cents). Never a float. */
  amountMinor: z.number().int().nonnegative(),
  /** ISO-4217 alphabetic code, e.g. "USD". */
  currency: z.string().regex(ISO4217),
})

export type FiatMoney = z.infer<typeof FiatMoneySchema>

export const CryptoAmountSchema = z.object({
  /** Decimal string of atomic units, e.g. "1500000" for 1.5 USDC (6 dp). */
  atomic: z.string().regex(DECIMAL_ATOMIC),
  /** Asset decimals metadata, e.g. USDC = 6, SOL = 9. */
  decimals: z.number().int().min(0).max(18),
})

export type CryptoAmount = z.infer<typeof CryptoAmountSchema>

// ---------------------------------------------------------------------------
// Fiat helpers — pure string/integer math, no floats.
// ---------------------------------------------------------------------------

/** Parse a major-unit decimal string ("12.34") into minor units. */
export function fiatFromMajor(major: string): { amountMinor: number } {
  const [whole, frac = ""] = major.split(".")
  if (!/^\d+$/.test(whole) || !/^\d{0,2}$/.test(frac)) {
    throw new Error(`Invalid fiat major amount: ${major}`)
  }
  const padded = frac.padEnd(2, "0")
  return { amountMinor: Number(whole) * 100 + Number(padded) }
}

export function addFiat(a: FiatMoney, b: FiatMoney): FiatMoney {
  assertSameCurrency(a.currency, b.currency)
  return { amountMinor: checkedAdd(a.amountMinor, b.amountMinor), currency: a.currency }
}

export function subFiat(a: FiatMoney, b: FiatMoney): FiatMoney {
  assertSameCurrency(a.currency, b.currency)
  const diff = a.amountMinor - b.amountMinor
  if (diff < 0) throw new Error("Fiat underflow: result is negative")
  return { amountMinor: diff, currency: a.currency }
}

export function compareFiat(a: FiatMoney, b: FiatMoney): -1 | 0 | 1 {
  assertSameCurrency(a.currency, b.currency)
  return a.amountMinor < b.amountMinor ? -1 : a.amountMinor > b.amountMinor ? 1 : 0
}

// ---------------------------------------------------------------------------
// Crypto helpers — bigint math on atomic units.
// ---------------------------------------------------------------------------

export function addCrypto(a: CryptoAmount, b: CryptoAmount): CryptoAmount {
  assertSameDecimals(a.decimals, b.decimals)
  return { atomic: (BigInt(a.atomic) + BigInt(b.atomic)).toString(), decimals: a.decimals }
}

export function subCrypto(a: CryptoAmount, b: CryptoAmount): CryptoAmount {
  assertSameDecimals(a.decimals, b.decimals)
  const diff = BigInt(a.atomic) - BigInt(b.atomic)
  if (diff < 0n) throw new Error("Crypto underflow: result is negative")
  return { atomic: diff.toString(), decimals: a.decimals }
}

export function compareCrypto(a: CryptoAmount, b: CryptoAmount): -1 | 0 | 1 {
  assertSameDecimals(a.decimals, b.decimals)
  const x = BigInt(a.atomic)
  const y = BigInt(b.atomic)
  return x < y ? -1 : x > y ? 1 : 0
}

/** Convert atomic units to a human decimal string ("1500000", 6 → "1.5"). */
export function cryptoToDecimal(amount: CryptoAmount): string {
  const { atomic, decimals } = amount
  if (decimals === 0) return atomic
  const value = BigInt(atomic).toString().padStart(decimals + 1, "0")
  const whole = value.slice(0, value.length - decimals)
  const frac = value.slice(value.length - decimals).replace(/0+$/, "")
  return frac.length === 0 ? whole : `${whole}.${frac}`
}

/**
 * Convert a human decimal string ("1.5") to atomic units at `decimals`.
 * Pure string math — never parses through a float.
 */
export function cryptoFromDecimal(decimal: string, decimals: number): CryptoAmount {
  const [whole = "0", frac = ""] = decimal.split(".")
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(frac)) {
    throw new Error(`Invalid crypto decimal amount: ${decimal}`)
  }
  if (frac.length > decimals) {
    throw new Error(`Amount ${decimal} exceeds asset precision (${decimals} dp)`)
  }
  const paddedFrac = frac.padEnd(decimals, "0")
  const atomic = BigInt(whole + paddedFrac).toString()
  return { atomic: atomic === "0" ? "0" : atomic.replace(/^0+(?=\d)/, ""), decimals }
}

// ---------------------------------------------------------------------------
// internals
// ---------------------------------------------------------------------------

function assertSameCurrency(a: string, b: string): void {
  if (a !== b) throw new Error(`Currency mismatch: ${a} vs ${b}`)
}

function assertSameDecimals(a: number, b: number): void {
  if (a !== b) throw new Error(`Decimals mismatch: ${a} vs ${b}`)
}

function checkedAdd(x: number, y: number): number {
  const sum = x + y
  if (!Number.isSafeInteger(sum)) throw new Error("Integer overflow in fiat addition")
  return sum
}
