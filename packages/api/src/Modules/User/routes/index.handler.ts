import type { AppRouteHandler } from "@/Core/Lib/types";

import type { IndexRouteSchema } from "./index.schema";

export const indexHandler: AppRouteHandler<IndexRouteSchema> = ({
  log,
  status,
  set
}) => {
  log.info("index route handled");

  return status(200, {
    message: "Something cool returned",
  })
};
