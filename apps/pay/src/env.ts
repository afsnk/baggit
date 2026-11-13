import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().default('https://api.baggit.link'),
		BETTER_AUTH_SECRET: z.string().optional(),
		DATABASE_URL: z.url().transform((arg) => arg.replace(/^turso:\/\//, 'https://')),
		DATABASE_AUTH_TOKEN: z.string().optional(),
		NODE_ENV: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),
		SWITCH_API_KEY: z.string(),
		SWITCH_API_URL: z.string(),
		ZERODEV_RPC: z.string(),
		ENC_KEY: z.string(),
		FEE_COLLECTION_ADDRESS: z.string(),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: 'VITE_',

	client: {
		VITE_API_URL: z.string().url().default('https://api.baggit.link'),
		VITE_CLIENT_URL: z.string().url().default('https://pay.baggit.link'),
		VITE_BETTER_AUTH_URL: z.url().default('https://pay.baggit.dev'),
		VITE_NATS_CON_URL: z.url().default('wss://connect.ngs.global'),
    VITE_NATS_KV_KEY: z.string(),
    VITE_NATS_USER_JWT: z.string(),
    VITE_NATS_USER_NKEY: z.string(),
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
