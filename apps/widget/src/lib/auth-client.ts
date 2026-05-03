import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  basePath: '/auth/api',
  baseURL: `http://localhost:8002`,
  fetchOptions: {
    credentials: 'include',
  },
})
