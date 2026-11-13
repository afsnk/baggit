import { tanstackStartCookies } from "better-auth/tanstack-start";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "#/db";
// import { env } from "#/env";
import { createAuth } from "@baggit/core"



export const auth = createAuth(db, {
	// Override any `BetterAuthOptions` specific to the pay client
	basePath: `/api/auth`,
	plugins: [tanstackStartCookies()],
})
