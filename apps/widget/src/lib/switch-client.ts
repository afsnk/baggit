import { env } from '#/env'
import { createServerFn } from '@tanstack/react-start'
import { betterFetch } from '@better-fetch/fetch'
import { z } from 'zod'

const SWITCH_URL = `https://api.onswitch.xyz`

export const coverage = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ direction: z.enum(['OFFRAMP', 'ONRAMP']) }))
  .handler(async ({ data: { direction } }) => {
    console.log(`⏳ Fetching coverage for ${direction}...`)
    const { data: response, error } = await betterFetch<{
      success: boolean
      message: string
      timestamp: string | number
      data: Array<Record<string, any>>
    }>(`${SWITCH_URL}/coverage?direction=${direction}`, {
      headers: {
        'x-service-key': env.SWITCH_SERVICE_KEY,
      },
    })

    if (error) {
      console.log(`Failed to get coverage`, { error })
      throw error
    }

    return response
  })

export const assets = createServerFn({ method: 'GET' }).handler(async () => {
  console.log(`⏳ Getting assets...`)
  const { data: response, error } = await betterFetch<{
    success: boolean
    status?: number
    message: string
    timestamp: string | number
    data: Array<Record<string, any>>
  }>(`${SWITCH_URL}/asset`, {
    headers: {
      'x-service-key': env.SWITCH_SERVICE_KEY,
    },
  })

  if (error) {
    console.log(`Failed to get assets`, { error })
    throw error
  }

  return response
})
