import { z } from "zod"

/**
 * §6d money rule: `flat` is a decimal-string amount in `currency`;
 * `percentage` is a ratio, not money, so it stays numeric.
 */
export const FeeSchema = z.object({
  percentage: z.number().min(0).max(100),
  flat: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.string().min(1),
  description: z.string().optional(),
})

export type Fee = z.infer<typeof FeeSchema>

// ---------------------------------------------------------------------------
// Fixed-point helpers — BigInt arithmetic scaled by 1e4, no float parsing.
// ---------------------------------------------------------------------------

const SCALE = 10_000n

/** Parse a non-negative decimal string into fixed-point units (4 dp). */
function toScaled(decimal: string): bigint {
  const [intPart = "0", fracPart = ""] = decimal.split(".")
  const frac = (fracPart + "0000").slice(0, 4)
  return BigInt(intPart || "0") * SCALE + BigInt(frac || "0")
}

/** Render fixed-point units back to a trimmed decimal string. */
function fromScaled(scaled: bigint): string {
  const intPart = scaled / SCALE
  const frac = (scaled % SCALE).toString().padStart(4, "0").replace(/0+$/, "")
  return frac ? `${intPart}.${frac}` : `${intPart}`
}

/** Total fee for `amountMajor`, returned as a decimal string. */
export function calculateTotalFee(fee: Fee, amountMajor: string): string {
  // percentage is a number ratio: quantize once at the 1e-4 boundary.
  const pctScaled = BigInt(Math.round(fee.percentage * Number(SCALE)))
  const percentScaled = (toScaled(amountMajor) * pctScaled) / (SCALE * 100n)
  return fromScaled(percentScaled + toScaled(fee.flat))
}

/** Fee share of the amount, as a percentage — a ratio, so numeric. */
export function calculateEffectiveRate(fee: Fee, amountMajor: string): number {
  const amount = Number(amountMajor)
  if (!(amount > 0)) return 0
  return (Number(calculateTotalFee(fee, amountMajor)) / amount) * 100
}
