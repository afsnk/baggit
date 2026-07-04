import { z } from "zod"

export const MoneySchema = z.object({
  amount: z.number().min(0),
  currency: z.string().min(1),
})

export type Money = z.infer<typeof MoneySchema>

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`)
  }
  return { amount: a.amount + b.amount, currency: a.currency }
}

export function multiplyMoney(m: Money, factor: number): Money {
  return { amount: m.amount * factor, currency: m.currency }
}
