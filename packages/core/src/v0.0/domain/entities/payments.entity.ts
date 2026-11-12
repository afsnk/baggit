import { z } from "zod"

/**
 * REQUIREMENTS.md §2.3/2.4/2.5: payment-surface domain entities.
 * Status lifecycles mirror the REQUIREMENTS state machines exactly.
 */

export const DEPOSIT_STATUSES = [
  "initiated",
  "funds_detected",
  "screened",
  "delivered",
  "settled",
  "failed",
] as const
export type DepositStatus = (typeof DEPOSIT_STATUSES)[number]

export const WITHDRAWAL_STATUSES = [
  "initiated",
  "screening",
  "processing",
  "settled",
  "failed",
] as const
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number]

export const CHECKOUT_STATUSES = [
  "created",
  "awaiting_payment",
  "processing",
  "completed",
  "expired",
  "failed",
] as const
export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number]

export const ALLOWLIST_STATES = ["none", "pending_cooling", "active"] as const
export type AllowlistState = (typeof ALLOWLIST_STATES)[number]

export const CustomerSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  kycLevel: z.enum(["none", "basic", "intermediate", "advanced"]).default("none"),
  status: z.enum(["active", "restricted", "closed"]).default("active"),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Customer = z.infer<typeof CustomerSchema>

export interface AddressRecord {
  id: string
  customerId: string
  chain: string
  address: string
  derivationIndex: number
  custodyKeyRef: string
  allowlistState: AllowlistState
  allowlistActiveAt?: string
  createdAt: string
}

export interface DepositInstruction {
  id: string
  customerId: string
  addressId: string
  rail: string
  currency: string
  virtualAccountId: string
  reference: string
  status: DepositStatus
  createdAt: string
}

export interface DepositRecord {
  id: string
  instructionId: string
  customerId: string
  creditId: string
  fiatAmountMinor: number
  fiatCurrency: string
  chain: string
  asset: string
  destinationAddress: string
  /** Decimal string of atomic units. */
  amountAtomic: string
  decimals: number
  txHash?: string
  confirmations: number
  status: DepositStatus
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface WithdrawalRecord {
  id: string
  customerId: string
  sourceAddressId: string
  method: "fiat" | "crypto"
  chain: string
  asset: string
  destinationAddress?: string
  /** Decimal string of atomic units debited from the custodial wallet. */
  amountAtomic: string
  decimals: number
  fiatCurrency?: string
  fiatAmountMinor?: number
  rail?: string
  txHash?: string
  status: WithdrawalStatus
  failureReason?: string
  idempotencyKey: string
  createdAt: string
  updatedAt: string
}

export interface CheckoutSession {
  id: string
  merchantId: string
  customerId?: string
  sessionToken: string
  status: CheckoutStatus
  chain: string
  asset: string
  destinationAddress: string
  /** Decimal string of atomic units — quote locked at creation. */
  amountAtomic: string
  decimals: number
  fiatCurrency?: string
  fiatAmountMinor?: number
  lockedRate: string
  paymentOptions: Array<"fiat" | "crypto">
  ttlExpiresAt: string
  completedAt?: string
  createdAt: string
}

export const CreateDepositInputSchema = z.object({
  customerId: z.string().min(1),
  currency: z.string().regex(/^[A-Z]{3}$/),
  chain: z.enum(["base", "solana"]),
})
export type CreateDepositInput = z.infer<typeof CreateDepositInputSchema>

export const RequestWithdrawalInputSchema = z.object({
  customerId: z.string().min(1),
  sourceAddressId: z.string().min(1),
  method: z.enum(["fiat", "crypto"]),
  destinationAddress: z.string().optional(),
  amountAtomic: z.string().regex(/^\d+$/),
  decimals: z.number().int().min(0).max(18),
  fiatCurrency: z.string().regex(/^[A-Z]{3}$/).optional(),
  fiatAmountMinor: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().min(1),
})
export type RequestWithdrawalInput = z.infer<typeof RequestWithdrawalInputSchema>

export const CreateCheckoutSessionInputSchema = z.object({
  merchantId: z.string().min(1),
  customerId: z.string().optional(),
  chain: z.enum(["base", "solana"]),
  asset: z.enum(["USDC", "USDT"]),
  destinationAddress: z.string().min(1),
  amountAtomic: z.string().regex(/^\d+$/),
  decimals: z.number().int().min(0).max(18),
  fiatCurrency: z.string().regex(/^[A-Z]{3}$/).optional(),
  fiatAmountMinor: z.number().int().nonnegative().optional(),
  paymentOptions: z.array(z.enum(["fiat", "crypto"])).min(1),
  ttlSeconds: z.number().int().positive().default(900),
})
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>
