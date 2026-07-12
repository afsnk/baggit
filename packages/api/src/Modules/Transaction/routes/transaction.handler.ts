import { AppRouteHandler } from "@/Core/Lib/types";
import { ConfirmTransactionRoute, GetAllRoute, InitTransactionRoute, SwitchWebhookRoute } from "./transaction.schema";
import { createError } from "evlog";
import { generateAccount, getChain } from "@/Core/Lib/wallet/wallet.utils";
import db from "@/Core/DB";
import { transactions } from "@/Core/DB/schema";
import { Webhook } from "@/Core/Lib/webhook-trigger";
import { Address, Hex } from "viem";
import { desc, eq } from "drizzle-orm";
import transactionService from "../services/transaction.service"
import { TTransaction } from "@/Core/DB/schema/transaction";
import cache from "@/Core/Lib/cache/cache.service";


export const init: AppRouteHandler<InitTransactionRoute> = async ({ body, log, status }) => {
  try {
    log.set({ transaction: { network: body.network, body } })

    const payment = await db.query.payments.findFirst({
      where: (fields, ops) => ops.eq(fields.id, body.paymentId!),
      with: {
        invoice: true,
        organization: true,
        // transaction: true,
      }
    }).catch(error => {
      console.log(`Error getting payment`, { error })
      throw error;
    })
    if (!payment) {
      return status(404, {
        message: `No payment found`,
        code: "NOT_FOUND"
      })
    }

    const trxQuery = await db.query.transactions.findFirst({
      where: (fields, ops) => ops.eq(fields.paymentId, payment.id),
    })

    console.log(`Tranasction`, {trxQuery})

    let transaction: TTransaction;
    if (payment.method === "crypto") {
      const chain = getChain(body.network)
      const keypair = await generateAccount(chain, body.paymentId, trxQuery?.metadata.pk, trxQuery?.metadata.address)

      const [newTransaction] = await db.insert(transactions)
        .values({
          id: trxQuery?.id,
          ...body,
          paymentId: payment.id,
          orgId: payment.organization.id,
          metadata: {
            address: keypair.address,
            pk: keypair.pk,
            fromBlock: keypair.fromBlock
          } as any
        }).onConflictDoUpdate({
          target: transactions.id,
          set: {...body}
        }).returning()

      log.set({ transaction: { id: newTransaction.id, rampId: newTransaction.rampId, paymentId: newTransaction.paymentId } });
      transaction = newTransaction;

      await cache.transaction.set(`payment.method.${payment.method}.${transaction.metadata.address}`, payment.id, "10m");
      await transactionService.addAddressToAlchemy( keypair.address as Address, body.network as "bsc" | "base")

      return status(200, {
        details: {
          address: transaction.metadata.address!,
        },
        status: transaction.status as any,
        amount: payment.invoice.amount,
        method: payment.method,
        id: transaction.id
      })
    } else if (payment.method === "bank-transfer") {
      const chain = getChain(body.network)
      const keypair = await generateAccount(chain, payment.id)

      const rate = await transactionService.getSwitchRate()
      const usdAmount = transactionService.convertToUSD(payment.amount, rate)

      const bankDetails = await transactionService.getExistingBankDetails(payment.invoice.reference)
        .catch(async (error) => {
          log.error(error, {message: `failed to get existing bank details trying new set`})
          return await transactionService.getBankTransferDetails(usdAmount, payment.invoice.reference, keypair.address as Address, payment.id)
        });

      log.set({bankDetails})

      const [newTransaction] = await db.insert(transactions)
        .values({
          id: trxQuery?.id,
          ...body,
          paymentId: payment.id,
          orgId: payment.organization.id,
          metadata: {
            accountName: bankDetails.deposit.account_name,
            accountNumber: bankDetails.deposit.account_number,
            bankName: bankDetails.deposit.bank_name,
            bankCode: bankDetails.deposit.bank_code,
          }
        }).onConflictDoUpdate({
          target: transactions.id,
          set: {...body}
        }).returning();
      log.set({ transaction: { id: newTransaction.id, rampId: newTransaction.rampId, paymentId: newTransaction.paymentId } });

      transaction = newTransaction

      await cache.transaction.set(`payment.method.${payment.method}.${newTransaction.metadata.accountNumber}`, payment.id, "10m");

      return status(200, {
        details: {
          bankName: bankDetails.deposit.bank_name,
          accountName: bankDetails.deposit.account_name,
          accountNumber: bankDetails.deposit.account_number
        },
        status: newTransaction.status as any,
        amount: bankDetails?.source?.amount || payment.invoice.amount,
        method: payment.method,
        id: newTransaction.id
      })
    }

    return status(400, {
      message: "Payment method not supported yet, use either crypto or bank transfer",
      code: "PAYMENT_METHOD_NOT_SUPPORTED"
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


export const switchWebhook: AppRouteHandler<SwitchWebhookRoute> = async ({ log, status, params, body }) => {
  try {
    log.set({ body, params })
    const {paymentId} = params

    const payment = await db.query.payments.findFirst({
      where: (fields, ops) => ops.eq(fields.id, paymentId),
      with: {
        invoice: true,
        organization: true,
        transaction: true,
      }
    })

    if (!payment) {
      return status(404, {
        message: "Payment not found"
      })
    }

    log.set({ payment })

    if (payment.transaction.status === "complete") {
      Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
        reference: payment.invoice.reference,
        hash: payment.transaction.metadata?.collectionHash,
        to: payment.transaction.metadata.address,
        amountSent: payment.transaction.payment.amount,
        fee: {
          percent: 5,
          payoutAmount: payment.transaction.payment.amount - (payment.transaction.payment.amount * 0.05),
        },
        asset: payment.transaction.asset,
        network: payment.transaction.network,
        status: payment.transaction.metadata?.collectionHash ? "completed" : "failed",
      }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));

      return status(200, {
        message: `Webhook resent transaction completed`,
      });
    }

    const [updatedTransaction] = await db.update(transactions)
      .set({
        status: "complete",
        metadata: {
          ...body,
        }
      })
      .where(eq(transactions.id, payment.transaction.id!))
      .returning();

    Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
      reference: payment.invoice.reference,
      amountSent: payment.amount,
      fee: {
        percent: 5,
        payoutAmount: payment.amount,
      },
      asset: "ngn",
      network: payment.transaction.network,
      status: "completed",
    }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));
    console.log("Transaction has Transfer event and updated", { updatedTransaction });

    return status(200, {message: `Transaction completed`});
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

