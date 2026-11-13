import db from '#/db'
import { env } from '#/env'
import { createCheckout } from '@baggit/core'

export const checkout = createCheckout(
  db,
  {
    switch: {
      apiKey: env.SWITCH_API_KEY,
      baseUrl: env.SWITCH_API_URL,
      callbackBaseUrl: `${env.VITE_BETTER_AUTH_URL}/api/checkout/webhook/switch`,
      feeRate: 0.1,
      feeAddress: env.FEE_COLLECTION_ADDRESS as `0x${string}`,
    },
  },
  {
    environment: env.NODE_ENV,
    encryptionKey: env.ENC_KEY,
    zeroDevRPC: env.ZERODEV_RPC,
  },
)
