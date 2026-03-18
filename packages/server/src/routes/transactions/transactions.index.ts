import { createRouter } from "@/lib/create-app";

import * as handlers from "./transactions.handlers";
import * as routes from "./transactions.routes";

const router = createRouter()
  .openapi(routes.init, handlers.init)
  .openapi(routes.confirm, handlers.confirm)
  .openapi(routes.get, handlers.get);

export default router;
