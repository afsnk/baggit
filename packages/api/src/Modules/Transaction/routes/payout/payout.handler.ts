import { AppRouteHandler } from "@/Core/Lib/types";
import { BankListRequest, CreatePayoutRequest, LookupRequest, SwitchWebhookRequest, VerifyPayoutRequest } from "./payout.schema";
import { createError } from "evlog";
import db from "@/Core/DB";
import transactionService from "../../services/transaction.service";


export const createPayoutRequest: AppRouteHandler<CreatePayoutRequest, 'apiKey' | 'auth'> = async ({ status, log, organization, body }) => {
	try {
		const result = await transactionService.getPayoutDetails(body?.amount, {
			accountNumber: body.accountNumber,
			accountName: body.accountName,
			bankCode: body.bankCode,
			reference: crypto.randomUUID(),
			callbackUrl: ``
		})

		// Send source amount_usd to deposit address
		// Add to transaction table

		return status(200, {
			depositAddress: result.deposit.address,
			amount: result.source.amount,
			status: "pending"
		})
	}
	catch (error: any) {
		log.error(error)
    throw createError({
      message: error?.message,
      why: "Failed to create payout request",
      fix: "Try again later"
    })
	}
}

export const switchWebhookRequest: AppRouteHandler<SwitchWebhookRequest> = async ({ status, body, headers, log }) => {
	try {
		log.set({ ...body })

		return status(200, {
			message: 'All good',
			code: "OK"
		})
	}
	catch (error: any) {
		log.error(error, { message: 'Failed to process webhook' })
		throw createError({
      message: error?.message,
      why: "Failed to create payout request",
      fix: "Try again later"
    })
	}
}

export const lookupRequest: AppRouteHandler<LookupRequest, 'apiKey' | 'auth'> = async ({log, status, body}) => {
	try {
		log.set({body})
		const lookup = await transactionService.getAccountName(body.accountNumber, body.bankCode)

		return status(200, {
			accountNumber: lookup.account_number,
			accountName: lookup.account_name,
			bankCode: lookup.bank_code
		})
	}
	catch (error: any) {
		log.error(error)
		throw createError({
      message: error?.message,
      why: "Failed to confirm account name",
      fix: "Try again later"
    })
	}
}

export const bankList: AppRouteHandler<BankListRequest, 'auth'> = async ({ status, log }) => {
	try {
		const list = await transactionService.getBankList()
		return status(200, list)
	}
	catch (error: any) {
		log.error(error)
    throw createError({
      message: error?.message,
      why: "Failed to bank list",
      fix: "Try again later"
    })
	}
}


export const verifyPayoutRequest: AppRouteHandler<VerifyPayoutRequest, 'apiKey' | 'auth'> = async ({ status, log, params }) => {
	try {
		const id = params.requestId

		const transaction = await db.query.transactions.findFirst({
			where(fields, ops) {
				return ops.eq(fields.id, id)
			},
			with: {
				payment: true,
				ramp: true,
				organization: true,
			}
		}).catch(error => {
			log.error(error, { message: 'Failed to find payout transaction' })
			return null
		})

		if (!transaction) {
			return status(404, {
				message: "Failed to find transaction",
				code: "NOT_FOUND"
			})
		}

		const returnValue = {
			status: transaction.status,
			amount: transaction?.ramp.amount,
			id: transaction.id
		}

		return status(200, returnValue)
	}
	catch (error: any) {
		log.error(error)
    throw createError({
      message: error?.message,
      why: "Failed to verify payout request",
      fix: "Try again later"
    })
	}
}
