import { payout } from '#/lib/payout'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const getAll = createServerFn({ method: 'GET' })
  .validator(z.object({ orgId: z.string() }))
  .handler(async ({ data }) => {
    try {
      return await payout.transactionRepo.getAll(data.orgId)
    } catch (error) {
      console.error('[server-fn] Failed to load transactions', error)
      throw new Error('Could not load transactions. Please try again.')
    }
  })
