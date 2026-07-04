import { env } from '#/env'
import { createAuthClient } from 'better-auth/react'
import { apiKeyClient } from '@better-auth/api-key/client'

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL,
  basePath: '/api/auth',
  plugins: [apiKeyClient()],
})
