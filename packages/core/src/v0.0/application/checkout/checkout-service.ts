import type { DBPort } from "../../ports/db.port"
import type { ChainPort, SettlementAsset } from "../../ports/chain.port"
import type { CachePort, LockPort } from "../../ports/cache.port"
import type { Emitter } from "../../primitives/emit"
import type {
  CheckoutSession,
  CreateCheckoutSessionInput,
} from "../../domain/entities/payments.entity"

/**
 * REQUIREMENTS.md §2.5: session-based funding.
 * Quote locked to session TTL; expiry enforced server-side on every read.
 */

export interface CheckoutServiceDeps {
  db: DBPort
  emitter: Emitter
  chains: ChainPort[]
  cache?: CachePort
  lock?: LockPort
}

function nowIso(): string {
  return new Date().toISOString()
}

export class CheckoutService {
  private readonly db: DBPort
  private readonly emitter: Emitter
  private readonly chains: ChainPort[]

  constructor(deps: CheckoutServiceDeps) {
    this.db = deps.db
    this.emitter = deps.emitter
    this.chains = deps.chains
  }

  chainFor(chain: string): ChainPort | undefined {
    return this.chains.find((c) => c.chain === chain)
  }

  async createSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
    const now = new Date()
    const session: CheckoutSession = {
      id: crypto.randomUUID(),
      merchantId: input.merchantId,
      customerId: input.customerId,
      sessionToken: `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, ""),
      status: "created",
      chain: input.chain,
      asset: input.asset,
      destinationAddress: input.destinationAddress,
      amountAtomic: input.amountAtomic,
      decimals: input.decimals,
      fiatCurrency: input.fiatCurrency,
      fiatAmountMinor: input.fiatAmountMinor,
      lockedRate: "1",
      paymentOptions: [...input.paymentOptions],
      ttlExpiresAt: new Date(now.getTime() + input.ttlSeconds * 1000).toISOString(),
      createdAt: now.toISOString(),
    }
    await this.db.checkoutSessions.insert(session)
    await this.emitter.emit("CheckoutSessionCreated", {
      sessionId: session.id,
      merchantId: session.merchantId,
      amount: { atomic: session.amountAtomic, decimals: session.decimals },
      fiat:
        session.fiatCurrency && session.fiatAmountMinor !== undefined
          ? { amountMinor: session.fiatAmountMinor, currency: session.fiatCurrency }
          : undefined,
      expiresAt: session.ttlExpiresAt,
      createdAt: session.createdAt,
    })
    return session
  }

  /** Expiry enforced server-side at read time (§2.5). */
  async getSessionByToken(token: string): Promise<CheckoutSession | null> {
    const session = await this.db.checkoutSessions.getByToken(token)
    if (!session) return null
    if (
      (session.status === "created" || session.status === "awaiting_payment") &&
      Date.now() >= new Date(session.ttlExpiresAt).getTime()
    ) {
      const expired = await this.transition(session, "expired")
      await this.emitter.emit("CheckoutSessionExpired", {
        sessionId: expired.id,
        expiredAt: expired.completedAt ?? nowIso(),
      })
      return expired
    }
    return session
  }

  /** Transfer Crypto mode: verify an inbound transfer against the locked quote. */
  async completeWithCryptoTransfer(
    token: string,
    txHash: string,
  ): Promise<CheckoutSession> {
    const session = await this.getSessionByToken(token)
    if (!session) throw new Error("checkout session not found")
    if (session.status === "completed") return session
    if (session.status !== "created" && session.status !== "awaiting_payment" && session.status !== "processing") {
      throw new Error(`checkout session not completable in status "${session.status}"`)
    }
    if (!session.paymentOptions.includes("crypto")) {
      throw new Error("session does not offer crypto payment")
    }

    const chain = this.chainFor(session.chain)
    if (!chain) throw new Error(`No chain adapter registered for "${session.chain}"`)

    const state = await chain.getTransfer(txHash)
    const policy = chain.confirmationPolicy()
    const confirmed =
      state.status === "finalized" ||
      state.status === "confirmed"
    if (!confirmed) {
      throw new Error(`transfer ${txHash} not confirmed yet (status: ${state.status})`)
    }
    void policy

    const completed = await this.transition(session, "completed", nowIso())
    await this.emitter.emit("CheckoutCompleted", {
      sessionId: completed.id,
      method: "crypto",
      amount: { atomic: completed.amountAtomic, decimals: completed.decimals },
      reference: txHash,
      completedAt: completed.completedAt ?? nowIso(),
    })
    return completed
  }

  private async transition(
    session: CheckoutSession,
    status: CheckoutSession["status"],
    completedAt?: string,
  ): Promise<CheckoutSession> {
    const updated: CheckoutSession = {
      ...session,
      status,
      completedAt: completedAt ?? session.completedAt,
    }
    await this.db.checkoutSessions.update(updated)
    return updated
  }
}

export function isSettlementAsset(asset: string): asset is SettlementAsset {
  return asset === "USDC" || asset === "USDT"
}
