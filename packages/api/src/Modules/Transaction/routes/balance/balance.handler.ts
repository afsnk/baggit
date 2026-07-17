import { AppRouteHandler } from "@/Core/Lib/types";
import { ClawFundsRoute, GetBalanceRoute } from "./balance.schema";
import { createError } from "evlog";
import { generateAccount, getBalance, getChain, runTransaction, TOKEN_ADDRESSES } from "@/Core/Lib/wallet/wallet.utils";
import db from "@/Core/DB";
import * as schema from "@/Core/DB/schema"
import { eq } from "drizzle-orm";
import { Address, encodeFunctionData, Hex, parseAbi, parseUnits } from "viem";
import transactionService from "../../services/transaction.service";
import { Cypher } from "@/Core/Lib/wallet/cypher.utils";


export const getBalances: AppRouteHandler<GetBalanceRoute, 'auth'> = async ({ log, session, status }) => {
  try {
    log.set({ session })

    const organization = await db.query.organization.findFirst({
      where: (fields, ops) => ops.eq(fields.id, session?.activeOrganizationId)
    })

    if (!organization) {
      return status(404, {
        message: "Organization not found",
        code: "NOT_FOUND"
      })
    }

    let balances: number[]
    if (!organization.metadata?.address) {
      const chain = getChain("bsc")
      const account = await generateAccount(chain, organization.id)

      const [updateOrg] = await db.update(schema.organization)
        .set({
          metadata: {
            ...organization.metadata,
            address: account.address,
            pk: account.pk,
            fromBlock: account.fromBlock
          } as any
        })
        .where(eq(schema.organization.id, organization.id))
        .returning()

      balances = await Promise.all(['usdt', 'usdc', 'cngn'].map((asset) => getBalance(
        "bsc",
        updateOrg.metadata?.address as Address,
        asset as "usdt" | "usdc" | "cngn"
      )))
    } else {
      balances = await Promise.all(['usdt', 'usdc', 'cngn'].map((asset) => getBalance(
        "bsc",
        organization.metadata?.address as Address,
        asset as "usdt" | "usdc" | "cngn"
      )))
    }

    const rate = await transactionService.getSwitchRate()
    const totalUsd = balances.filter((_, index) => index !== 2).reduce((prev, curr) => prev + curr, 0)
    const totalNgn = (balances[2] + (totalUsd * rate))

    return status(200, {
      totalNgnBalance: totalNgn,
      totalUsdBalance: totalUsd,
      usdtBalance: balances[0],
      usdcBalance: balances[1],
      cngnBalance: balances[2]
    })

  }
  catch (error: any) {
    log.error(error);
    throw createError({
      message: "Failed to get balances",
      why: error?.message,
      fix: `Try again later`,
      status: 500
    })
  }
}


export const clawFunds: AppRouteHandler<ClawFundsRoute, 'auth'> = async ({ log, session, status }) => {
	try {
		const organization = await db.query.organization.findFirst({
			where: (fields, ops) => ops.eq(fields.id, session?.activeOrganizationId)
		})

		if (!organization) {
			return status(404, {
				message: "No active organization found",
				code: "NOT_FOUND"
			})
		}

		log.set({session, orgId: session?.activeOrganizationId})
		const transactions = await db.query.transactions.findMany({
			where: (fields, ops) => ops.eq(fields.orgId, organization?.id)
		})

		if (!transactions) {
			return status(404, {
				message: "No transaction found for this organization",
				code: "NOT_FOUND"
			})
		}
		const orgAddress = organization?.metadata?.address;
		log.set({orgAddress})

		for (const trx of transactions) {
	    const chain = getChain(trx?.network as "bsc" | "base")
	    // const { pk, address } = await generateAccount(chain, trx?.paymentId, trx?.metadata.pk, trx?.metadata.address)
	    const balance = await getBalance(trx?.network as "bsc" | "base", trx.metadata?.receiveAddress as Address, trx?.asset as "usdt" | "usdc" | "cngn")

	    const asset = trx?.asset as "usdt" | "usdc" | "cngn"
			const token = TOKEN_ADDRESSES[chain.id][`${asset}`];

			log.set({clawbackBalance: balance, network: trx.network, asset})

	    if (balance > 0 && trx.paymentId) {
	      await runTransaction(
	        Cypher.decrypt(trx.metadata?.pk!, trx.paymentId) as Hex,
	        chain,
	        token.address as Address,
	        [
	          encodeFunctionData({
	            abi: parseAbi([
	              "function transfer(address to, uint256 amount) external returns (bool)",
	            ]),
	            functionName: "transfer",
	            args: [
	              orgAddress as Address, // collect fee
	              parseUnits(balance.toString(), token.decimal),
	            ],
	          }),
	        ],
	      ).then((receipt) => {
	        log.set({ receipt });
	        return receipt;
	      }).catch(error => log.error(error, {message: `error clawing back`}));
	    }
		}

		return status(200, {
			message: "Clawback ran",
			code: "OK"
		})
	}
	catch (error: any) {
		log.error(error);
    throw createError({
      message: "Failed to claw balances",
      why: error?.message,
      fix: `Try again later`,
      status: 500
    })
	}
}
