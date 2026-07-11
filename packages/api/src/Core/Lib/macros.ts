import type { Context, ElysiaCustomStatusResponse } from "elysia"
import { auth as betterAuth } from "../Config/auth"
// @ts-ignore
import type { Prettify } from "elysia/dist/types"
import { jwtVerify, createRemoteJWKSet } from 'jose'
import db from "../DB"
import env from "../Config/env"


async function validateToken(token: string) {
  try {
     const JWKS = createRemoteJWKSet(
       new URL(`${env.BETTER_AUTH_URL}/api/auth/jwks`)
     )
     const { payload } = await jwtVerify(token, JWKS, {
       issuer: env.BETTER_AUTH_URL, // Should match your JWT issuer, which is the BASE_URL
       audience: env.CHECKOUT_CLIENT_URL, // Should match your JWT audience, which is the BASE_URL by default
     })

     return payload
   } catch (error) {
     console.error('Token validation failed:', error)
     throw error
   }
}

// turn a scope pattern into a matcher: "/v1/payment/:invoiceRef" -> regex
function scopeToRegex(pattern: string): RegExp {
  const rx = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape literals
    .replace(/:[^/]+/g, "[^/]+");           // :param -> one path segment
  return new RegExp(`^${rx}$`);
}

export async function authorize(req: Request, status: any): Promise<any> {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return status(401, "Unauthorized");

  let payload;
  try {
    ({ payload } = await validateToken(token)); // checks sig + exp
  } catch {
    return status(401, `Invalid token`);
  }

  const scopes = ((payload as {scope: string[]})?.scope) ?? [];
  const path = new URL(req.url).pathname;

  const allowed = scopes.some((p) => scopeToRegex(p).test(path));
  if (!allowed) return status(401, `Not allowed to access resource`);

  return payload; // authorized — continue to handler
}


export const appMacro = {
  auth: {
    async resolve({ status, request: {headers}}: Context) {
      const session = await betterAuth.api.getSession({
        headers
      })
      if (!session) return status(401, `Unauthorized access`)
      return {
        user: session.user,
        session: session.session
      }
    }
  },
  jwt: {
    async resolve({ status, request }: Context) {
      // Validate and resolve jwt token/session
      return authorize(request, status)
    }
  },
  apiKey: {
    async resolve({status, request: {headers} }: Context) {
      // TODO: API key validation
      const publicKey = headers.get('baggit-public-key')
      const secretKey = headers.get('baggit-secret-key')

      console.log(`KEys`, {publicKey, secretKey})

      if (!publicKey && !secretKey) {
        return status(401, `No public or secret key passed`)
      }

      const result = await betterAuth.api.verifyApiKey({
        body: {
          key: publicKey || secretKey || '',
          configId: publicKey? "public" : "secret"
        }
      })

      console.log(`Key validation result`, {result})

      if (result.valid) {
        const organization = await db.query.organization.findFirst({
          where: (fields, ops) => ops.eq(fields.id, result.key?.referenceId!)
        })

        if (!organization) {
          return status(401, `Could not find organization that owns this key`)
        }

        return {
          isValid: true,
          key: result.key,
          organization,
        }
      } else {
        return status(401, result.error?.message ?? `Unauthorized API key access`)
      }
    }
  }
}
// satisfies Parameters < Elysia['macro'] > [0]

// derive the resolved union automatically from every macro that has a `resolve`
// keep only the object branch of each macro's resolve() return
type MacroResolved<M> = {
  [K in keyof M]: M[K] extends { resolve: (...a: any) => infer R }
    ? Exclude<Awaited<R>, ElysiaCustomStatusResponse<any, any, any>> extends infer RR
      ? RR extends Record<string, unknown> ? RR : {}
      : {}
    : {}
}[keyof M]

type AnyStatusResponse = ElysiaCustomStatusResponse<any, any, any>

// Extract the resolved object from ONE macro, dropping the status() error branch.
// Wrap the conditional in a tuple to STOP distribution, then Prettify.
type ResolvedOfOne<K extends keyof typeof appMacro> =
  (typeof appMacro)[K] extends { resolve: (...a: any) => infer R }
    ? [Exclude<Awaited<R>, AnyStatusResponse>] extends [infer V]
      ? V extends Record<string, unknown> ? V : {}
      : {}
    : {}

// Turn a UNION of macro keys into an INTERSECTION of their resolved objects.
// (union → intersection via contravariant inference)
type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never

export type ResolvedOf<Macros extends keyof typeof appMacro> =
  Prettify<UnionToIntersection<
    Macros extends any ? ResolvedOfOne<Macros> : never
  >>

export type AppResolve = MacroResolved<typeof appMacro>
export type AppMacroFlags = { [K in keyof typeof appMacro]?: boolean }


type T1 = (typeof appMacro)['jwt'] extends { resolve: (...a: any) => infer R } ? R : 'NO_RESOLVE'
// Expect: Promise<{ user; session } | ElysiaCustomStatusResponse<401, ...>>
// If T1 = 'NO_RESOLVE' → the `: Context` annotation broke the `resolve` shape match. ← most likely

type T2 = Awaited<T1>
type T3 = Exclude<T2, ElysiaCustomStatusResponse<any, any, any>>
