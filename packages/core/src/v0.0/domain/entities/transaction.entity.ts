import { z } from "zod"
import { PAYMENT_METHODS } from "../value-objects/payment-method"

export const TRANSACTION_STATUSES = [
  "pending",
  "processing",
  "settled",
  "failed",
  "expired",
  "refunded",
] as const

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

/** §6d money rule: amounts are decimal strings, never floats. */
const DECIMAL_STRING = /^\d+(\.\d+)?$/

export const TransactionRequestSchema = z.object({
  provider: z.string().min(1),
  quoteId: z.string().min(1),
  sourceAsset: z.string().min(1),
  targetAsset: z.string().min(1),
  sourceAmount: z.string().regex(DECIMAL_STRING),
  targetAmount: z.string().regex(DECIMAL_STRING),
  direction: z.enum(["buy", "sell"]),
  paymentMethod: z.enum(PAYMENT_METHODS),
  region: z.string().min(1),
  userId: z.string().min(1),
  kycLevel: z.string().optional(),
  idempotencyKey: z.string().min(1),
})

export type TransactionRequest = z.infer<typeof TransactionRequestSchema>

export const TransactionSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  quoteId: z.string().min(1),
  userId: z.string().min(1),
  sourceAsset: z.string().min(1),
  targetAsset: z.string().min(1),
  sourceAmount: z.string().regex(DECIMAL_STRING),
  targetAmount: z.string().regex(DECIMAL_STRING),
  direction: z.enum(["buy", "sell"]),
  paymentMethod: z.enum(PAYMENT_METHODS),
  region: z.string().min(1),
  status: z.enum(TRANSACTION_STATUSES),
  providerTxId: z.string().optional(),
  failureReason: z.string().optional(),
  idempotencyKey: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Transaction = z.infer<typeof TransactionSchema>
