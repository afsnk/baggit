import { t } from "elysia";

import type { AppRouteSchema } from "@/Core/Lib/types";

export const indexResponseSchema = t.Object({
  message: t.String(),
});

export const indexRouteSchema = {
  response: {
    200: indexResponseSchema
  },
  detail: {
    tags: ["Index"],
    summary: "Tasks API index",
    description: "Returns the base API message.",
    operationId: 'getIndex'
  },
} satisfies AppRouteSchema;

export type IndexRouteSchema = typeof indexRouteSchema;
