/**
 * Meant as a context that picks and initializes which adapter to use to process payout related transactions
 * Payout flows from Crypto -> Fiat | Fiat -> Fiat
 */

import { PSPAdapter } from "@core/adapters/psp/base.adapter";
import type { BankList, Lookup, Rate, Status } from "../entities/payout.entities";


	// Use and adapter for lookup calls
export default class PayoutService {
	constructor(private adapter: PSPAdapter) { }

	// TODO: does not align with service directive
	async lookup(data: Lookup) {
		return this.adapter.lookup(data)
	}

	async rate(data: Rate) {
		return this.adapter.rate(data)
	}

	async status(data: Status) {
		return this.adapter.status(data)
	}

	async bankList(data: BankList) {
		return this.adapter.bankList(data)
	}
}
