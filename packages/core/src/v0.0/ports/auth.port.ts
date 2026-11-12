/**
 * REQUIREMENTS.md §2.1: identity delegation.
 * Core consumes identity only through this port; better-auth wiring stays at
 * the application layer.
 */
export type ActorKind = "merchant" | "user" | "admin"

export interface Actor {
  actorId: string
  kind: ActorKind
  scopes: string[]
  /** Merchant API-key environment when kind === "merchant". */
  environment?: "test" | "live"
}

export interface AuthContext {
  apiKey?: string
  sessionToken?: string
  headers?: Record<string, string>
}

export interface AuthPort {
  resolveActor(context: AuthContext): Promise<Actor | null>
}
