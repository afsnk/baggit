import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

export const auth = betterAuth({
  // baseURL: `http://localhost:8002/auth/api`,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})
