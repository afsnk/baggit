import { AppRouteHandler } from "@/Core/Lib/types";
import { CreatePaymentRoute, GetPaymentRoute } from "./payment.schema";
import db from "@/Core/DB";
import { payments } from "@/Core/DB/schema";
import { createError } from "evlog";
import env from "@/Core/Config/env";



export const createPayment: AppRouteHandler<CreatePaymentRoute, 'apiKey'> = async ({ status, body, log, organization }) => {
  try {
    log.info(`Body; Valid; Key`, { body, organization })

    const [newPayment] = await db.insert(payments)
      .values({
        ...body,
        orgId: organization.id,
        metadata: {
          ...body.metadata
        } as any
      }).returning();

    log.set({ newPayment: {id: newPayment.id, reference: newPayment.reference, amount: newPayment.amount} })

    return status(200, {
      paymentId: newPayment.id,
      paymentUrl: `${env.PAY_CLIENT_URL}/r/${newPayment.id}`
    })
  }
  catch (error: any) {
    log.error(error)
    throw createError({
      message: 'Create Payment failed',
      status: 500,
      why: error?.message,
      fix: 'Try again later',
    })
  }
}


export const getPayment: AppRouteHandler<GetPaymentRoute, 'apiKey'> = async ({params, status, log}) => {
  try {
    log.set({ params })

    const id = params.id as string
    const payment = await db.query.payments.findFirst({ where: (fields, ops) => ops.eq(fields.id, id) })

    if (!payment) {
      return status(404, {
        message: "Payment not found"
      })
    }

    log.set({payment: {id: payment.id, reference: payment.reference, amount: payment.amount}})

    return status(200, payment)
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
