/**
 * Checkout server functions calls checkout instance similar to auth in #/lib/auth
*/

import { checkout } from "#/lib/checkout"
import { schema } from "@baggit/core"
import { createServerFn } from "@tanstack/react-start"
import {z} from "zod"


export const createCheckout = createServerFn()
	.validator(
		// Or get checkout schema from core
		schema.insertInvoice
	)
	.handler(async ({ data }) => {
		return await checkout.service.create(data)
	})
