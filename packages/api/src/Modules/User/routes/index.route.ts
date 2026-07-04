import { createRouter } from "@/Core/Lib/create-app";

import { indexHandler } from "./index.handler";
import { indexRouteSchema } from "./index.schema";

const router = createRouter({
  name: "routes.index",
}).post("/", indexHandler, indexRouteSchema);

export default router;
