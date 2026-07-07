import { AppRouteHandler } from "@/Core/Lib/types";
import { ConfirmTransactionRoute, GetAllRoute, InitTransactionRoute } from "./transaction.schema";
import { createError } from "evlog";
import { generateAccount, getChain, refactoredGetLogs, runTransaction, TOKEN_ADDRESSES } from "@/Core/Lib/wallet/wallet.utils";
import db from "@/Core/DB";
import { transactions } from "@/Core/DB/schema";
import { Webhook } from "@/Core/Lib/webhook-trigger";
import { formatUnits, parseUnits } from "viem";
import { desc, eq } from "drizzle-orm";
import transactionService from "../services/transaction.service"


export const init: AppRouteHandler<InitTransactionRoute, 'apiKey'> = async ({ body, log, status, organization }) => {
  try {
    log.set({transaction: {network: body.network, body}})
    const chain = getChain(body.network)
    const keypair = await generateAccount(chain)

    const pendingPayment = await db.query.payments.findFirst({
      where: (fields, ops) => ops.eq(fields.id, body.paymentId)
    })

    if (!pendingPayment) {
      return status(404, {
        message: `Payment not found or not created yet`
      })
    }

    const [newTransaction] = await db.insert(transactions)
      .values({
        ...body,
        paymentId: pendingPayment.id,
        orgId: organization.id,
        metadata: {
          address: keypair.address,
          pk: keypair.pk,
          fromBlock: keypair.fromBlock
        } as any
      }).returning()

    log.set({ transaction: { id: newTransaction.id, rampId: newTransaction.rampId, paymentId: newTransaction.paymentId } })

    return status(200, {
      address: newTransaction.metadata.address,
      status: newTransaction.status as any,
      amount: pendingPayment.amount,
      id: newTransaction.id
    })
  }
  catch (error: any) {
    log.error(error)
    throw createError({
      message: "Failed to initialise transaction",
      why: error?.message,
      fix: 'Try again later',
      status: 500
    })
  }
}


export const confirm: AppRouteHandler<ConfirmTransactionRoute, 'apiKey'> = async ({ log, status, query }) => {
  try {
    log.set({ transactionId: query.id, reference: query.reference })
    const transaction = await db.query.transactions.findFirst({
      where: (fields, ops) => ops.eq(fields.id, query.id),
      with: {
        payment: true
      }
    })

    if (!transaction) {
      return status(404, {
        message: "Transaction not found"
      })
    }

    log.set({ transaction: { payment: { id: transaction.payment?.id ?? transaction.paymentId } } })

    if (transaction.status === "complete") {
      Webhook.trigger(transaction.payment.callbackUrl, transaction.payment.reference, {
        reference: query.id,
        hash: transaction.metadata?.collectionHash,
        to: transaction.metadata.address,
        amountSent: transaction.payment.amount,
        fee: {
          percent: 5,
          payoutAmount: transaction.payment.amount - (transaction.payment.amount * 0.05),
        },
        asset: transaction.asset,
        network: transaction.network,
        status: transaction.metadata?.collectionHash ? "completed" : "failed",
      }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));

      return status(200, {
        id: transaction.id,
        status: transaction.status,
        network: transaction.network,
        asset: transaction.asset,
        paymentId: transaction.paymentId,
        rampId: transaction.rampId,
        orgId: transaction.orgId,
        metadata: transaction.metadata,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      });
    }

    // Call smart contract and check for Transfer event on address
    const chain = getChain(transaction.network);
    const token = TOKEN_ADDRESSES[chain.id][`${transaction.asset}`];

    const {hasTransferEvent, amountMatch, amountSent, decodedLog} = await transactionService.confirmTransferIn(transaction)


    if (hasTransferEvent) {
      // Call calbackUrl with reference and transaction details
      // Update transaction as completed

      if (!amountMatch) {
        console.log("Amount sent", { amountConvertCeil: Math.ceil(amountSent * 1365), amountConvertRound: Math.round(amountSent * 1365) });
        return status(401, {
          status: "failed",
          message: "Amount sent does not match the expected amount.",
        });
      }

      const [updatedTransaction] = await db.update(transactions)
        .set({
          status: "complete",
          metadata: {
            ...transaction.metadata,
            collectionHash: decodedLog?.transactionHash,
          },
        })
        .where(eq(transactions.id, query.id))
        .returning();

      Webhook.trigger(transaction.payment.callbackUrl, transaction.payment.reference, {
        reference: query.id,
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

      return status(200, updatedTransaction);
    }
    else {
      return status(401, {
        status: "failed",
        message: "No transfer found in this address",
      });
    }
  }
  catch (error: any) {
    log.error(error)
    throw createError({
      message: "Failed to confirm transaction",
      why: error?.message,
      fix: `Try again later`,
      status: 500
    })
  }
}

export const getAll: AppRouteHandler<GetAllRoute, 'apiKey'> = async ({ log, query, status }) => {
  try {
    const transactionList = await db.query.transactions.findMany({
      orderBy: [desc(transactions.createdAt)],
    });

    if (!transactionList || !transactionList.length) {
      return status(401, {
        message: "No transactions found",
      });
    }

    return status(200, transactionList.map(t => ({ ...t, vAddress: t.metadata.address })));
  }
  catch (error: any) {
    log.error(error);
    throw createError({
      message: "Failed to get all transaction",
      why: error?.message,
      fix: `Try again later`,
      status: 500
    })
  }
}
