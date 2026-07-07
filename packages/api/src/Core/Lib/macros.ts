import type { Context, ElysiaCustomStatusResponse } from "elysia"
import { auth as betterAuth } from "../Config/auth"
import { AppRouteHandler } from "./types"
// @ts-ignore
import type { Prettify } from "elysia/dist/types"
import { CreatePaymentRoute } from "@/Modules/Payment/routes/payment.schema"
import db from "../DB"



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


type T1 = (typeof appMacro)['auth'] extends { resolve: (...a: any) => infer R } ? R : 'NO_RESOLVE'
// Expect: Promise<{ user; session } | ElysiaCustomStatusResponse<401, ...>>
// If T1 = 'NO_RESOLVE' → the `: Context` annotation broke the `resolve` shape match. ← most likely

type T2 = Awaited<T1>
type T3 = Exclude<T2, ElysiaCustomStatusResponse<any, any, any>>
// Expect T3 = { user; session }. If T3 = never or unknown → exclusion is over/under-matching.
type S1 = Awaited<T1>                                             // union: {user,session} | ElysiaCustomStatusResponse<401,...>
type S2 = Exclude<S1, ElysiaCustomStatusResponse<any, any, any>>  // should be { user, session }
type S3 = ResolvedOfOne<'apiKey'>                                   // should be { user, session }
type S4 = ResolvedOf<'auth'>                                      // should be { user, session }
type S5 = AppRouteHandler<CreatePaymentRoute, 'auth'>             // hover the ctx param
