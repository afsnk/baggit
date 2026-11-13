/**
 * Entities, shape data and types can also be gotten from the database schema
 */
import { optionsMiddleware } from "better-auth/api"
import {z} from "zod"

export const checkoutFilterSchema = z.object({
	amount: z.number().optional(),
	date: z.string().optional(),
})

export const paymentDetailSchema = z.object({
	method: z.enum(['bank-transfer', 'crypto']),
	currency: z.string(),
	amount: z.number().optional(),
	country: z.string().optional(),
	orgAddresses: z.object({
		evm: z.string().startsWith('0x'),
		solana: z.string().optional(),
	}).partial()
})

export const pspWebhookHandlerPayloadSchema = z.union([
	z.any(),
	z.object({
    status: z.string(),
    type: z.string(),
    reference: z.string(),
    beneficiary: z.string(),
    rate: z.number(),
    developer_fee: z.object({
      amount: z.number(),
      amount_usd: z.number(),
      currency: z.string(),
      network: z.string(),
      recipient: z.string(),
    }).partial(),
    source: z.object({
      amount: z.number(),
      amount_usd: z.number(),
      currency: z.string(),
      network: z.string(),
    }).partial(),
    destination: z.object({
      amount: z.number(),
      amount_usd: z.number(),
      currency: z.string(),
      network: z.string(),
    }).partial(),
    deposit: z.object({
      amount: z.number(),
      address: z.string(),
      asset: z.string(),
      provider: z.string(),
      expires_at: z.string(),
      account_number: z.string(),
      account_name: z.string(),
      bank_code: z.string(),
      bank_name: z.string(),
      note: z.array(z.string())
    }).partial(),
    meta: z.any(),
    created_at: z.string(),
    updated_at: z.string(),
  }).partial()
])

export type CheckoutFilterConfig = z.infer<typeof checkoutFilterSchema>
export type PaymentDetailsDto = z.infer<typeof paymentDetailSchema>
export type PaymentDetailsReturn = {
    method: 'bank-transfer'
    [key: string]: any
    deposit: {
      amount: number
      bank_name: string
      bank_code: string
      account_name: string
      account_number: string
      note: Array<string>
    }
  }
| {
    method: 'crypto'
    deposit: {
      encryptedPk: string
      address: string
      fromBlock: number
    }
  }
