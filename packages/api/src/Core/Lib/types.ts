import type Elysia from "elysia";
import type {
  BaseMacro,
  Context,
  DocumentDecoration,
  InlineHandler,
  InputSchema,
  RouteSchema,
  UnwrapRoute,
  SingletonBase,
} from "elysia";
import { RequestLogger } from "evlog";
import type { z, ZodType } from "zod";

// Replace these with imports from your Drizzle/Zod schema module when moved
// into the server package.
declare const cleanedTransaction: z.ZodTypeAny;
declare const insertTransactions: z.ZodTypeAny;

export type AppStore = {
  requestCount: number;
}

export interface AppDecorators extends SingletonBase {
  decorator: {};
  store: AppStore;
  derive: {
    log: RequestLogger<Record<string, unknown>>;
  };
  resolve: {
    // startedAt: number;
  };
}

// Elysia instance typed with the app-wide decorators, store, derive, resolve,
// and route schema accumulation.
export type AppElysia<
  BasePath extends string = "",
  > = Elysia<BasePath, AppDecorators>;

export type AppOpenAPIDetail = DocumentDecoration & {
  hide?: boolean;
};

export type AppOpenAPIRouteOptions = {
  detail?: AppOpenAPIDetail;
  tags?: AppOpenAPIDetail["tags"];
};

export type AppErrors = Record<string, Error>;

export type AppMacros = Record<never, never> & BaseMacro;

export type AppRouteSchema<
  Path extends string = "",
> = InputSchema<Path> & AppOpenAPIRouteOptions;

export type AppRouteHandler<
  R extends RouteSchema = {}
> = InlineHandler<
  UnwrapRoute<R>,
  AppDecorators
>;

export type AppContext<
  R extends RouteSchema = {},
  Path extends string = "",
> = Context<
  R,
  AppDecorators,
  Path
>;
