import { payout } from '#/lib/payout'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const getAll = createServerFn({ method: 'GET' })
  .validator(z.object({ orgId: z.string() }))
  .handler(async ({ data }) => {
    return payout.transactionRepo.getAll(data.orgId)
  })
