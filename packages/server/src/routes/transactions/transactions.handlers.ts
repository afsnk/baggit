import type { Address } from "viem";

import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { formatUnits } from "viem";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { transactions } from "@/db/schema";
import { generateAccount, getChain, getLogs, TOKEN_ADDRESSES } from "@/lib/wallet.utils";
import { Webhook } from "@/lib/webhook-trigger";

import type { ConfirmRoute, PaymentInitRoute } from "./transactions.routes";

export const init: AppRouteHandler<PaymentInitRoute> = async (c) => {
  try {
    const body = c.req.valid("json");

    const chain = getChain(body.network);
    const keypair = await generateAccount(chain);
    // Save to DB
    const [newTransaction] = await db.insert(transactions).values({
      ...body,
      metadata: {
        address: keypair.address,
        pk: keypair.pk,
        fromBlock: keypair.fromBlock,
      } as any,
    }).returning();

    console.log(`Transaction created`, { newTransaction });

    return c.json({
      address: newTransaction.metadata?.address,
      status: newTransaction.status,
      amount: body.amount,
    }, HttpStatusCodes.OK);
  }
  catch (error: any) {
    console.log("Error while creating transacrtion", { error });
    return c.json({
      message: error?.message,
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const confirm: AppRouteHandler<ConfirmRoute> = async (c) => {
  try {
    const params = c.req.valid("param");
    console.log("Params: ", { params });

    const transaction = await db.query.transactions.findFirst({
      where: (fields, ops) => ops.eq(fields.reference, params.reference),
    });

    if (!transaction) {
      return c.json({
        message: `Transaction not found with reference: ${params.reference}`,
        status: "failed",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    console.log("Transaction found", { transaction });

    // Call smart contract and check for Transfer event on address
    const chain = getChain(transaction.network);
    const token = TOKEN_ADDRESSES[chain.id][`${transaction.asset}`];
    const { hasTransferEvent, decodedLog } = await getLogs(chain, transaction.metadata?.fromBlock, transaction.metadata.address!, token.address as Address);

    if (hasTransferEvent) {
      // Call calbackUrl with reference and transaction details
      // Update transaction as completed
      const amountSent = Number(formatUnits((decodedLog?.args.value ?? 0n), token.decimal));
      const [updatedTransaction] = await db.update(transactions)
        .set({
          status: "complete",
          metadata: {
            ...transaction.metadata,
            collectionHash: decodedLog?.transactionHash,
          },
        })
        .where(eq(transactions.reference, params.reference))
        .returning();
      Webhook.trigger(transaction.callbackUrl, transaction.reference, {
        reference: params.reference,
        hash: decodedLog?.transactionHash,
        from: decodedLog?.args.from,
        to: decodedLog?.args.to,
        amountSent,
        fee: {
          percent: 7,
          payoutAmount: amountSent - (amountSent * 0.07),
        },
        asset: transaction.asset,
        network: transaction.network,
        status: hasTransferEvent ? "completed" : "failed",
      }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));
      console.log("Transaction has Transfer event and updated", { updatedTransaction });
    }

    return c.json({
      reference: params.reference,
      hash: decodedLog?.transactionHash,
      from: decodedLog?.args.from,
      to: decodedLog?.args.to,
      amountSent: formatUnits((decodedLog?.args.value ?? 0n), token.decimal),
      asset: transaction.asset,
      network: transaction.network,
      hasTransferEvent,
      status: hasTransferEvent ? "completed" : "failed",
    }, HttpStatusCodes.OK);
  }
  catch (error: any) {
    console.log("Error while confirming transacrtion", { error });
    return c.json({
      message: error?.message,
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
