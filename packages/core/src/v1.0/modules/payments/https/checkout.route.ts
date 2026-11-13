import type { DB } from '@core/adapters'
import { createRouter } from '@shared/create-router'
import InvoiceRepository from '../repositories/invoice.repository'
import CheckoutService from '../services/checkout.service'
import z from 'zod'
import { insertInvoice, selectInvoice } from '@core/adapters/db/schema'
import TransactionRepository from '../repositories/transaction.repository'
import { PSPAdapter } from '@core/adapters/psp/base.adapter'
import { SwitchAdapter } from '@core/adapters/psp/switch'
import { pspWebhookHandlerPayloadSchema } from '../entities/checkout.entitie'

const createCheckout = (
  db: DB,
  pspConfigs: {
    switch: {
      apiKey: string
      baseUrl: string
      callbackBaseUrl: string
      feeRate?: number
      feeAddress?: `0x${string}`
    }
  },
  cryptoAdapterConfig: {
    environment: string
    zeroDevRPC: string
    encryptionKey: string
  },
) => {
  const invoiceRepo = new InvoiceRepository(db)
  const transactionRepo = new TransactionRepository(db)
  const switchAdapter = new SwitchAdapter(
    pspConfigs.switch.baseUrl,
    pspConfigs.switch.apiKey,
    pspConfigs.switch.callbackBaseUrl,
    pspConfigs.switch.feeRate,
    pspConfigs.switch.feeAddress,
  )
  const service = new CheckoutService(
    invoiceRepo,
    transactionRepo,
    switchAdapter,
    cryptoAdapterConfig,
  )

  const router = createRouter({
    name: 'checkout',
    version: '0.0.1',
    prefix: '/api/checkout',
    db,
  })
    .decorate(() => {
      return {
        checkoutService: service,
      }
    })
    .get(
      '/:id',
      async ({ log, status, params, checkoutService }) => {
				try {
          log.set({params})
					if (!params.id.startsWith('inv_')) {
            return status('Bad Request', {
              message: `Invalid invoice id`,
              why: `The invoice id provided is invalid`,
              fix: 'Send a valid invoice id',
            })
					}
          return await checkoutService.getInvoice(params.id)
				} catch (error: any) {
          log.error(error)
          return status('Bad Request', {
            message: error.message,
            why: error.stack.toString() || '',
            fix: 'Retry later',
          })
        }
      },
      {
        response: {
          200: selectInvoice,
          400: z.object({
            message: z.string(),
            why: z.string(),
            fix: z.string(),
          }),
        },
        params: z.object({
          id: z.string().startsWith('inv_'),
        }),
      },
    )
    .post(
      '/create',
      async ({ log, status, checkoutService, body }) => {
        try {
          log.set(body)
          const newInvoice = await checkoutService.createInvoice(body)
          log.set(newInvoice)
          return status('OK', newInvoice)
        } catch (error: any) {
          log.error(error)
          return status('Bad Request', {
            message: error.message,
            why: error.stack.toString() || '',
            fix: 'Retry later',
          })
        }
      },
      {
        response: {
          200: z.object({
            method: z.string(),
            currency: z.string(),
            url: z.url(),
            reference: z.string(),
          }),
          400: z.object({
            message: z.string(),
            why: z.string(),
            fix: z.string(),
          }),
        },
        body: insertInvoice,
      },
    )
    .post(
      '/method/:id',
      async ({ log, status, body, params, checkoutService }) => {
        try {
          log.set({ body, params })
          const patched = await checkoutService.updatePaymentMethod(
            body,
            params.id,
          )
          return status('OK', {
            amount: patched.amount, // convert to payment currency
            method: patched.payment.method,
            currency: patched.payment.currency,
            url: patched.payment.url,
            reference: patched.reference,
            details:
              patched.details.method === 'bank-transfer'
                ? {
                    bankName: patched.details.deposit.bank_name,
                    accountName: patched.details.deposit.account_name,
                    accountNumber: patched.details.deposit.account_number,
                  }
                : { address: patched.details.deposit.address }, // { bankName; accountNumber; accountName; }
            status: 'pending',
            id: patched.id,
          })
        } catch (error: any) {
          log.error(error)
          return status('Bad Request', {
            message: error.message,
            why: error.stack.toString() || '',
            fix: 'Retry later',
          })
        }
      },
      {
        response: {
          200: z.object({
            id: z.string(),
            amount: z.number(),
            method: z.string(),
            currency: z.string(),
            url: z.url(),
            reference: z.string(),
            status: z.enum(['pending', 'failed', 'complete']),
            details: z.union([
              z.object({
                address: z.string(),
              }),
              z.object({
                bankName: z.string(),
                accountNumber: z.string(),
                accountName: z.string(),
              }),
            ]),
          }),
          400: z.object({
            message: z.string(),
            why: z.string(),
            fix: z.string(),
          }),
        },
        body: z.object({
          method: z.string(),
          currency: z.string(),
        }),
        params: z.object({
          id: z.string().startsWith('inv_'),
        }),
      },
    )
    .post(
      `/webhook/:pspId/:extra`,
      async ({ log, status, params, body, checkoutService }) => {
        log.set({ body, params })
        const { response, code } = await checkoutService.handleWebhook(
          body,
          params,
        )
        log.set({ code, response })
        return status(code, response)
      },
      {
        response: {
          200: z.object({
            message: z.string().optional(),
            status: z.string(),
          }),
          400: z.object({
            message: z.string().optional(),
            status: z.string(),
          }),
        },
        body: pspWebhookHandlerPayloadSchema, // Maybe a union of all PSP adapter webhook request payload schema
        params: z.object({
          pspId: z.string(),
          extra: z.string().optional(), // extra id | token for supported psp webhook routes
        }),
      },
    )

  return {
    fetch: router.fetch,
    service,
  }
}

export { createCheckout }
