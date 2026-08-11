import { AppRouteSchema } from "@/Core/Lib/types";
import { z } from "zod";


const tags  = ['Payout']

export const createPayoutRequestSchema = {
	response: {
		200: z.any(),
		401: z.object({
			message: z.string(),
			code: z.string()
		}),
		500: z.object({
			message: z.string(),
			code: z.string(),
		}),
	},
	body: z.object({
		bankCode: z.string().describe('Bank code for recipients bank'),
		accountNumber: z.string().describe('Account number of recipient'),
		accountName: z.string().describe('Account name from lookup'),
		amount: z.number().describe('Amount to send to recipient'),
		reference: z.string().describe('Reference for the transaction')
	}),
	headers: z.object({
		'Baggit-Public-Key': z.string().optional().describe('Merchant public key required for routes like /checkout'),
		'Baggit-Secret-Key': z.string().optional().describe('Merchant secret key required for routes like /payout')
	}).optional(),
	apiKey: true,
	auth: true,
	detail: {
		tags,
		summary: 'Create payout request',
		operationId: 'payout'
	}
} satisfies AppRouteSchema

export const verifyPayoutRequestSchema = {
	response: {
		200: z.any(),
		401: z.object({
			message: z.string(),
			code: z.string(),
		}),
		404: z.object({
			message: z.string(),
			code: z.string()
		}),
		500: z.object({
			message: z.string(),
			code: z.string()
		})
	},
	params: z.object({
		requestId: z.string().describe('Payout request id returned during payout request creation'),
	}).optional(),
	headers: z.object({
		'Baggit-Public-Key': z.string().optional().describe('Merchant public key required for routes like /checkout'),
		'Baggit-Secret-Key': z.string().optional().describe('Merchant secret key required for routes like /payout')
	}).optional(),
	apiKey: true,
	auth: true,
	detail: {
		tags,
		summary: 'Verify payout status',
		operationId: 'payout'
	}
} satisfies AppRouteSchema

export const bankListSchema = {
	response: {
		200: z.array(
			z.object({
				code: z.string(),
				name: z.string(),
				country: z.string().optional()
			})
		),
		500: z.object({
			message: z.string(),
			code: z.string()
		})
	},
	auth: true,
	apiKey: true,
	detail: {
		tags,
		summary: 'Get bank list for payout request',
		operationId: 'payout'
	}
} satisfies AppRouteSchema

export const lookupSchema = {
	response: {
		200: z.object({
			accountNumber: z.string(),
			accountName: z.string(),
			bankCode: z.string(),
		}),
		500: z.object({
			message: z.string(),
			code: z.string()
		})
	},
	body: z.object({
		bankCode: z.string(),
		accountNumber: z.string(),
	}),
	apiKey: true,
	auth: true,
	detail: {
		tags,
		summary: 'Get bank account name for payout',
		operationId: 'payout'
	}
} satisfies AppRouteSchema

export const switchWebhookSchema = {
	response: {
		200: z.object({
			message: z.string(),
			code: z.string()
		}),
		500: z.object({
			message: z.string(),
			code: z.string(),
		})
	},
	body: z.any(),
	params: z.object({
		transactionId: z.string()
	}),
	detail: {
		tags,
		summary: 'Webhook route webhook',
		operationId: 'payout',
		hide: true,
	}
} satisfies AppRouteSchema


export type CreatePayoutRequest = typeof createPayoutRequestSchema;
export type VerifyPayoutRequest = typeof verifyPayoutRequestSchema;
export type BankListRequest = typeof bankListSchema;
export type LookupRequest = typeof lookupSchema;
export type SwitchWebhookRequest = typeof switchWebhookSchema;
