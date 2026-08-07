import createApp from "@/Core/Lib/create-app";
import { cors } from "@elysia/cors"
import env from "./Core/Config/env";
import paymentRoute from "@/Modules/Payment/routes/payment/payment.route";
import transactionRoute from "@/Modules/Transaction/routes/transaction.route";
import checkoutRoute from "@/Modules/Payment/routes/checkout/checkout.route";
import balanceRoute from "@/Modules/Transaction/routes/balance/balance.route";
import payoutRoute from "@/Modules/Transaction/routes/payout/payout.route";
import { appMacro } from "./Core/Lib/macros";
import openapi from "@elysia/openapi";


const apiApp = createApp({
  name: "api",
  prefix: "/v1"
}).use(
  cors({
    origin: ({referrer, headers}) => true ||  [referrer, headers.get('origin'), ...env.TRUSTED_ORIGINS.split(',')],
    methods: ["POST", "OPTIONS", "POST", "HEAD", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-type", "Authorization", "Baggit-Public-Key", "Baggit-Secret-Key"]
  })
)
	.macro(appMacro)
	.use(
	  openapi({
			path: "/reference",
	    // Zod v3 has no native JSON Schema export; convert for OpenAPI.
	    // mapJsonSchema: { zod: zodToJsonSchema },
	    documentation: {
				info: {
	        title: "Baggit service API",
	        version: "0.1.0",
	        description:
						"The best web3 DX, on/off-ramp, payment, onboarding, managed wallets, KYC infra all in one ready for your next big idea.",
				}
	    }
	  }),
  )
  .use(paymentRoute)
  .use(transactionRoute)
  .use(checkoutRoute)
	.use(balanceRoute)
  .use(payoutRoute)
	.get(`/user`, ({ user }) => user, { auth: true, detail: {hide: true} }) // TODO: remove when sure everything works
  .listen({port: 8001, hostname: "::"});

console.log(`API server running at [${apiApp.server?.hostname}:${apiApp.server?.port}]`)


export default apiApp;
