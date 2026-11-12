/**
 * Meant as a context that picks and initializes which adapter to use to process payout related transactions
 * Payout flows from Crypto -> Fiat | Fiat -> Fiat
 */

import { PSPAdapter } from "@core/adapters/psp/base.adapter";
import type { PayoutRequestDto } from "../entities/payout.entities";
import TransactionRepository from "../repositories/transaction.repository";
import { Asset } from "@core/adapters/db/schema/transaction";
import { SwitchAdapter } from "@core/adapters/psp/switch";


	// Use and adapter for lookup calls
export default class PayoutService {
	constructor(
		private adapter: PSPAdapter<SwitchAdapter>, // Should be interchangeable with other adapters
		private transactionRepo: TransactionRepository
	) { }

	// TODO: does not align with service directive
	async makeRequest(dto: PayoutRequestDto, orgId: string, ) {
		// Create a payout request with psp adapter and store transaction
		const pspRequest = await this.adapter.initOfframp({
			static: false,
			usdAmount: dto.amount,
			asset: "bsc:usdc",
			sender_name: "Baggit Innovations Ltd",
			beneficiary: {
				holder_type: "INDIVIDUAL",
				holder_name: dto.accountName,
				account_number: dto.accountNumber,
				bank_code: dto.bankCode,
			},
			reference: dto.reference,
			country: "NGN",
			currency: "NG",
			callback_url: '', // Pin to merchant webhook URL
			developer_fee: 0.1,
			developer_recipient: '', // Pin to treasury address
			reason: "REMITTANCE",
		})
		const asset: Asset = {
			amount: dto.amount,
			rate: pspRequest.rate,
			in: {
				token: "USD Circle",
				symbol: "USDC",
				tokenAddress: "" // Fill USDC token address
			},
			out: {
				country: "NG",
				symbol: "NGN",
				name: "Nigerian Naira",
			}
		}
		const transaction = await this.transactionRepo.create({
			status: "pending",
			asset,
			metadata: {
				...pspRequest,
				callbackUrl: "" // TODO: Fill in
			},
			medium: {
				id: this.adapter.id,
				baseAction: "payout",
				fee: pspRequest.developer_fee,
			},
			settledForId: orgId,
			entityId: orgId,
			entityType: "org",
		});

		return { transaction, pspRequest };
	}
}
