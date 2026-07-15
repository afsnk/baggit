import { AppRouteHandler } from "@/Core/Lib/types";
import { GetBalanceRoute } from "./balance.schema";
import { createError } from "evlog";
import { generateAccount, getBalance, getChain } from "@/Core/Lib/wallet/wallet.utils";
import db from "@/Core/DB";
import * as schema from "@/Core/DB/schema"
import { eq } from "drizzle-orm";
import { Address } from "viem";





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

    return status(200, {
      totalBalance: balances.reduce((prev, curr) => prev + curr, 0),
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
