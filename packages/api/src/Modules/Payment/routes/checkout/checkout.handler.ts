import { AppRouteHandler } from "@/Core/Lib/types";
import { CreateCheckoutOrderRoute, VerifyCheckoutStatusRoute } from "./checkout.schema";
import { createError } from "evlog";
import db from "@/Core/DB";
import { invoice, payments } from "@/Core/DB/schema";
import env from "@/Core/Config/env";



export const createCheckoutOrder: AppRouteHandler<CreateCheckoutOrderRoute, 'apiKey'> = async ({ log, body, status, organization }) => {
  try {
    log.set({ checkout: { ...body }, organization });

    // TODO: if checkout is recurring compute nextPayAt

    // Create invoice
    const [newInvoice] = await db.insert(invoice)
      .values({
        to: body.customer?.name,
        from: organization.name,
        amount: body.amount,
        reference: body.reference,
        currency: body.currency.toLowerCase(),
        orgId: organization.id,
        metadata: {
          ...body.metadata,
          type: body.types,
          range: body.range,
          ...(body.customer && {customer: body.customer}),
          nextPayAt: undefined,
        }
      }).returning();
    // Create default paymentMethod based on currency
    const [defaultPayment] = await db.insert(payments)
      .values({
        currency: body.currency.toLowerCase(),
        method: "bank-transfer",
        amount: body.amount,
        callbackUrl: body.callbackUrl || body.redirectUrl,
        orgId: organization.id,
        invoiceId: newInvoice.id,
        metadata: {
          url: `${env.CHECKOUT_CLIENT_URL}/r/${newInvoice.reference}`
        }
      }).returning()
    // Return checkout url

		const combined = { invoice: newInvoice, paymentUrl: defaultPayment.metadata?.url! }

    return status(200, combined)
  }
  catch (error: any) {
    log.error(error)
    throw createError({
      message: error?.message,
      why: "Failed to create checkout",
      fix: "Try again later"
    })
  }
}


export const verifyCheckoutStatus: AppRouteHandler<VerifyCheckoutStatusRoute, 'apiKey'> = async ({ log, params, status }) => {
  try {
    log.set({ order: { id: params.orderId } })

    // Get invoice order and check the payment status
    const order = await db.query.invoice.findFirst({
      where: (fields, ops) => ops.or(ops.eq(fields.reference, params.orderId), ops.eq(fields.id, params.orderId)),
      with: {
        payments: true,
      }
    })

    if (!order) {
      return status(404, {
        message: "Invoice with that reference or id not found",
        code: "NOT_FOUND"
      })
		}

		log.set({order})

    // Get transactions of payment, if more than 1, return each payments status
    const transactionWithStatus = await db.query.transactions.findFirst({
      where: (fields, ops) => ops.eq(fields.paymentId, order.payments[0].id)
    })

    if (!transactionWithStatus) {
			// Means payment has not been initialised for the payment
			return status(404, {
				message: "Transaction not initialised or not found",
				code: "NOT_FOUND"
      })
		}

		log.set({transaction: transactionWithStatus})

    return status(200, {
      ...order,
      status: transactionWithStatus?.status
    })
  }
  catch (error: any) {
    log.error(error)
    throw createError({
      message: error?.message,
      why: "Failed to verify status",
      fix: "Try again later"
    })
  }
}
