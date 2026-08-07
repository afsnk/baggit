import { env } from '#/env'
import type { APIApp } from '@baggit/api/app'
import { edenFetch } from '@elysia/eden'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'

export const fetch = edenFetch<APIApp>(env.VITE_API_URL, {
  credentials: 'include',
})

export const lookupBank = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      bankCode: z.string(),
      accountNumber: z.string(),
    }),
  )
  .handler(async ({ data }) => {
		try {
			const headers = getRequestHeaders()
			const cookie = headers.get('Cookie')
      const { data: lookupResult, error } = await fetch(`/v1/payout/lookup`, {
        method: 'POST',
        // @ts-expect-error 'Failed to pass correct body'
        body: {
          ...data,
        },
        headers: {
					'Content-type': 'application/json',
					'Cookie': cookie || ''
				},
        credentials: 'include',
      })

      if (error) {
        throw error
      }

      return lookupResult as {
        accountNumber: string
        accountName: string
        bankCode: string
      }
    } catch (error: any) {
      console.log(`Failed to get account name`, { error })
      throw error
    }
  })


export const getBanks = createServerFn({ method: "GET" })
	.handler(async () => {
		try {
			const headers = getRequestHeaders()
			const cookie = headers.get('Cookie')
			const { data: banks, error } = await fetch(`/v1/payout/banks`, {
        method: 'GET',
        headers: {
					'Content-type': 'application/json',
          'Cookie': cookie || ''
        },
        credentials: 'include',
      })

      if (error) {
        throw error
      }

      return banks
		}
		catch (error: any) {
			console.log(`Failed to get banks`, { error })
      throw error
		}
	})


export const createPayout = createServerFn({ method: "POST" })
	.validator(z.object({
		accountNumber: z.string(),
		accountName: z.string(),
		bankCode: z.string(),
		amount: z.number(),
		reference: z.string()
	}))
	.handler(async ({ data }) => {
		try {
			const headers = getRequestHeaders()
			const cookie = headers.get('Cookie')
			const { data: banks, error } = await fetch(`/v1/payout`, {
        method: 'POST',
        headers: {
					'Content-type': 'application/json',
          'Cookie': cookie || ''
        },
				credentials: 'include',
				body: {
					...data
				} as any
      })

			if (error) {
				console.log(`Failed to create payout`, {error})
        throw error
      }

      return banks
		}
		catch (error: any) {
			console.log(`Failed to create payout`, { error })
      throw error
		}
	})