export const confirm: AppRouteHandler<ConfirmTransactionRoute> = async ({ log, status, params, body }) => {
  try {
    log.set({ params, body })

    const paymentId = await cache.transaction.get(`payment.method.crypto.${body.event.activity[0].toAddress}`) as string

    const payment = await db.query.payments.findFirst({
      where: (fields, ops) => ops.eq(fields.id, paymentId),
      with: {
        invoice: true,
        organization: true,
        transaction: true,
      }
    })

    if (!payment) {
      return status(404, {
        message: "Payment not found"
      })
    }

    log.set({ payment })

    if (payment.transaction.status === "complete") {
      Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
        reference: payment.invoice.reference,
        hash: payment.transaction.metadata?.collectionHash,
        to: payment.transaction.metadata.address,
        amountSent: payment.transaction.payment.amount,
        fee: {
          percent: 5,
          payoutAmount: payment.transaction.payment.amount - (payment.transaction.payment.amount * 0.05),
        },
        asset: payment.transaction.asset,
        network: payment.transaction.network,
        status: payment.transaction.metadata?.collectionHash ? "completed" : "failed",
      }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));

      return status(200, {
        message: `Webhook resent transaction completed`,
      });
    }

    // Call smart contract and check for Transfer event on address
    // const chain = getChain(payment.transaction.network);
    // const token = TOKEN_ADDRESSES[chain.id][`${payment.transaction.asset as string}`];

    // const { hasTransferEvent, amountMatch, amountSent, decodedLog } = await transactionService.confirmTransferIn(transaction)


      // Call calbackUrl with reference and transaction details
    // Update transaction as completed

    const amountSent = body.event.activity[0].value
    let amountMatch: boolean = false;

    const isNaira = payment.invoice.currency === "ngn"
    const invoiceAmount = payment.invoice.amount;

    if (isNaira) {
      const nairaAmount = transactionService.convertToNGN(amountSent, payment.rate!)
      amountMatch = nairaAmount >= invoiceAmount;
    }

    if (!amountMatch) {
      console.log("Amount sent", { amountConvertCeil: Math.ceil(amountSent * payment.rate!), amountConvertRound: Math.round(amountSent * payment.rate!) });
      return status(401, {
        status: "failed",
        message: "Amount sent does not match the expected amount.",
      });
    }

    const [updatedTransaction] = await db.update(transactions)
      .set({
        status: "complete",
        metadata: {
          collectionHash: body.event.activity[0].hash as Hex,
        }
      })
      .where(eq(transactions.id, payment.transaction.id!))
      .returning();

    Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
      reference: payment.invoice.reference,
      hash: body.event.activity[0].hash,
      from: body.event.activity[0].fromAddress,
      to: body.event.activity[0].toAddress,
      amountSent: body.event.activity[0].value,
      fee: {
        percent: 5,
        payoutAmount: amountSent - (amountSent * 0.05),
      },
      asset: body.event.activity[0].asset,
      network: payment.transaction.network,
      status: "completed",
    }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));
    console.log("Transaction has Transfer event and updated", { updatedTransaction });

    return status(200, {message: `Transaction completed`});
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
