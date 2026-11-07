/**
 * Handle checkout service database read/write
 */

import { DB } from "@core/adapters";
import { CheckoutFilterConfig } from "../entities/checkout.entitie";
import { type SelectInvoice, type PatchInvoice, type InsertInvoice, invoice } from "@core/adapters/db/schema/invoice";
import { makeCheckoutUrl } from "../utils/checkout";
import { eq } from "drizzle-orm";



export default class CheckoutRepository {
	constructor(private db: DB) {}

	async createInvoice(data: InsertInvoice, clientUrl?: string) {
		try {
			const [newInvoice] = await this.db.insert(invoice)
	      .values({
		      ...data,
	        orgId: data.orgId,
				}).returning();

			const paymentUrl = makeCheckoutUrl(newInvoice.id, clientUrl);

			// Update with payment url
			const [updatedInvoice] = await this.db.update(invoice)
				.set({
					payment: {
						...newInvoice.payment,
						url: paymentUrl,
					}
				})
				.where(eq(invoice.id, newInvoice.id))
				.returning()
				.catch((error) => {
					console.log(`Failed to update invoice`, { ...error })
					// Roll back transaction or retry update
					throw error;
				})

			return updatedInvoice;
		}
		catch (error: any) {
			// Log error here with evlog
			console.log(`Failed to create invoice`, {
				...error,
			})
			throw error;
		}
	}

	async patchInvoice(data: PatchInvoice) { }

	static async get(merchantId: string, id: string) { }

	static async getAll(merchantId: string, filters?: CheckoutFilterConfig) { }
}
