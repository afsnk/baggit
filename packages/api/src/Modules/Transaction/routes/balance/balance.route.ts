import { createRouter } from "@/Core/Lib/create-app";
import * as handler from "./balance.handler";
import * as schema from "./balance.schema";



const router = createRouter({
  name: "balance.route",
  prefix: "/balance"
})
  .get("/", handler.getBalances, schema.getBalanceSchema)


export default router;
