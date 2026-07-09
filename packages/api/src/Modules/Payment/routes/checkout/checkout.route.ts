
import { createRouter } from "@/Core/Lib/create-app";
import * as schema from "./checkout.schema"
import * as handler from "./checkout.handler"


const router = createRouter({
  name: "checkout.route",
  prefix: "/checkout"
})
  .post("/", handler.createCheckoutOrder, schema.createCheckoutOrder)
  .get("/:orderId/verify", handler.verifyCheckoutStatus, schema.verifyCheckoutStatus)


export default router;
