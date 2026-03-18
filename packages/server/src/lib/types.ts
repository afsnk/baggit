import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { PinoLogger } from "hono-pino";
import type { z } from "zod";

import type { cleanedTransaction, insertTransactions } from "@/db/schema";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
};

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;

// DB types
export type Transaction = z.infer<typeof cleanedTransaction>;
export type InsertTransaction = z.infer<typeof insertTransactions>;
