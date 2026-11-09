import { authClient } from '#/lib/auth-client'
import { payout } from '#/lib/payout'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import z from 'zod'

export const getAll = createServerFn({ method: 'GET' })
  .validator(z.object({ orgId: z.string().optional() }))
  .handler(async ({ data }) => {
    const cookie = getRequest().headers.get('cookie') ?? ''
    const { data: session, error } = await authClient.getSession({
      fetchOptions: { headers: { cookie } },
    })

    if (error) {
      console.log('Failed to get user session', { error })
      throw error
    }

    if (!session?.session.activeOrganizationId || !data.orgId)
      throw new Error('No active organization selected/found!')

    return payout.transactionRepo.getAll(
      session?.session.activeOrganizationId || data.orgId,
    )
  })
