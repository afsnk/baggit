import db from "#/db"
import { env } from "#/env"
import { createPayout } from "@baggit/core"


export const payout = createPayout(db, {
	switch: {
		apiKey: env.SWITCH_API_KEY,
		baseUrl: env.SWITCH_API_URL,
	}
})
