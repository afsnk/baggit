import { betterAuth, BetterAuthOptions } from "better-auth"
import {drizzleAdapter} from "better-auth/adapters/drizzle"
import env from "@/Core/Config/env"
import db from "@/Core/DB"
import * as schema from "@/Core/DB/schema"
import { generateId } from "../DB/utils"
import { createAuthMiddleware } from "better-auth/api"
import { apiKey } from "@better-auth/api-key"
import { organization, anonymous } from "better-auth/plugins"

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
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Get the first organization that the user is a member of
          const member = await db.query.member.findFirst({
            where: (fields, ops) => ops.eq(fields.userId, session.userId),
          })

          console.log(`Members`, {member})

          if (!member) {
            return {data: {...session}}
          }

          return {
            data: {
              ...session,
              activeOrganizationId: member?.organizationId
            }
          }
        }
      }
    }
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
    'http://localhost:4322',
    request?.headers.get('origin') ?? undefined,
  ],
  advanced: {
    cookiePrefix: env.NODE_ENV === "development"? "baggit-dev-auth" : "baggit-auth",
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: env.NODE_ENV === "development"? ".baggit.dev" : ".baggit.link"
    },
    database: {
      generateId: (options) => {
        if (options.model === "user" || options.model === "users") {
          return generateId('usr')
        } else if (options.model === "organization" || options.model === "organizations") {
          return generateId('org')
        }
        return crypto.randomUUID()
      },
    }
  }
}

const secondaryStorage: BetterAuthOptions['secondaryStorage'] = {
  get: async (key) => {  },
  set: async (key, value, ttl) => { },
  delete: async (key) => { }
}

export const auth = betterAuth({
  ...defaultAuthConfig,
  // secondaryStorage,
  plugins: [
    apiKey([
      {
        configId: "public",
        defaultPrefix: "pk_",
        storage: "database", // Update to use secondary-storage with nats jetstream cache
        references: "organization",
        rateLimit: {
          enabled: true,
          maxRequests: 100,
          timeWindow: 1000 * 60 * 60, // 1 hour
        },
      },
      {
        configId: "secret",
        defaultPrefix: "sk_",
        enableMetadata: true,
        storage: "database", // Update to use secondary-storage with nats jetstream cache
        references: "organization",
        rateLimit: {
          enabled: true,
          maxRequests: 1000,
          timeWindow: 1000 * 60 * 60, // 1 hour
        },
      },
    ]),
    organization({
      allowUserToCreateOrganization(user) {
        return user.emailVerified
      },
      organizationHooks: {
        async afterCreateOrganization(data) {
          // TODO: Initialise organization resources after creation
        },
      }
    }),
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        // Hanle linking from anonymous to authed user
        console.log(`Anonymous and New user`, {anonymousUser, newUser})
      }
    })
  ],
})
