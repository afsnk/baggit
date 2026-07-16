import { z } from "zod"
import { t } from "elysia";
import type { AppRouteSchema } from "@/Core/Lib/types"
import { selectInvoiceWithPayment, selectPayments } from "@/Core/DB/schema/payment";

export const updateMethodRoute = {
  response: {
    200: selectPayments,
    500: z.object({
      message: z.string(),
      code: z.string()
    })
  },
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    amount: z.number(),
    currency: z.string(),
    method: z.string(),
    callbackUrl: z.url().optional()
  }),
  // jwt: true,
  // auth: true,
  detail: {
    tags: ["Payment"],
    summary: "Payments API routes",
    description: "Update a payment method by id.",
		operationId: 'payments',
		hide: true
  }
} satisfies AppRouteSchema;

export const getPaymentRoute = {
  response: {
    200: selectInvoiceWithPayment,
    404: z.object({
      message: z.string(),
      code: z.string()
    }),
  },
  params: z.object({
    invoiceRef: z.string()
  }),
  // jwt: true,
  // auth: true,
  detail: {
    tags: ["Payment"],
    summary: "Payments API routes",
    description: "Get a payment method by its invoice reference.",
		operationId: 'payments',
    hide: true
  }
} satisfies AppRouteSchema;


export type UpdateMethodRoute = typeof updateMethodRoute;
export type GetPaymentRoute = typeof getPaymentRoute;
