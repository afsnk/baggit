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
    origin: "*",
    methods: "*",
    credentials: true,
    allowedHeaders: "*"
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
