import { AppRouteHandler } from "@/Core/Lib/types";
import { CreateCheckoutOrderRoute, VerifyCheckoutStatusRoute } from "./checkout.schema";
import { createError } from "evlog";
import db from "@/Core/DB";
import { invoice } from "@/Core/DB/schema";



export const createCheckoutOrder: AppRouteHandler<CreateCheckoutOrderRoute, 'apiKey'> = async ({ log, body, status, organization }) => {
  try {
    log.set({ checkout: { ...body } });

    // Create invoice
    const [newInvoice] = await db.insert(invoice)
      .values({
        to: body.customer?.name,
        from: organization.name,
        amount: body.amount,
        reference: body.reference,
      }).returning();
    // Create default paymentMethod based on currency
    // Return checkout url


    return status(200, {
      ...newInvoice,

    })
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
    log.set({ order: { id: params.id } })

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

    // Get transaction of payment
    const transactionWithStatus = await db.query.transactions.findFirst({
      where: (fields, ops) => ops.eq(fields.paymentId, order.payments.id)
    })

    if (!transactionWithStatus) {
      // Means payment has not been initialised for the payment
    }

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
