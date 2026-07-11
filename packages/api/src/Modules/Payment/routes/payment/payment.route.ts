import { createRouter } from "@/Core/Lib/create-app";
import * as handlers from "./payment.handler";
import * as schema from "./payment.schema";



const router = createRouter({
  name: "payment.routes",
  prefix: "/payment"
})
  .post("/:id", handlers.updateMethod, schema.updateMethodRoute)
  .get("/:invoiceRef", handlers.getPayment, schema.getPaymentRoute)


export default router;
