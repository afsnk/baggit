import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
		SERVER_URL: z.url().optional(),
		DATABASE_URL: z.url(),
		DATABASE_AUTH_TOKEN: z.string().optional(),
		NODE_ENV: z.string(),
		SWITCH_API_KEY: z.string(),
		SWITCH_API_URL: z.url(),
		ZERODEV_RPC: z.url(),
		ENC_KEY: z.string().min(1),
		FEE_COLLECTION_ADDRESS: z.string().startsWith('0x'),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    VITE_BETTER_AUTH_URL: z.url(),
    VITE_CLIENT_URL: z.string().default('https://merchant.baggit.dev'),
	},

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: typeof window === "undefined"? process.env : import.meta.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
