import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { authClient } from '#/lib/auth-client'
import { z } from 'zod'
import { redirect } from '@tanstack/react-router'

export const authGuard = createServerFn()
  .validator(z.object().optional())
  .handler(async () => {
    const cookie = getRequest().headers.get('cookie') ?? ''
    const { data: session, error } = await authClient.getSession({
      fetchOptions: { headers: { cookie } },
    })

    if (error) {
      console.log(`Failed to fetch session`, { error })
    }

    if (!session) {
      throw redirect({
        href: '/auth',
        search: {},
      })
    }

    return session
  })
