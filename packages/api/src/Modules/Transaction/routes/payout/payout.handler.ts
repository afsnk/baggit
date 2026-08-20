import { AppRouteHandler } from "@/Core/Lib/types";
import { BankListRequest, CreatePayoutRequest, LookupRequest, SwitchWebhookRequest, VerifyPayoutRequest } from "./payout.schema";
import { createError } from "evlog";
import db from "@/Core/DB";
import transactionService from "../../services/transaction.service";
import env from "@/Core/Config/env";
import { ramps, transactions as transactionsTable } from "@/Core/DB/schema";
import { Address } from "viem";
import { eq } from "drizzle-orm";


export const createPayoutRequest: AppRouteHandler<CreatePayoutRequest, 'apiKey' | 'auth'> = async ({ status, log, organization, body, session }) => {
	try {

		let org = organization
		if (!org) {
			org = await db.query.organization.findFirst({
				where: (fields, ops) => {
					return ops.eq(fields.id, session.activeOrganizationId)
				}
			})
		}

		const rate = await transactionService.getSwitchRate('offramp');
		const usdAmount = transactionService.convertToUSD(body.amount, rate)

		// Add to ramp table
		const [newRamp] = await db.insert(ramps)
			.values({
				amount: body.amount,
				reference: body.reference,
				orgId: org.id,
				type: 'sell',
				metadata: {
					ngnAmount: body.amount,
					usdAmount,
				} as any
			}).returning()

		// Add to transaction table
		const [newTransaction] = await db.insert(transactionsTable)
			.values({
				rampId: newRamp.id,
				network: "bsc",
				asset: "usdc",
				orgId: org.id,
				metadata: {} as any
			}).returning()

		const result = await transactionService.getPayoutDetails(usdAmount, {
			accountNumber: body.accountNumber,
			accountName: body.accountName,
			bankCode: body.bankCode,
			reference: body.reference,
			callbackUrl: `${env.API_URL}/v1/payout/webhook/switch/${newTransaction.id}`
		})
		log.set({ payoutDetails: { ...result }, newTransaction, newRamp })

		// Update transaction with metadata
		const [updatedTransaction] = await db.update(transactionsTable)
			.set({
				metadata: {
					callbackUrl: `${env.API_URL}/v1/payout/webhook/switch/${newTransaction.id}`,
					receiveAddress: result.deposit.address,
					accountName: body.accountName,
					accountNumber: body.accountNumber,
					bankCode: body.bankCode,
					asset: result.deposit.asset
				} as any
			})
			.where((eq(transactionsTable.id, newTransaction.id)))
			.returning()

		// Send source amount_usd to deposit address
		const transferResult = await transactionService.collectFeeAndPayout(
			org.metadata.pk,
			newTransaction,
			org.id,
			org.metadata.address,
			result.deposit.address as Address,
			usdAmount
		)

		log.set(transferResult)

		return status(200, {
			reference: body.reference,
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

export const switchWebhookRequest: AppRouteHandler<SwitchWebhookRequest> = async ({ status, body, headers, log, params }) => {
	try {
		log.set({ ...body, params })

		const transactionId = params.transactionId

		if (body.status === "COMPLETED") {
      const [updatedTransaction] = await db.update(transactionsTable)
        .set({
          status: "complete",
        })
        .where(eq(transactionsTable.paymentId, transactionId!))
				.returning();

      // TODO: Call webhook
      // FIXME: Extract webhook processing to `ProviderContext` with with the correct adapter
    }

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
