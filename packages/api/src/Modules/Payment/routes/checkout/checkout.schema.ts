import { selectInvoice, selectPayments } from "@/Core/DB/schema";
import { selectInvoiceWithPayment } from "@/Core/DB/schema/payment";
import { AppRouteSchema } from "@/Core/Lib/types";
import {z} from "zod";

const DETAILS = {
  tags: ["Checkout"],
  summary: "Checkout API routes",
  operationId: 'checkout'
}

export const createCheckoutOrder = {
  response: {
    200: z.object({
      invoice: selectInvoice,
      defaultPayment: selectPayments
    }),
    500: z.object({
      message: z.string(),
      code: z.string()
    })
  },
  body: z.object({
    amount: z.number(),
    currency: z.enum(['NGN', 'USD', 'GBP']),
    reference: z.string().min(6),
    type: z.enum(['onetime', 'recurring']).default('onetime'),
    range: z.enum(["monthly", "yearly"]).optional(),
    callbackUrl: z.url(),
    memo: z.string().optional(),
    redirectUrl: z.url().optional(),
    metadata: z.any().optional(),
    customer: z.object({
      email: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().optional()
    }).optional()
  }),
  apiKey: true,
  detail: {
    ...DETAILS,
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
  detail: {
    ...DETAILS,
    description: "Verify checkout status by order"
  }
} satisfies AppRouteSchema


export type CreateCheckoutOrderRoute = typeof createCheckoutOrder;
export type VerifyCheckoutStatusRoute = typeof verifyCheckoutStatus;
