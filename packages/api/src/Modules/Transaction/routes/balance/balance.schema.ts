import { AppRouteSchema } from "@/Core/Lib/types";
import {z} from "zod";


export const getBalanceSchema = {
  response: {
    200: z.object({
      totalNgnBalance: z.number().default(0),
      totalUsdBalance: z.number().default(0),
      usdcBalance: z.number().default(0),
      usdtBalance: z.number().default(0),
      cngnBalance: z.number().default(0)
    }),
    500: z.object({
      message: z.string(),
      code: z.string()
    }),
    404: z.object({
      message: z.string(),
      code: z.string()
    })
  },
  auth: true,
  detail: {
    tags: ['Balance'],
    summary: "Balance API routes",
    description: "Get balance of an organization wallet",
		operationId: 'balance',
    hide: true
  }
} satisfies AppRouteSchema


export const clawFundsSchema = {
	response: {
		200: z.object({
			message: z.string(),
			code: z.string()
		}),
		500: z.object({
			message: z.string(),
			code: z.string()
		}),
		404: z.object({
			message: z.string(),
			code: z.string()
		}),
	},
	auth: true,
	detail: {
		tags: ['Balance'],
    summary: "Clawfunds API routes",
    description: "Claw back balance to an organization wallet",
		operationId: 'balance',
    hide: true
	}
} satisfies AppRouteSchema


export type GetBalanceRoute = typeof getBalanceSchema
export type ClawFundsRoute = typeof clawFundsSchema
