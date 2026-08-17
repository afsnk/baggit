import { selectInvoice, selectPayments } from "@/Core/DB/schema";
import { selectInvoiceWithPayment } from "@/Core/DB/schema/payment";
import { AppRouteSchema } from "@/Core/Lib/types";
import {z} from "zod";

const DETAILS = {
  tags: ["Checkout"],
  operationId: 'checkout'
}

export const createCheckoutOrder = {
  response: {
    200: z.object({
			invoice: selectInvoice,
      paymentUrl: z.url(),
      // defaultPayment: selectPayments
    }),
    401: z.object({
      message: z.string(),
      code: z.string()
    }),
    500: z.object({
      message: z.string(),
      code: z.string()
    })
  },
  body: z.object({
    amount: z.number(),
    currency: z.enum(['NGN', 'USD', 'GBP']).default('NGN').describe('Base currency for the payment (Only NGN support for now)'),
    reference: z.string().min(6).describe('Your invoice reference, store in your DB'),
    type: z.enum(['onetime', 'recurring']).default('onetime').describe('onetime for sales, recurring for subscriptions'),
    range: z.enum(["monthly", "yearly"]).optional().nullable(),
    callbackUrl: z.url().describe('callbackUrl for redirect after payment is done'),
    memo: z.string().optional().describe('Optional Memo message for user under title'),
    redirectUrl: z.url().optional().describe('Optional redirect URL'),
    metadata: z.any().optional(),
    customer: z.object({
      email: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().optional()
    }).optional()
  }),
	apiKey: true,
	headers: z.object({
		'Baggit-Public-Key': z.string().optional(),
		'Baggit-Secret-Key': z.string().optional()
	}).optional(),
  detail: {
		...DETAILS,
    summary: "Create a checkout",
    description: "Checkout a user to make payment",
  }
} satisfies AppRouteSchema


export const verifyCheckoutStatus = {
  response: {
    200: selectInvoiceWithPayment.extend({status: z.any()}),
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
    orderId: z.string(), // reference or id
  }),
	apiKey: true,
	headers: z.object({
		'Baggit-Public-Key': z.string().optional(),
		'Baggit-Secret-Key': z.string().optional()
	}).optional(),
  detail: {
		...DETAILS,
    summary: "Verify checkout status",
    description: "Verify checkout status by order"
  }
} satisfies AppRouteSchema


export type CreateCheckoutOrderRoute = typeof createCheckoutOrder;
export type VerifyCheckoutStatusRoute = typeof verifyCheckoutStatus;
