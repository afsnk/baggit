import { Elysia } from "elysia";
// import env from "../Config/env";

import { openapi } from "@elysia/openapi";
import { initLogger, parseError } from "evlog";
import { evlog } from "evlog/elysia"
// import { createAxiomDrain } from 'evlog/axiom'
import { createUserAgentEnricher } from 'evlog/enrichers'

import type { AppElysia } from "./types";

type ElysiaAppConfig = ConstructorParameters<typeof Elysia>[0]

export function createRouter<
  BasePath extends string = "",
>(config?: ElysiaAppConfig): AppElysia<string> {
  initLogger({
    env: {service: config?.name ?? "auth", version: "0.0.1"}
  });

  const userAgent = createUserAgentEnricher()

  const app = new Elysia({
    strictPath: false,
    ...config,
  })
  // .derive(({ request }) => ({
  //   requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
  // }))
    .use(evlog({
      // drain: createAxiomDrain(),
      enrich: (ctx) => {
        userAgent(ctx)
        ctx.event.region = process.env.FLY_REGION
      },
      // include: ['/api/**'],
      // exclude: ['/_internal/**', '/health'],
      // routes: {
      //   '/api/auth/**': { service: 'auth-service' },
      //   '/api/payment/**': { service: 'payment-service' },
      // },
    }))
    .use(openapi({
      documentation: {
        info: {
          title: "Baggit API",
          version: "1.0.0",
        },
        tags: [
          { name: "Index", description: "Base API endpoints" },
          { name: "Health", description: "Service health endpoints" },
        ],
      },
    }))
    .state("requestCount", 0)
    // .resolve(() => ({
    //   startedAt: Date.now(),
    // }))
    ;

  return app;
}



/**
 * Create default elysia app with default context and configuration loaded in
 */
export default function createApp(config?: ElysiaAppConfig) {
  return createRouter({ name: config?.name })
    .onBeforeHandle(({ store, log, request }) => {
      store.requestCount += 1;
      log.info(`Before handle:`, {
        method: request.method,
        url: request.url,
      });
    })
    .get(
      "/health",
      ({  }) => ({
        status: "ok",
        uptime: process.uptime(),
        timestamp: Date.now(),
        // handledInMs: Date.now() - startedAt,
      }),
      {
        detail: {
          hide: true,
          tags: ["Health"],
          summary: "Health check",
        },
      },
    )
    .onError(({ code, error, set, status }) => {
      const parsed = parseError(error)
      set.status = parsed.status ?? status
      return {
        message: parsed.message,
        why: parsed.why,
        fix: parsed.fix,
        link: parsed.link,
        code,
      }
    });
}

export function createTestApp(router: AppElysia) {
  return createApp().use(router);
}
