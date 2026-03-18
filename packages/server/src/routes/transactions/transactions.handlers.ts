import type { Address, Hex } from "viem";

import { desc, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { encodeFunctionData, formatUnits, parseAbi, parseUnits } from "viem";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { transactions as transactionSchema } from "@/db/schema";
import env from "@/env";
import { Cypher } from "@/lib/cypher.utils";
import { generateAccount, getChain, refactoredGetLogs, runTransaction, TOKEN_ADDRESSES } from "@/lib/wallet.utils";
import { Webhook } from "@/lib/webhook-trigger";

import type { ConfirmRoute, GetTransactionRoute, PaymentInitRoute } from "./transactions.routes";

export const init: AppRouteHandler<PaymentInitRoute> = async (c) => {
  try {
    const body = c.req.valid("json");

    const chain = getChain(body.network);
    const keypair = await generateAccount(chain);
    // Save to DB
    const [newTransaction] = await db.insert(transactionSchema).values({
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

    // Check transaction status
    if (transaction?.status === "complete") {
      Webhook.trigger(transaction.callbackUrl, transaction.reference, {
        reference: params.reference,
        hash: transaction.metadata?.collectionHash,
        to: transaction.metadata.address,
        amountSent: transaction.amount,
        fee: {
          percent: 5,
          payoutAmount: transaction.amount - (transaction.amount * 0.05),
        },
        asset: transaction.asset,
        network: transaction.network,
        status: transaction.metadata?.collectionHash ? "completed" : "failed",
      }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));

      return c.json({
        message: `Transaction already confirmed with reference: ${params.reference}`,
        status: "complete",
        reference: params.reference,
        hash: transaction.metadata?.collectionHash,
        to: transaction.metadata.address,
        amountSent: transaction.amount,
        asset: transaction.asset,
        network: transaction.network,
        hasTransferEvent: !!transaction.metadata?.collectionHash,
      }, HttpStatusCodes.OK);
    }

    // Call smart contract and check for Transfer event on address
    const chain = getChain(transaction.network);
    const token = TOKEN_ADDRESSES[chain.id][`${transaction.asset}`];
    const { hasTransferEvent, decodedLog } = await refactoredGetLogs(chain, transaction.metadata?.fromBlock, transaction.metadata.address!, token.address as Address);

    if (hasTransferEvent) {
      // Call calbackUrl with reference and transaction details
      // Update transaction as completed
      const amountSent = Number(formatUnits((decodedLog?.args.value ?? 0n), token.decimal));

      // Confirm amount send
      const amountMatch = Math.ceil((amountSent * 1365)) === transaction?.amount;

      if (!amountMatch) {
        console.log("Amount sent", { amountConvertCeil: Math.ceil(amountSent * 1365), amountConvertRound: Math.round(amountSent * 1365) });
        return c.json({
          status: "failed",
          message: "Amount sent does not match the expected amount.",
        }, HttpStatusCodes.BAD_REQUEST);
      }

      const [updatedTransaction] = await db.update(transactionSchema)
        .set({
          status: "complete",
          metadata: {
            ...transaction.metadata,
            collectionHash: decodedLog?.transactionHash,
          },
        })
        .where(eq(transactionSchema.reference, params.reference))
        .returning();

      Webhook.trigger(transaction.callbackUrl, transaction.reference, {
        reference: params.reference,
        hash: decodedLog?.transactionHash,
        from: decodedLog?.args.from,
        to: decodedLog?.args.to,
        amountSent,
        fee: {
          percent: 5,
          payoutAmount: amountSent - (amountSent * 0.05),
        },
        asset: transaction.asset,
        network: transaction.network,
        status: hasTransferEvent ? "completed" : "failed",
      }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));
      console.log("Transaction has Transfer event and updated", { updatedTransaction });

      await runTransaction(
        Cypher.decrypt(updatedTransaction.metadata?.pk, env.ENC_KEY) as Hex,
        chain,
        token.address as Address,
        [
          encodeFunctionData({
            abi: parseAbi([
              "function transfer(address to, uint256 amount) external returns (bool)",
            ]),
            functionName: "transfer",
            args: [
              `0x3a91a76d654e24021eec78472d06c5d8846b6dee`, // Send to mercahnt
              parseUnits((amountSent - (amountSent * 0.05)).toString(), token.decimal),
            ],
          }),
          encodeFunctionData({
            abi: parseAbi([
              "function transfer(address to, uint256 amount) external returns (bool)",
            ]),
            functionName: "transfer",
            args: [
              `0xdc338f02185f09086985aFc26264B3AC47CDb406`, // collect fee
              parseUnits((amountSent * 0.05).toString(), token.decimal),
            ],
          }),
        ],
      ).then((receipt) => {
        console.log(`Reciept of payout transaction`, { receipt });
        db.update(transactionSchema)
          .set({
            metadata: {
              ...updatedTransaction.metadata,
              payoutHash: receipt.transactionHash,
            },
          })
          .where(eq(transactionSchema.reference, params.reference));
      }).catch(error => console.log(`Error sweeping funds`, { error }));

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
    else {
      return c.json({
        reference: params.reference,
        status: "failed",
        message: "No transfer found in this address",
      }, HttpStatusCodes.BAD_REQUEST);
    }
  }
  catch (error: any) {
    console.log("Error while confirming transacrtion", { error });
    return c.json({
      message: error?.message,
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const get: AppRouteHandler<GetTransactionRoute> = async (c) => {
  try {
    const transactions = await db.query.transactions.findMany({
      orderBy: [desc(transactionSchema.createdAt)],
    });

    if (!transactions) {
      return c.json({
        message: "No transactions found",
      }, HttpStatusCodes.BAD_REQUEST);
    }

    return c.json(transactions, HttpStatusCodes.OK);
  }
  catch (error: any) {
    console.log(`Failed to get transaction`, { error });
    return c.json({
      message: error?.message,
      stack: error?.stack,
    }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
