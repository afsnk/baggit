import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { authClient } from '#/lib/auth-client'
import { z } from 'zod'
import { redirect } from '@tanstack/react-router'
import { auth } from '#/lib/auth'

export const authGuard = createServerFn()
  .validator(z.object().optional())
	.handler(async () => {
		try {
	    // const cookie = getRequest().headers.get('cookie') ?? ''
	    const headers = getRequest().headers
	    const data = await auth.api.getSession({
	      headers,
	    })

	    if (!data) {
	      console.log(`No session data`)
	      throw redirect({
	        href: '/auth',
	        search: {},
	      })
	    }

	    if (!data.session) {
	      throw redirect({
	        href: '/auth',
	        search: {},
	      })
	    }

	    return data.session
		}
		catch (error: any) {
			console.log(`Failed to fetch session`, JSON.stringify({ error }, null, 2))
			throw error;
		}
  })
