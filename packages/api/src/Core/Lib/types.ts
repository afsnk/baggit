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
import { appMacro, AppMacroFlags, AppResolve, ResolvedOf } from "./macros";

export type AppStore = {
  requestCount: number;
}

export interface AppDecorators extends SingletonBase {
  decorator: {};
  store: AppStore;
  derive: {
    log: RequestLogger<Record<string, unknown>>;
  };
  resolve: AppResolve
}

// export interface BaseSingleton extends SingletonBase {
//   decorator: {};
//   store: AppStore;
//   derive: {
//     log: RequestLogger<Record<string, unknown>>;
//   };
// }

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
  > = InputSchema<Path>
  & AppOpenAPIRouteOptions
  & AppMacroFlags;

export type AppRouteHandler<
  R extends RouteSchema = {},
  Macros extends keyof typeof appMacro = never
> = Extract<InlineHandler<
  UnwrapRoute<R>,
  // AppDecorators & { resolve: [Macros] extends [never] ? {} : ResolvedOf<Macros> }
  {
    decorator: {}
    store: AppStore
    derive: { log: RequestLogger<Record<string, unknown>> }
    resolve: {}
  },
  {
    response: {}
    return: {}
    resolve: [Macros] extends [never] ? {} : ResolvedOf<Macros>   // ← HERE, the 3rd generic
  }
  >, Function>;

// export type AppRouteHandler<
//   R extends RouteSchema = {},
//   Macros extends keyof typeof appMacro = never
// > = (
//   ctx: Context<
//     UnwrapRoute<R>,
//     BaseSingleton & {
//       resolve: [Macros] extends [never] ? {} : ResolvedOf<Macros>
//     }
//   >
// ) => unknown | Promise<unknown>

export type AppContext<
  R extends RouteSchema = {},
  Path extends string = "",
> = Context<
  R,
  AppDecorators,
  Path
>;
