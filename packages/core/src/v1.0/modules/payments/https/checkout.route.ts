import { DB } from "@core/adapters";
import { createRouter } from "@shared/create-router"
import CheckoutRepository from "../repositories/checkout.repository";
import CheckoutService from "../services/checkout.service";
import z from "zod";
import { insertInvoice } from "@core/adapters/db/schema";


const createCheckout = (db: DB) => {
	const repository = new CheckoutRepository(db);
	const service = new CheckoutService(repository)
	const router = createRouter({
		name: "checkout",
		version: "0.0.1",
		prefix: "/checkout",
		db
	})
		.decorate(() => {
			return {
				checkoutRepository: repository,
				checkoutService: service,
			}
		})
		.post('/create', async ({ log, status, checkoutService, body }) => {
			try {
				const newInvoice = await checkoutService.create(body)
				log.set(newInvoice);
				return status("OK", newInvoice);
			}
			catch (error: any) {
				log.error(error);
				return status("Bad Request", {
					message: error.message,
					why: error.stack.toString() || '',
					fix: 'Retry later'
				});
			}
		}, {
			response: {
				200: z.object({
					method: z.string(),
					currency: z.string(),
					url: z.url(),
					reference: z.string(),
				}),
				400: z.object({
					message: z.string(),
					why: z.string(),
					fix: z.string()
				})
			},
			body: insertInvoice
		})

	return {
		fetch: router.fetch,
		service,
		repository
	}
}

export {createCheckout};
