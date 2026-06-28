import { betterAuth, BetterAuthOptions } from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import env from "@/Core/Config/env"
import db from "@/Core/DB"
import * as schema from "@/Core/DB/schema"
import { generateId } from "../DB/utils"
import { createAuthMiddleware } from "better-auth/api"

console.log(`Verification table access inside of app process`, db.$client.protocol)

const defaultAuthConfig: BetterAuthOptions = {
  baseURL: {
    allowedHosts: ['https://auth.baggit.dev', "*.auth.baggit.link", "auth.baggit.link", "localhost:8001"],
    fallback: "https://auth.baggit.dev"
  },
  appName: "Baggit Service",
  basePath: `/api/auth`,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {...schema},
  }),
  emailAndPassword: {
    enabled: false
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/callback/:id" && ctx.query?.error) {
        console.log(`Path for social auth cancel`, { path: ctx.path, query: ctx.query, body: ctx.body, header: ctx.headers, clientURL: env.MERCHANT_CLIENT_URL })
        const url = new URL(`${env.MERCHANT_CLIENT_URL}/auth`);
        url.searchParams.set('status', 'failed')
        url.searchParams.set('message', ctx.query?.error_description || 'Authentication failed')
        console.log(`Redirect URL`, {url: url.toString()})
        return ctx.redirect(url.toString())
      }
    })
  },
  socialProviders: {
    google: {
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      clientId: env.GOOGLE_CLIENT_ID,
      enabled: true,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`
    },
    github: {
      clientSecret: env.GITHUB_CLIENT_SECRET,
      clientId: env.GITHUB_CLIENT_ID,
      enabled: true,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
    }
  },
  trustedOrigins: async (request) => [
    ...env.TRUSTED_ORIGINS.split(','),
    'https://baggit.link',
    'localhost:3000',
    'localhost:3001',
    'localhost:3011',
    request?.headers.get('origin') ?? undefined,
  ],
  advanced: {
    cookiePrefix: env.NODE_ENV === "development"? "baggit-dev-auth" : "baggit-auth",
    useSecureCookies: env.NODE_ENV !== "development",
    crossSubDomainCookies: {
      enabled: true,
      domain: ".baggit.dev"
    },
    database: {
      generateId: (options) => {
        if (options.model === "user" || options.model === "users") {
          return generateId('usr_')
        }
        return crypto.randomUUID()
      },
    }
  }
}


const defaultAuthPlugins: BetterAuthOptions['plugins'] = [
]
export const auth = betterAuth({
  ...defaultAuthConfig,
  plugins: defaultAuthPlugins,
})
