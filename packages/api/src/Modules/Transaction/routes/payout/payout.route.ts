import { createRouter } from "@/Core/Lib/create-app";
import * as handlers from "./payout.handler"
import * as schema from "./payout.schema"


const router = createRouter({
	name: "payout",
	prefix: "/payout"
})
	.post('/', handlers.createPayoutRequest, schema.createPayoutRequestSchema)
	.get('/banks', handlers.bankList, schema.bankListSchema)
	.post('/lookup', handlers.lookupRequest, schema.lookupSchema)
	.post('/webhook/switch/:transactionId', handlers.switchWebhookRequest, schema.switchWebhookSchema)
	.get('/:requestId/verify', handlers.verifyPayoutRequest, schema.verifyPayoutRequestSchema)

export default router
