/**
 * Factory class for checkout business logic in relation to merchant
 */

import { InsertInvoice } from "@core/adapters/db/schema/invoice";
import CheckoutRepository from "../repositories/checkout.repository";


export default class CheckoutService {
	constructor(private repository: CheckoutRepository) { }

	async create(data: InsertInvoice, payClientUrl: string = process.env.VITE_PAY_CLIENT_URL || 'pay.baggit.link') {
		const invoice = await this.repository.createInvoice(data, payClientUrl);

		return {
			reference: invoice.reference,
			...invoice.payment,
		}
	}

	// TODO: Handle checkout/payment life cycle

}
