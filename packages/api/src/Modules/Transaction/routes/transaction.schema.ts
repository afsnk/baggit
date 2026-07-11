import { insertTransactions, selectTransactions } from "@/Core/DB/schema";
import { AppRouteSchema } from "@/Core/Lib/types";
import {z} from "zod";


export const initTransactionSchema = {
  response: {
    200: z.object({
      details: z.union([
        z.object({
          address: z.string(),
        }),
        z.object({
          bankName: z.string(),
          accountNumber: z.string(),
          accountName: z.string(),
        })
      ]),
      status: z.enum(["pending", "failed", "complete"]),
      amount: z.number(),
      method: z.string(),
      id: z.string()
    }),
    404: z.object({
      message: z.string(),
      code: z.string()
    }),
    400: z.object({
      message: z.string(),
      code: z.string()
    })
  },
  body: insertTransactions,
  detail: {
    tags: ['Transaction'],
    summary: "Transaction API routes",
    description: "Initialise a transaction requests.",
    operationId: 'transaction'
  }
} satisfies AppRouteSchema

export const confirmTransactionSchema = {
  response: {
    200: z.object({
      message: z.string(),
    }),
    404: z.object({
      message: z.string()
    }),
    401: z.object({
      status: z.string(),
      message: z.string()
    })
  },
  body: z.object({
    webhookId: z.string(),
    id: z.string(),
    createdAt: z.string(),
    type: z.string(),
    event: z.object({
      network: z.string(),
      activity: z.array(z.object({
        fromAddress: z.string(),
        toAddress: z.string(),
        blockNum: z.string(),
        hash: z.string(),
        value: z.number(),
        asset: z.string(),
        category: z.string(),
        rawContract: z.any(),
        log: z.any(),
        blockTimestamp: z.string()
      }))
    })
  }),
  params: z.object({
    network: z.string()
  }),
  detail: {
    tags: ['Transaction'],
    summary: "Transaction API routes",
    description: "Confirm a blockchain transaction has occured called by alchemy",
    operationId: 'transaction'
  }
} satisfies AppRouteSchema

export const switchSchema = {
  response: {
    200: z.object({
      message: z.string(),
    }),
    500: z.object({
      message: z.string()
    }),
    404: z.object({
      message: z.string()
    })
  },
  params: z.object({
    paymentId: z.string()
  }),
  body: z.any(),
  detail: {
    tags: ['Transaction'],
    summary: "Transaction API routes",
    description: "Confirm a transaction webhook for switch",
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
export type SwitchWebhookRoute = typeof switchSchema;
export type GetAllRoute = typeof getAllSchema;
