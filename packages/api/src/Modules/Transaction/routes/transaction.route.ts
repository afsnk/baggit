import { createRouter } from "@/Core/Lib/create-app";
import * as handlers from "./transaction.handler"
import * as schema from "./transaction.schema"


const router = createRouter({
  name: "transaction.route",
  prefix: "/transaction"
})
  .post("/init", handlers.init, schema.initTransactionSchema)
  .get("/confirm", handlers.confirm, schema.confirmTransactionSchema)
  .get("/", handlers.getAll, schema.getAllSchema)


export default router;
