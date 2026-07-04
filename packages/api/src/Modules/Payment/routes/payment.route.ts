import { createRouter } from "@/Core/Lib/create-app";
import * as handlers from "./payment.handler";
import * as schema from "./payment.schema";



const router = createRouter({
  name: "payment.routes",
  prefix: "/payment"
})
  .post("/create", handlers.createPayment, schema.createPaymentRoute)
  .get("/:id", handlers.getPayment, schema.getPaymentRoute)


export default router;
