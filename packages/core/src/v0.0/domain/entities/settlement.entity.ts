import { z } from "zod"

export const SETTLEMENT_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "timed_out",
] as const

export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number]

export const SettlementSchema = z.object({
  id: z.string().min(1),
  transactionId: z.string().min(1),
  provider: z.string().min(1),
  status: z.enum(SETTLEMENT_STATUSES),
  durationMs: z.number().min(0).optional(),
  attempts: z.number().min(0).default(0),
  failureReason: z.string().optional(),
  webhookReceived: z.boolean().default(false),
  webhookPayload: z.unknown().optional(),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Settlement = z.infer<typeof SettlementSchema>
