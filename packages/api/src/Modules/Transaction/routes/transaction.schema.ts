import { insertTransactions, selectTransactions } from "@/Core/DB/schema";
import { AppRouteSchema } from "@/Core/Lib/types";
import {z} from "zod";


export const initTransactionSchema = {
  response: {
    200: z.object({
      address: z.string(),
      status: z.enum(["pending", "failed", "complete"]),
      amount: z.number(),
      id: z.string()
    }),
    404: z.object({
      message: z.string()
    })
  },
  body: insertTransactions,
  apiKey: true,
  detail: {
    tags: ['Transaction'],
    summary: "Transaction API routes",
    description: "Initialise a transaction requests.",
    operationId: 'transaction'
  }
} satisfies AppRouteSchema

export const confirmTransactionSchema = {
  response: {
    200: selectTransactions,
    404: z.object({
      message: z.string()
    }),
    401: z.object({
      status: z.string(),
      message: z.string()
    })
  },
  query: z.object({
    id: z.string().optional(),
    reference: z.string().optional(),
  }),
  apiKey: true,
  detail: {
    tags: ['Transaction'],
    summary: "Transaction API routes",
    description: "Confirm a transaction requests.",
    operationId: 'transaction'
  }
} satisfies AppRouteSchema

export const getAllSchema = {
  response: {
    200: z.array(selectTransactions),
    401: z.object({
      message: z.string()
    })
  },
  query: z.object({
    page: z.number(),
    count: z.number(),
    filter: z.enum(['ramp', 'payment'])
  }).optional(),
  apiKey: true,
  detail: {
    tags: ['Transaction'],
    summary: "Transaction API routes",
    description: "Confirm a transaction requests.",
    operationId: 'transaction'
  }
} satisfies AppRouteSchema


export type InitTransactionRoute = typeof initTransactionSchema;
export type ConfirmTransactionRoute = typeof confirmTransactionSchema;
export type GetAllRoute = typeof getAllSchema;
