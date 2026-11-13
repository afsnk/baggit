import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from "better-auth/client/plugins"
import { apiKeyClient } from '@better-auth/api-key/client'
import { env } from '#/env'

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL,
  basePath: '/api/auth',
  plugins: [
		emailOTPClient(),
    apiKeyClient(),
  ],
  fetchOptions: {credentials: "include"}
})
