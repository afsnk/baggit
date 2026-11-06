/**
 * Checkout server functions calls checkout instance similar to auth in #/lib/auth
*/

import { checkout } from "#/lib/checkout"
import { createServerFn } from "@tanstack/react-start"
import {z} from "zod"


export const createCheckout = createServerFn()
	.validator(
		// Or get checkout schema from core
		z.object({
			amount: z.number(),
			reference: z.string().min(4)
		})
	)
	.handler(async ({ data }) => {
		return await checkout.service.createInvoice(data)
	})
