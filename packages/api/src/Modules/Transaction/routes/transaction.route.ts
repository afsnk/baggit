import { createRouter } from "@/Core/Lib/create-app";
import * as handlers from "./transaction.handler"
import * as schema from "./transaction.schema"


const router = createRouter({
  name: "transaction.route",
  prefix: "/transaction"
})
  .post("/init", handlers.init, schema.initTransactionSchema)
  .post("/confirm/:network", handlers.confirm, schema.confirmTransactionSchema)
  .post("/webhook/switch/:paymentId", handlers.switchWebhook, schema.switchSchema)
  .get("/all", handlers.getAll, schema.getAllSchema)


export default router;
