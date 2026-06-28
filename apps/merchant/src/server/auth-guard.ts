import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { authClient } from '#/lib/auth-client'
import { z } from 'zod'
import { redirect } from '@tanstack/react-router'

export const authGuard = createServerFn()
  .validator(z.object().optional())
  .handler(async () => {
    const request = getRequest()
    console.log(`Headers`, { heeaders: request.headers })
    const { data: session, error } = await authClient.getSession({
      fetchOptions: { headers: request.headers },
    })

    if (error) {
      console.log(`Failed to fetch session`, { error })
    }

    console.log(`Session in server function`, session)
    if (!session) {
      throw redirect({
        href: '/auth',
        search: {},
      })
    }

    return session
  })
