import { env } from '#/env'
import type { APIApp } from '@baggit/api/app'
import { edenFetch } from '@elysia/eden'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

export const fetch = edenFetch<APIApp>(env.VITE_API_URL)

export const initTransaction = (pk: string) =>
  mutationOptions({
    mutationKey: ['init'],
    mutationFn: async (values: any) => {
      const { data, error } = await fetch(`/v1/transaction/init`, {
        method: 'POST',
        body: { ...values },
        headers: {
          'baggit-public-key': pk,
        },
      })

      if (error) {
        console.log(`Error`, { error })
        throw error
      }

      return data as {
        address: string
        status: string
        amount: number
        id: string
      }
    },
  })

export const confirmTransaction = (pk: string, id: string, enabled: boolean) =>
  queryOptions({
    enabled,
    queryKey: ['confirm', { id }],
    queryFn: async () => {
      console.log(`Data for confirm`, { pk, id, enabled })
      const { data, error } = await fetch(`/v1/transaction/confirm`, {
        method: 'GET',
        query: {
          id,
        },
        headers: {
          'baggit-public-key': pk,
        },
      })

      if (error) {
        console.log(`Error`, { error })
        throw new Error(error.message, { cause: error.cause })
      }

      return data as any
    },
  })
