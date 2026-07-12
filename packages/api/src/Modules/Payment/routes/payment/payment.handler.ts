import { AppRouteHandler } from "@/Core/Lib/types";
import { UpdateMethodRoute, GetPaymentRoute } from "./payment.schema";
import db from "@/Core/DB";
import { invoice, payments } from "@/Core/DB/schema";
import { createError } from "evlog";
import env from "@/Core/Config/env";
import { eq } from "drizzle-orm";



export const updateMethod: AppRouteHandler<UpdateMethodRoute> = async ({ status, body, params, log }) => {
  try {
    log.set({ body, params })

    const [updatedPayment] = await db.update(payments)
      .set({
        ...body,
      } as any).where(eq(payments.id, params.id))
      .returning();

    log.set({ newPayment: { id: updatedPayment.id, currency: updatedPayment.currency, method: updatedPayment.method } })

    return status(200, updatedPayment)
  }
  catch (error: any) {
    log.error(error)
    throw createError({
      message: 'Updating Payment failed',
      status: 500,
      why: error?.message,
      fix: 'Try again later',
    })
  }
}


export const getPayment: AppRouteHandler<GetPaymentRoute> = async ({params, status, log}) => {
  try {
    log.set({ params })

    const invoiceReference = params.invoiceRef as string
    const invoice = await db.query.invoice.findFirst({
      where: (fields, ops) => ops.eq(fields.reference, invoiceReference),
      with: {
        payments: true
      }
    }).catch(error => {
      log.error(error)
      throw error
    })

    if (!invoice) {
      log.set({error: "Not found"})
      return status(404, {
        message: "Invoice not found",
        code: "NOT_FOUND"
      })
    }

    log.set({invoice})

    return status(200, invoice)
  }
  catch (error: any) {
    log.error(error)
    throw createError({
      message: 'Get Payment failed',
      status: 500,
      why: error?.message,
      fix: 'Try again later',
    })
  }
}
