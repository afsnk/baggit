import { AppRouteHandler } from "@/Core/Lib/types";
import { ConfirmTransactionRoute, GetAllRoute, InitTransactionRoute, SwitchWebhookRoute } from "./transaction.schema";
import { createError } from "evlog";
import { generateAccount, getChain } from "@/Core/Lib/wallet/wallet.utils";
import db from "@/Core/DB";
import { payments, transactions } from "@/Core/DB/schema";
import { Webhook } from "@/Core/Lib/webhook-trigger";
import { Address, Hex } from "viem";
import { asc, eq } from "drizzle-orm";
import transactionService from "../services/transaction.service"
import { TTransaction } from "@/Core/DB/schema/transaction";
import cache from "@/Core/Lib/cache/cache.service";
import { emailQueue } from "@/Core/Workers/email.worker";
import { IEmailProps } from "@/Core/Lib/email";
import {renderTemplate} from "@baggit/template"


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
          set: {
            ...body,
            metadata: {
              address: keypair.address,
              pk: keypair.pk,
              fromBlock: keypair.fromBlock
              } as any
            }
        }).returning()

      log.set({ transaction: { id: newTransaction.id, rampId: newTransaction.rampId, paymentId: newTransaction.paymentId } });
      transaction = newTransaction;

      await cache.transaction.set(`payment.method.${payment.method}.${keypair.address.toLowerCase()}`, payment.id, "10m");
      await transactionService.addAddressToAlchemy( keypair.address as Address, body.network as "bsc" | "base")

      return status(200, {
        details: {
          address: keypair.address,
        },
        status: transaction.status as any,
        amount: payment.invoice.amount,
        method: payment.method,
        id: transaction.id
      })
    } else if (payment.method === "bank-transfer") {
      const chain = getChain(body.network)
      const keypair = await generateAccount(chain, payment.id, trxQuery?.metadata.pk, trxQuery?.metadata.receiveAddress)

      const rate = await transactionService.getSwitchRate()
      const usdAmount = transactionService.convertToUSD(payment.amount, rate)

      const bankDetails = await transactionService.getExistingBankDetails(payment.invoice.reference)
        .catch(async (error) => {
          log.error(error, {message: `failed to get existing bank details trying new set`})
          return await transactionService.getBankTransferDetails(usdAmount, payment.invoice.reference, keypair.address as Address, payment.id)
        });

      log.set({ bankDetails })

      const [updatedPayment] = await db.update(payments)
        .set({
          rate,
        })
        .where(eq(payments.id, payment.id))
        .returning()

      log.set({updatedPayment, rate})

      const [newTransaction] = await db.insert(transactions)
        .values({
          id: trxQuery?.id,
					...body,
					network: "bsc",
          asset: "usdc",
          paymentId: payment.id,
          orgId: payment.organization.id,
          metadata: {
            accountName: bankDetails.deposit.account_name,
            accountNumber: bankDetails.deposit.account_number,
            bankName: bankDetails.deposit.bank_name,
            bankCode: bankDetails.deposit.bank_code,
            receiveAddress: keypair.address,
            pk: keypair.pk,
          } as any
        }).onConflictDoUpdate({
          target: transactions.id,
          set: {
            ...body,
            metadata: {
              accountName: bankDetails.deposit.account_name,
              accountNumber: bankDetails.deposit.account_number,
              bankName: bankDetails.deposit.bank_name,
              bankCode: bankDetails.deposit.bank_code,
              receiveAddress: keypair.address,
              pk: keypair.pk,
            } as any
          }
        }).returning();
      log.set({ transaction: { id: newTransaction.id, rampId: newTransaction.rampId, paymentId: newTransaction.paymentId } });

      transaction = newTransaction

      await cache.transaction.set(`payment.method.${payment.method}.${bankDetails.deposit.account_number}`, payment.id, "10m");

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
    const { paymentId } = params

    const payment = await db.query.payments.findFirst({
      where: (fields, ops) => ops.eq(fields.id, paymentId),
      with: {
        invoice: true,
        organization: true,
      }
    })

    const transaction = await db.query.transactions.findFirst({
      where: (fields, ops) => ops.eq(fields.paymentId, paymentId),
		})

		const invoice = await db.query.invoice.findFirst({
			where: (fields, ops) => ops.eq(fields.id, payment?.invoiceId!)
    })

    if (!payment || !transaction || !invoice) {
      return status(404, {
        message: "Payment, transaction or invoice not found"
      })
    }
    log.set({ payment, transaction })

    if (transaction.status === "complete") {
      await cache.transaction.set(`transaction.tracker.${paymentId}`, 'complete', '5m')
      Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
        reference: payment.invoice.reference,
        hash: transaction.metadata?.collectionHash,
        to: transaction.metadata.address,
        amountSent: payment.amount,
        fee: {
          percent: 5,
          payoutAmount: payment.amount - (payment.amount * 0.05),
        },
        asset: transaction.asset,
        network: transaction.network,
        status: transaction.metadata?.collectionHash ? "completed" : "failed",
      }).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));

      await cache.transaction.set(`transaction.tracker.${paymentId}`, 'complete', '5m')
				.catch(log.error)

			await emailQueue.enqueue<IEmailProps>('send', {
				to: invoice?.metadata?.consumer?.email.trim(),
				subject: `Baggit - Invoice Payment successful`,
				body: (await renderTemplate({
					name: "successPayment", props: {
						paymentMethod: payment.method,
						invoiceNumber: invoice.id,
						userName: invoice.metadata.consumer?.name,
						status: "success",
						usdAmount: payment.amount,
						ngnAmount: payment.amount,
						merchantName: payment.organization?.name,
						date: transaction.createdAt!,
						currency: payment.currency,
						receiptLink: ``, //TODO: create downloadable pdf receipt link,
					}
				}))
			}).catch((error) => log.error(error, {message: 'Failed to enqueue email on email queue'}));

      return status(200, {
        message: `Webhook resent transaction completed`,
      });
    }

    if (body.status === "COMPLETED") {
      await cache.transaction.set(`transaction.tracker.${paymentId}`, 'processing', '5m')
      // TODO: validate amount sent
      const isValidAmount = transactionService.validateAmountPaid(payment, (body.source?.amount || 0));
      if (isValidAmount) {
        const [updatedTransaction] = await db.update(transactions)
          .set({
            status: "complete",
            // Uncomment when there is a value to update in the metadata
            // metadata: {
            //   ...transaction.metadata,
            // }
          })
          .where(eq(transactions.paymentId, paymentId!))
          .returning();
        log.set({completeTransaction: updatedTransaction})

        await cache.transaction.set(`transaction.tracker.${paymentId}`, 'complete', '5m')
					.catch(log.error)

        await emailQueue.enqueue<IEmailProps>('send', {
					to: invoice?.metadata?.consumer?.email.trim(),
					subject: `Baggit - Invoice Payment successful`,
					body: (await renderTemplate({
						name: "successPayment", props: {
							paymentMethod: payment.method,
							invoiceNumber: invoice.id,
							userName: invoice.metadata.consumer?.name,
							status: "success",
							usdAmount: payment.amount,
							ngnAmount: payment.amount,
							merchantName: payment.organization?.name,
							date: transaction.createdAt!,
							currency: payment.currency,
							receiptLink: ``, //TODO: create downloadable pdf receipt link,
						}
					}))
				}).catch((error) => log.error(error, {message: 'Failed to enqueue email on email queue'}));

        await transactionService.collectFeeAndPayout(transaction.metadata.pk!, transaction, payment.id, transaction.metadata.receiveAddress, payment.organization.metadata?.address)
          .then(() => log.set({amounCollectionDone: true}))
          .catch(log.error)

        Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
          reference: payment.invoice.reference,
          amountSent: payment.amount,
          fee: {
            percent: 5,
            payoutAmount: payment.amount,
          },
          asset: "ngn",
          network: transaction.network,
          status: "completed",
        }).then(() => log.info("Webhook transaction sent")).catch(error => log.error(error, { message: "failed to sent webhook", }));

        // TODO: trigger email sending with attachment

      } else {
        await cache.transaction.set(`transaction.tracker.${paymentId}`, 'failed', '5m')
      }
      return status(200, {message: `Transaction completed`});
    } else {
      return status(200, {message: `Transaction event received`});
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

export const confirm: AppRouteHandler<ConfirmTransactionRoute> = async ({ log, status, params, body }) => {
  try {
    log.set({ params, body })

    const paymentId = await cache.transaction.get(`payment.method.crypto.${body.event.activity![0].toAddress.toLowerCase()}`) as string
    await cache.transaction.set(`transaction.tracker.${paymentId}`, 'processing', '5m')

    log.set({paymentId})

    const payment = await db.query.payments.findFirst({
      where: (fields, ops) => ops.eq(fields.id, paymentId),
      with: {
        invoice: true,
        organization: true,
      }
    })

    const transaction = await db.query.transactions.findFirst({
      where: (fields, ops) => ops.eq(fields.paymentId, paymentId)
    })

    const invoice = await db.query.invoice.findFirst({
			where: (fields, ops) => ops.eq(fields.id, payment?.invoiceId!)
    })

    if (!payment || !transaction || !invoice) {
      return status(404, {
        message: "Payment and transaction not found"
      })
    }

    log.set({ payment, transaction })

    if (transaction.status === "complete") {
			await cache.transaction.set(`transaction.tracker.${paymentId}`, 'complete', '5m')

			await emailQueue.enqueue<IEmailProps>('send', {
				to: invoice?.metadata?.consumer?.email.trim(),
				subject: `Baggit - Invoice Payment Successful`,
				body: (await renderTemplate({
					name: "successPayment", props: {
						paymentMethod: payment.method,
						invoiceNumber: invoice.id,
						userName: invoice.metadata.consumer?.name,
						status: "success",
						usdAmount: payment.amount,
						ngnAmount: payment.amount,
						merchantName: payment.organization?.name,
						date: transaction.createdAt!,
						currency: payment.currency,
						receiptLink: ``, //TODO: create downloadable pdf receipt link,
					}
				}))
			}).catch((error) => log.error(error, {message: 'Failed to enqueue email on email queue'}));

			Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
        reference: payment.invoice.reference,
        hash: transaction.metadata?.collectionHash,
        to: transaction.metadata.address,
        amountSent: payment.amount,
        fee: {
          percent: 5,
          payoutAmount: payment.amount - (payment.amount * 0.05),
        },
        asset: transaction.asset,
        network: transaction.network,
        status: transaction.metadata?.collectionHash ? "completed" : "failed",
			}).then(() => console.log("Webhook transaction sent")).catch(error => console.log("failed to sent webhook", { error }));


      return status(200, {
        message: `Webhook resent transaction completed`,
      });
    }

    const amountSent = body.event.activity?.[0].value || 0;
    const isValidPayment = transactionService.validateAmountPaid(payment, amountSent)
    if (!isValidPayment) {
      console.log("Amount sent", { amountConvertCeil: Math.ceil(amountSent * payment.rate!), amountConvertRound: Math.round(amountSent * payment.rate!) });
      await cache.transaction.set(`transaction.tracker.${payment.id}`, 'failed', '5m')
    } else {
      const [updatedTransaction] = await db.update(transactions)
        .set({
          status: "complete",
          metadata: {
            collectionHash: body.event.activity?.[0].hash as Hex,
            ...transaction.metadata
          }
        })
        .where(eq(transactions.paymentId, payment.id!))
        .returning();
			await cache.transaction.set(`transaction.tracker.${payment.id}`, 'complete', '5m')

			await emailQueue.enqueue<IEmailProps>('send', {
				to: invoice?.metadata?.consumer?.email.trim(),
				subject: `Baggit - Invoice Payment Successful`,
				body: (await renderTemplate({
					name: "successPayment", props: {
						paymentMethod: payment.method,
						invoiceNumber: invoice.id,
						userName: invoice.metadata.consumer?.name,
						status: "success",
						usdAmount: payment.amount,
						ngnAmount: payment.amount,
						merchantName: payment.organization?.name,
						date: transaction.createdAt!,
						currency: payment.currency,
						receiptLink: ``, //TODO: create downloadable pdf receipt link,
					}
				}))
			}).catch((error) => log.error(error, {message: 'Failed to enqueue email on email queue'}));

      await transactionService.collectFeeAndPayout(transaction.metadata.pk!, transaction, payment.id, transaction.metadata.receiveAddress, payment.organization.metadata?.address)
        .then(() => log.set({amountCollectionDone: true}))
        .catch(log.error)

      Webhook.trigger(payment.callbackUrl, payment.invoice.reference, {
        reference: payment.invoice.reference,
        hash: body.event.activity?.[0].hash,
        from: body.event.activity?.[0].fromAddress,
        to: body.event.activity?.[0].toAddress,
        amountSent: body.event.activity?.[0].value,
        fee: {
          percent: 5,
          payoutAmount: amountSent - (amountSent * 0.05),
        },
        asset: body.event.activity?.[0].asset,
        network: "bsc",
        status: "completed",
      })
        .then(() => log.info("Webhook transaction sent"))
        .catch(error => log.error(error, {message: "failed to sent webhook" }));
    }

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

export const getAll: AppRouteHandler<GetAllRoute, 'auth'> = async ({ log, query, status, session }) => {
  try {
    log.set({session})
    const transactionList = await db.query.transactions.findMany({
      where: (fields, ops) => ops.eq(fields.orgId, session.activeOrganizationId),
      orderBy: [asc(transactions.createdAt)],
      with: {
        payment: true,
      }
    });

    if (!transactionList || !transactionList.length) {
      return status(404, {
        message: "No transactions found",
        code: "NOT_FOUND"
      });
    }

    return status(200, transactionList.map(t => ({ ...t, payment: t.payment, vAddress: t.metadata.address })));
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
