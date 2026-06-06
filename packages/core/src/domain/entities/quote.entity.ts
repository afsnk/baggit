import { z } from "zod"
import { MoneySchema } from "../value-objects/money"
import { FeeSchema } from "../value-objects/fee"
import { CRYPTO_ASSETS } from "../value-objects/currency"
import { PAYMENT_METHODS } from "../value-objects/payment-method"

export const QUOTE_DIRECTIONS = ["buy", "sell"] as const

export type QuoteDirection = (typeof QUOTE_DIRECTIONS)[number]

export const QuoteRequestSchema = z.object({
  sourceAsset: z.string().min(1),
  targetAsset: z.string().min(1),
  sourceAmount: z.number().min(0).optional(),
  targetAmount: z.number().min(0).optional(),
  direction: z.enum(QUOTE_DIRECTIONS),
  region: z.string().min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
})

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>

export const ProviderQuoteSchema = z.object({
  provider: z.string().min(1),
  id: z.string().min(1),
  direction: z.enum(QUOTE_DIRECTIONS),
  sourceAsset: z.string().min(1),
  targetAsset: z.string().min(1),
  sourceAmount: z.number().min(0),
  targetAmount: z.number().min(0),
  rate: z.number().min(0),
  fees: z.array(FeeSchema),
  totalFee: FeeSchema,
  estimatedSettlementMs: z.number().min(0),
  paymentMethod: z.enum(PAYMENT_METHODS),
  region: z.string().min(1),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export type ProviderQuote = z.infer<typeof ProviderQuoteSchema>
