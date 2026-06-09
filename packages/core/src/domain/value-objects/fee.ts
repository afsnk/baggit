import { z } from "zod"

export const FeeSchema = z.object({
  percentage: z.number().min(0).max(100),
  flat: z.number().min(0),
  currency: z.string().min(1),
  description: z.string().optional(),
})

export type Fee = z.infer<typeof FeeSchema>

export function calculateTotalFee(fee: Fee, amount: number): number {
  const percentageFee = amount * (fee.percentage / 100)
  return percentageFee + fee.flat
}

export function calculateEffectiveRate(fee: Fee, amount: number): number {
  const totalFee = calculateTotalFee(fee, amount)
  return amount > 0 ? (totalFee / amount) * 100 : 0
}
