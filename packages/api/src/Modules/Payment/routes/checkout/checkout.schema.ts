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
    200: z.union([
      selectInvoice,
      selectPayments
    ]),
    500: z.object({
      message: z.string(),
      code: z.string()
    })
  },
  body: z.object({
    amount: z.number(),
    currency: z.enum(['ngn', 'usd', 'gbp']),
    reference: z.string().min(6),
    callbackUrl: z.url(),
    redirectUrl: z.url().optional(),
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
