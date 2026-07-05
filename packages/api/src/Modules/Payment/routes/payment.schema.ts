import { z } from "zod"
import { t } from "elysia";
import type { AppRouteSchema } from "@/Core/Lib/types"
import { insertPayments, selectPayments } from "@/Core/DB/schema/payment";

const paymentResponseSchema = t.Object({
  paymentId: t.String({ format: "uuid" }),
  paymentUrl: t.String({ format: "uri" })
})

export const createPaymentRoute = {
  response: {
    200: paymentResponseSchema,
    500: z.object({
      message: z.string()
    })
  },
  body: insertPayments,
  apiKey: true,
  detail: {
    tags: ["Payment"],
    summary: "Payments API routes",
    description: "Create a payment requests.",
    operationId: 'payments'
  }
} satisfies AppRouteSchema;

export const getPaymentRoute = {
  response: {
    200: selectPayments,
    404: z.object({
      message: z.string()
    }),
  },
  params: z.object({
    id: z.string()
  }),
  apiKey: true,
  detail: {
    tags: ["Payment"],
    summary: "Payments API routes",
    description: "Get a payment by id.",
    operationId: 'payments'
  }
} satisfies AppRouteSchema;

export const centiiveWebhookRoute = {

} satisfies AppRouteSchema;


export type CreatePaymentRoute = typeof createPaymentRoute;
export type GetPaymentRoute = typeof getPaymentRoute;
export type CenttiveWebhookRoue = typeof centiiveWebhookRoute;
