import { env } from '#/env'
import { createAuthClient } from 'better-auth/react'
import { apiKeyClient } from '@better-auth/api-key/client'
import { organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL,
  basePath: '/api/auth',
  plugins: [apiKeyClient(), organizationClient()],
  fetchOptions: {credentials: "include"}
})
