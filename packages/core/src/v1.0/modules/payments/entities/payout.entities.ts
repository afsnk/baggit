import z from "zod";

export const lookupSchema = z.object({
	bankCode: z.string(),
	accountNumber: z.string(),
})
export const rateSchema = z.object({
	country: z.string(),
	direction: z.string(),
	currency: z.string().optional(),
})
export const statusSchema = z.object({
	reference: z.string(),
})
export const banklistSchema = z.object({
	country: z.string(),
})


export const payoutInitSchema = z.object({
		bankCode: z.string().describe('Bank code for recipients bank'),
		accountNumber: z.string().describe('Account number of recipient'),
		accountName: z.string().describe('Account name from lookup'),
		amount: z.number().describe('Amount to send to recipient'),
		reference: z.string().describe('Reference for the transaction')
	})

export type Lookup = z.infer<typeof lookupSchema>
export type Rate = z.infer<typeof rateSchema>
export type Status = z.infer<typeof statusSchema>
export type BankList = z.infer<typeof banklistSchema>
export type PayoutInit = z.infer<typeof payoutInitSchema>
