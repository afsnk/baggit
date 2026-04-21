import { env } from '#/env'
import { betterFetch } from '@better-fetch/fetch'
import { createServerFn } from '@tanstack/react-start'

export const getTokenData = createServerFn()
  .inputValidator((data: 'usdc' | 'usdt') => data)
  .handler(async ({ data: asset }) => {
    console.log('Envs', { env, asset })
    const { data, error } = await betterFetch<{
      data: Array<{
        name: string
        symbol: string
        circulating_supply: number
        total_supply: number
        quote: Array<{
          symbol: string
          price: number
          volume_24h: number
          volume_change_24h: number
          percent_change_24h: number
          market_cap: number
        }>
      }>
    }>(
      `https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/latest?symbol=${asset}`,
      {
        query: JSON.stringify({
          symbol: asset,
        }),
        headers: {
          'X-CMC_PRO_API_KEY': env.CMC_PRO_API_KEY,
        },
      },
    )

    if (error) {
      console.log('Failed to get data', { error })
      throw error
    }

    console.log(`Data`, { quote: data.data[0].quote[0] })

    return data
  })
