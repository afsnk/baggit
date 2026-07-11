import createApp from "@/Core/Lib/create-app";
import { cors } from "@elysia/cors"
import env from "./Core/Config/env";
import paymentRoute from "@/Modules/Payment/routes/payment/payment.route";
import transactionRoute from "@/Modules/Transaction/routes/transaction.route";
import checkoutRoute from "@/Modules/Payment/routes/checkout/checkout.route";
import { appMacro } from "./Core/Lib/macros";


const apiApp = createApp({
  name: "api",
  prefix: "/v1"
}).use(
  cors({
    origin: [
      "*",
      ...env.TRUSTED_ORIGINS.split(','),
      'http://localhost:3011',
      'http://localhost:3000',
      'https://widget.baggit.link',
      'https://baggit.link',
      'localhost:3000',
      'localhost:3001',
      'localhost:3011',
      'http://localhost:4322'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['*', 'Content-Type', 'Authorization', 'baggit-api-key', 'baggit-public-key', 'baggit-secret-key']
  })
)
  .macro(appMacro)
  .use(paymentRoute)
  .use(transactionRoute)
  .use(checkoutRoute)
  .get(`/user`, ({ user }) => user, { auth: true }) // TODO: remove when sure everything works
  .listen({port: 8001, hostname: "::"});

console.log(`API server running at [${apiApp.server?.hostname}:${apiApp.server?.port}]`)


export default apiApp;
