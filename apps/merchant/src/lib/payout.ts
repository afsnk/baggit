import db from "#/db"
import { env } from "#/env"
import { createPayout } from "@baggit/core"


export const payout = createPayout(db, {
	switch: {
		apiKey: env.SWITCH_API_KEY,
		baseUrl: env.SWITCH_API_URL,
		callbackBaseUrl: `${env.VITE_BETTER_AUTH_URL}/api/payout/webhook/switch`,
		feeRate: 0.5,
		feeAddress: env.FEE_COLLECTION_ADDRESS as `0x${string}`
	}
})
