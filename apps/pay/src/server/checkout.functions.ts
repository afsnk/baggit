/**
 * Checkout server functions calls checkout instance similar to auth in #/lib/auth
*/

import { checkout } from "#/lib/checkout"
import { schema } from "@baggit/core"
import { createServerFn } from "@tanstack/react-start"
import {z} from "zod"


export const getInvoice = createServerFn({method: "GET"})
	.validator(
		z.object({
			id: z.string() // Invoice/Order ID
		})
	)
	.handler(async ({ data }) => {
		// return await checkout.service.getInvoice(id);
	})


export const getPaymentDetails = createServerFn({method: "POST"})
	.validator(z.object({
		idempotencyKey: z.string(), // Returns same details for the same invoice/order(can be id's)
		method: z.string(),
		currency: z.string(),
	}))
	.handler(async () => {})
