import { z } from "zod"

/**
 * REQUIREMENTS.md §11: kernel config schema.
 * Environment-driven; the host application supplies secrets via its own env
 * plumbing — nothing secret lives here.
 */
export const ApraKernelConfigSchema = z.object({
  environment: z.enum(["test", "live"]).default("test"),
  chains: z.array(z.enum(["base", "solana"])).min(1),
  treasuryAddress: z.string().optional(),
  treasuryKeyRef: z.string().optional(),
  withdrawalVelocityLimit: z.number().int().positive().default(10),
  velocityWindowMs: z.number().int().positive().default(86_400_000),
  addressCoolingMs: z.number().int().nonnegative().default(86_400_000),
  webhookMaxAttempts: z.number().int().positive().default(5),
})

export type ApraKernelConfig = z.infer<typeof ApraKernelConfigSchema>
