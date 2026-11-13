import { createError } from 'evlog'
import z from 'zod'

import type { DB } from '@core/adapters'

import { SwitchAdapter } from '@core/adapters/psp/switch'
import { createRouter } from '@shared/create-router'

import { payoutRequestSchema } from '../entities/payout.entities'
import TransactionRepository from '../repositories/transaction.repository'
import PayoutService from '../services/payout.service'

function createPayout(
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
) {
  // TODO: deal with transaction repository not checkout
  const repository = new TransactionRepository(db)
  const adapter = new SwitchAdapter(
    pspConfigs.switch.baseUrl,
		pspConfigs.switch.apiKey,
		pspConfigs.switch.callbackBaseUrl,
    pspConfigs.switch.feeRate,
    pspConfigs.switch.feeAddress,
  )
	const service = new PayoutService(adapter, repository);

  const router = createRouter({
    name: 'payout',
    version: '0.0.1',
    prefix: '/api/payout',
    db,
  })
    .decorate(() => ({
      transactionRepository: repository,
      adapter,
      payoutService: service,
    }))
    .post(
      '/',
      async ({ log, body, transactionRepository, payoutService }) => {
        try {
          log.set(body)
        } catch (error: any) {
          log.error(error)
          throw createError({
            message: error?.message,
            why: 'Failed create payout',
            fix: 'Try again',
          })
        }
      },
      {
        response: {
          200: z.any(),
          401: z.object({
            message: z.string(),
            code: z.string(),
          }),
          500: z.object({
            message: z.string(),
            code: z.string(),
          }),
        },
        body: payoutRequestSchema,
      },
    )
    .get(
      '/:requestId/verify',
      async ({ log, status, transactionRepository, params }) => {},
      {
        response: {
          200: z.any(),
          401: z.object({
            message: z.string(),
            code: z.string(),
          }),
          404: z.object({
            message: z.string(),
            code: z.string(),
          }),
          500: z.object({
            message: z.string(),
            code: z.string(),
          }),
        },
      },
    )
    .post(
      '/webhook/switch/:transactionId',
      async ({ log, status, transactionRepository, params, body }) => {
        try {
          log.set({ body, params })

          const transactionId = params.transactionId

          if ((body as { status: string })?.status === 'COMPLETED') {
            await transactionRepository.patch(
              {
                status: 'complete',
              },
              transactionId,
            )
            // TODO: Call webhook
            // FIXME: Extract webhook processing to `ProviderContext` with with the correct adapter
          }
          return status('OK', {
            message: 'Payout completed',
            code: 'OK',
          })
        } catch (error: any) {
          log.error(error)
          throw createError({
            message: error?.message,
            why: 'Failed to create payout request',
            fix: 'Try again later',
          })
        }
      },
      {
        response: {
          200: z.object({
            message: z.string(),
            code: z.string(),
          }),
          500: z.object({
            message: z.string(),
            code: z.string(),
          }),
        },
        body: z.any(),
        params: z.object({
          transactionId: z.string(),
        }),
      },
    )

  return {
    fetch: router.fetch,
    service,
		adapter,
    transactionRepo: repository,
  }
}

export { createPayout }
