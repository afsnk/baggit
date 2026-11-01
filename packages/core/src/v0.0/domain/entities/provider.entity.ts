import { z } from "zod"
import { REGIONS } from "../value-objects/region"
import { FIAT_CURRENCIES, CRYPTO_ASSETS } from "../value-objects/currency"
import { PAYMENT_METHODS } from "../value-objects/payment-method"
import { KYC_LEVELS } from "../value-objects/kyc"

export const PROVIDER_STATUSES = [
  "active",
  "degraded",
  "down",
  "maintenance",
] as const

export type ProviderStatus = (typeof PROVIDER_STATUSES)[number]

export const PROVIDER_CAPABILITIES = ["buy", "sell"] as const

export type ProviderCapability = (typeof PROVIDER_CAPABILITIES)[number]

export const ProviderSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capabilities: z.array(z.enum(PROVIDER_CAPABILITIES)),
  status: z.enum(PROVIDER_STATUSES),
  supportedRegions: z.array(z.enum(REGIONS)),
  supportedFiatCurrencies: z.array(z.enum(FIAT_CURRENCIES)),
  supportedCryptoAssets: z.array(z.enum(CRYPTO_ASSETS)),
  supportedPaymentMethods: z.array(z.enum(PAYMENT_METHODS)),
  kycRequired: z.boolean(),
  kycLevels: z.array(z.enum(KYC_LEVELS)),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Provider = z.infer<typeof ProviderSchema>
