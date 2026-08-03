import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().default('https://api.baggit.link'),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: 'VITE_',

	client: {
		VITE_API_URL: z.string().url().optional().default('https://api.baggit.link'),
		VITE_BETTER_AUTH_URL: z.url().optional().default('https://auth.baggit.link'),
		VITE_NATS_CON_URL: z.url().default('wss://connect.ngs.global'),
    VITE_NATS_KV_KEY: z.string(),
    VITE_NATS_USER_JWT: z.string(),
    VITE_NATS_USER_NKEY: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: import.meta.env,

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
