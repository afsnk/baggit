
import type { BetterAuthOptions } from "better-auth"


import { generateId } from "@core/utils"
import { createAuthMiddleware } from "better-auth/api"

// import { IEmailProps, sendEmail } from "../Lib/email"
// import { generateAccount, getChain } from "../Lib/wallet/wallet.utils"
// import { emailQueue } from "../Workers/email.worker"
// import { renderTemplate } from "@baggit/template"

export const defaultAuthConfig: BetterAuthOptions = {
	secret: process.env.BETTER_AUTH_SECRET,
  baseURL: {
    allowedHosts: ["https://baggit.dev", "https://*.baggit.dev", "https://baggit.link", "https://*.baggit.link"],
    fallback: process.env.VITE_BETTER_AUTH_URL ?? "https://baggit.dev"
  },
  appName: "Baggit Services",
  emailAndPassword: {
    enabled: false
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/callback/:id" && ctx.query?.error) {
        console.log(`Path for social auth cancel`, { path: ctx.path, query: ctx.query, body: ctx.body, header: ctx.headers, clientURL: process.env.VITE_MERCHANT_CLIENT_URL })
        const url = new URL(`${process.env.MERCHANT_CLIENT_URL}/auth`);
        url.searchParams.set('status', 'failed')
        url.searchParams.set('message', ctx.query?.error_description || 'Authentication failed')
        console.log(`Redirect URL`, {url: url.toString()})
        return ctx.redirect(url.toString())
      }
    })
  },
  socialProviders: {
    google: {
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      enabled: true,
      redirectURI: `${process.env.VITE_BETTER_AUTH_URL}/api/auth/callback/google`
    },
    github: {
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      clientId: process.env.GITHUB_CLIENT_ID!,
      enabled: true,
      redirectURI: `${process.env.VITE_BETTER_AUTH_URL}/api/auth/callback/github`,
    }
  },
  trustedOrigins: async (request) => [
    // 'https://*.baggit.link',
    ...(process.env.TRUSTED_ORIGINS || '').split(','),
		'https://baggit.link',
    'https://*.baggit.link',
    'localhost:3000',
    'localhost:3001',
    'localhost:3011',
    'http://localhost:4322',
    request?.headers.get('origin'),
  ],
  advanced: {
    cookiePrefix: process.env.NODE_ENV === "development"? "baggit-dev-auth" : "baggit-auth",
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: process.env.NODE_ENV === "development"? ".baggit.dev" : ".baggit.link"
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
