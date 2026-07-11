import { createAuthClient } from 'better-auth/react'
import { jwtClient, emailOTPClient } from "better-auth/client/plugins"
import { env } from '#/env'

export const authClient = createAuthClient({
  baseURL: env.VITE_BETTER_AUTH_URL,
  basePath: '/api/auth',
  plugins: [
    jwtClient(),
    emailOTPClient()
  ],
  fetchOptions: {credentials: "include"}
})
