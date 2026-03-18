import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { cleanedTransaction, insertTransactions } from "@/db/schema";

const tags = ["Payment"];
export const init = createRoute({
  tags,
  hide: true,
  path: "/payment/init",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertTransactions,
      "The transaction to create",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        address: z.string().startsWith("0x"),
        status: z.string().nullable(),
        amount: z.number(),
      }),
      "The created transaction",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertTransactions),
      "The validation error(s)",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.any(),
      "Internal server error",
    ),
  },
});

export const confirm = createRoute({
  tags,
  hide: true,
  method: "get",
  path: "/payment/confirm/:reference",
  request: {
    params: z.object({
      reference: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.any(),
      "The transaction",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(z.any(), "Bad request"),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.any(),
      "Internal server error",
    ),
  },
});

export const get = createRoute({
  tags,
  hide: true,
  method: "get",
  path: "/payment/transactions",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(cleanedTransaction),
      "Get transactions",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(z.any(), "Bad request"),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.any(),
      "Internal server error",
    ),
  },
});

export type PaymentInitRoute = typeof init;
export type ConfirmRoute = typeof confirm;
export type GetTransactionRoute = typeof get;
