import type { DBPort } from "../../ports/db.port"
import type { ChainPort, ChainId, SettlementAsset } from "../../ports/chain.port"
import { ASSET_DECIMALS } from "../../ports/chain.port"
import type { CustodyPort } from "../../ports/custody.port"
import type { CompliancePort, ScreeningInput } from "../../ports/compliance.port"
import type { FiatRailPort } from "../../ports/fiat-rail.port"
import type { CachePort, LockPort } from "../../ports/cache.port"
import type { Emitter } from "../../primitives/emit"
import { withIdempotency } from "../../primitives/idempotency"
import { compareCrypto } from "../../domain/value-objects/money"
import type {
  AddressRecord,
  RequestWithdrawalInput,
  WithdrawalRecord,
} from "../../domain/entities/payments.entity"
import { SmartRouter } from "../routing/smart-router"

/**
 * REQUIREMENTS.md §2.4: app debit → fiat payout or on-chain transfer.
 * Hold semantics live with the host ledger; this service enforces the
 * pre-flight balance check, destination allowlist + cooling period,
 * velocity limits, and the screening gate before any payout/broadcast.
 */

/** Default cooling period before a newly allowlisted address is usable. */
export const COOLING_MS = 86_400_000

export interface WithdrawalServiceOptions {
  velocityLimit: number
  velocityWindowMs: number
  coolingMs: number
}

export interface WithdrawalServiceDeps {
  db: DBPort
  emitter: Emitter
  chains: ChainPort[]
  custody: CustodyPort
  compliance: CompliancePort
  fiatRails: FiatRailPort[]
  cache: CachePort
  lock: LockPort
  options: WithdrawalServiceOptions
}

function nowIso(): string {
  return new Date().toISOString()
}

export class WithdrawalService {
  private readonly db: DBPort
  private readonly emitter: Emitter
  private readonly chains: ChainPort[]
  private readonly custody: CustodyPort
  private readonly compliance: CompliancePort
  private readonly fiatRails: FiatRailPort[]
  private readonly cache: CachePort
  private readonly lock: LockPort
  private readonly options: WithdrawalServiceOptions

  constructor(deps: WithdrawalServiceDeps) {
    this.db = deps.db
    this.emitter = deps.emitter
    this.chains = deps.chains
    this.custody = deps.custody
    this.compliance = deps.compliance
    this.fiatRails = deps.fiatRails
    this.cache = deps.cache
    this.lock = deps.lock
    this.options = deps.options
  }

  chainFor(chain: string): ChainPort {
    const port = this.chains.find((c) => c.chain === chain)
    if (!port) throw new Error(`No chain adapter registered for "${chain}"`)
    return port
  }

  /**
   * Whole flow wrapped in lock-first idempotency (§6c): concurrent duplicate
   * requests execute exactly once; losers receive the winner's record.
   */
  async requestWithdrawal(
    input: RequestWithdrawalInput,
    _actor?: { merchantId?: string },
  ): Promise<WithdrawalRecord | null> {
    return withIdempotency(
      `wd:${input.idempotencyKey}`,
      () => this.runWithdrawal(input),
      { cache: this.cache, lock: this.lock },
    )
  }

  private async runWithdrawal(input: RequestWithdrawalInput): Promise<WithdrawalRecord | null> {
    const source = await this.db.addresses.get(input.sourceAddressId)
    if (!source || source.customerId !== input.customerId) {
      throw new Error(`Source address ${input.sourceAddressId} not owned by customer`)
    }
    const chain = this.chainFor(source.chain)

    const existing = await this.db.withdrawals.getByIdempotencyKey(input.idempotencyKey)
    if (existing) return existing

    const asset: SettlementAsset = "USDC"
    if (!chain.validateAddress(input.destinationAddress ?? "")) {
      return this.createFailed(input, source, asset, "invalid destination address")
    }

    // --- Pre-flight balance check ---
    const decimals = input.decimals || ASSET_DECIMALS[asset]
    const amount = { atomic: input.amountAtomic, decimals }
    const balance = await chain.getBalance(source.address, asset)
    if (compareCrypto({ atomic: balance.atomic, decimals: balance.decimals }, amount) < 0) {
      return this.createFailed(input, source, asset, "insufficient balance")
    }

    // --- Destination allowlist + cooling period (crypto method only) ---
    if (input.method === "crypto") {
      const destination = input.destinationAddress
      const allowed = destination
        ? await this.isDestinationAllowed(input.customerId, destination)
        : { ok: false, reason: "destination address required" }
      if (!allowed.ok) {
        return this.createFailed(input, source, asset, allowed.reason ?? "destination not allowed")
      }
    }

    // --- Velocity limits ---
    const windowStart = new Date(Date.now() - this.options.velocityWindowMs).toISOString()
    const recentCount = await this.db.withdrawals.countRecentByCustomer(input.customerId, windowStart)
    if (recentCount >= this.options.velocityLimit) {
      return this.createFailed(input, source, asset, "velocity limit exceeded")
    }

    // --- Persist initiated record ---
    let withdrawal: WithdrawalRecord = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      sourceAddressId: input.sourceAddressId,
      method: input.method,
      chain: source.chain,
      asset,
      destinationAddress: input.destinationAddress,
      amountAtomic: input.amountAtomic,
      decimals,
      fiatCurrency: input.fiatCurrency,
      fiatAmountMinor: input.fiatAmountMinor,
      status: "initiated",
      idempotencyKey: input.idempotencyKey,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    await this.db.withdrawals.insert(withdrawal)
    await this.emitter.emit("WithdrawalInitiated", {
      withdrawalId: withdrawal.id,
      customerId: withdrawal.customerId,
      method: withdrawal.method,
      amount,
      fiat:
        input.fiatCurrency && input.fiatAmountMinor !== undefined
          ? { amountMinor: input.fiatAmountMinor, currency: input.fiatCurrency }
          : undefined,
      createdAt: withdrawal.createdAt,
    })

    // --- Screening gate (hard gate before any payout or broadcast) ---
    const screening = await this.screen(withdrawal, input.destinationAddress, source.chain)
    if (screening.verdict !== "clear") {
      return this.failTo(withdrawal, `screening verdict: ${screening.verdict}`, screening.resultId)
    }
    withdrawal = await this.transition(withdrawal, "processing")

    try {
      if (input.method === "fiat") {
        return await this.executeFiat(withdrawal, input)
      }
      return await this.executeCrypto(withdrawal, source)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      return this.failTo(withdrawal, reason)
    }
  }

  private async isDestinationAllowed(
    customerId: string,
    destinationAddress: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    const dest = await this.db.addresses.getByAddress(destinationAddress)
    if (!dest) return { ok: false, reason: "destination address unknown" }
    // Customer's own derived addresses are always allowed.
    if (dest.customerId === customerId) return { ok: true }
    if (dest.allowlistState === "active") return { ok: true }
    if (dest.allowlistState === "pending_cooling" && dest.allowlistActiveAt) {
      // Cooling elapsed → promote to active (§2.4).
      if (Date.now() - new Date(dest.allowlistActiveAt).getTime() >= this.options.coolingMs) {
        await this.db.addresses.updateAllowlist(dest.id, "active", dest.allowlistActiveAt)
        return { ok: true }
      }
      return { ok: false, reason: "destination address cooling period active" }
    }
    return { ok: false, reason: "destination address not allowlisted" }
  }

  private async screen(
    withdrawal: WithdrawalRecord,
    destinationAddress: string | undefined,
    chain: string,
  ) {
    const screeningInput: ScreeningInput = {
      subjectType: "counterparty",
      subjectId: destinationAddress ?? withdrawal.id,
      addresses: destinationAddress ? [destinationAddress] : undefined,
      fiatCurrency: withdrawal.fiatCurrency,
      chain,
    }
    const outcome = await this.compliance.screen(screeningInput)
    await this.db.screeningResults.insert({
      ...outcome,
      subjectType: screeningInput.subjectType,
      subjectId: screeningInput.subjectId,
    })
    if (outcome.verdict !== "clear") {
      await this.emitter.emit("ScreeningFlagged", {
        resultId: outcome.resultId,
        subjectType: screeningInput.subjectType,
        subjectId: screeningInput.subjectId,
        vendor: outcome.vendor,
        flaggedAt: outcome.screenedAt,
      })
    }
    return outcome
  }

  private async executeFiat(
    withdrawal: WithdrawalRecord,
    input: RequestWithdrawalInput,
  ): Promise<WithdrawalRecord> {
    const currency = input.fiatCurrency
    const fiat = input.fiatAmountMinor
    if (!currency || fiat === undefined) {
      return this.failTo(withdrawal, "fiat withdrawal requires fiatCurrency and fiatAmountMinor")
    }
    const eligible = this.fiatRails.filter(
      (r) => r.capabilities.supportsPayouts && r.capabilities.currencies.includes(currency),
    )
    if (eligible.length === 0) throw new Error(`No fiat rail supports payouts in ${currency}`)

    // SmartRouter picks among healthy rails; equal scores ⇒ near-tie sampling.
    const router = new SmartRouter<FiatRailPort>({
      probe: (r) => r.capabilities.supportsPayouts && !r.name.includes("disabled"),
    })
    const selection = router.select(null, eligible, () => 1, { epsilon: Number.MAX_SAFE_INTEGER })
    const rail = selection.selected

    withdrawal = await this.transition(withdrawal, "screening")
    await this.emitter.emit("WithdrawalProcessing", {
      withdrawalId: withdrawal.id,
      rail: rail.name,
      startedAt: nowIso(),
    })

    const result = await rail.payout({
      withdrawalId: withdrawal.id,
      currency,
      amountMinor: fiat,
      beneficiary: {
        name: withdrawal.customerId,
        accountNumber: withdrawal.destinationAddress ?? "",
      },
    })

    if (result.status === "failed") {
      return this.failTo(
        withdrawal,
        result.failureReason ?? "fiat payout failed",
        undefined,
        result.railTxId,
      )
    }

    const settled = result.status === "settled"
    const updated: WithdrawalRecord = {
      ...withdrawal,
      status: settled ? "settled" : "processing",
      rail: rail.name,
      updatedAt: nowIso(),
    }
    await this.db.withdrawals.update(updated)
    if (settled) {
      await this.emitter.emit("WithdrawalSettled", {
        withdrawalId: updated.id,
        settledAt: updated.updatedAt,
      })
    }
    return updated
  }

  private async executeCrypto(
    withdrawal: WithdrawalRecord,
    source: AddressRecord,
  ): Promise<WithdrawalRecord> {
    const chain = this.chainFor(source.chain)
    const destination = withdrawal.destinationAddress
    if (!destination) throw new Error("crypto withdrawal requires a destination address")

    // Per-address broadcast serialization (§2.4).
    return this.lock.withLock(`addr:${source.address}`, async () => {
      await this.emitter.emit("WithdrawalProcessing", {
        withdrawalId: withdrawal.id,
        rail: chain.chain,
        startedAt: nowIso(),
      })

      const built = await chain.buildTransfer({
        chain: chain.chain,
        asset: withdrawal.asset as SettlementAsset,
        from: source.address,
        to: destination,
        amountAtomic: withdrawal.amountAtomic,
      })
      const signed = await this.custody.sign(built, source.custodyKeyRef)
      const { txHash, broadcastAt } = await this.custody.broadcast(signed)

      withdrawal = await this.transition(withdrawal, "processing", txHash)
      await this.emitter.emit("WithdrawalBroadcast", {
        withdrawalId: withdrawal.id,
        chain: chain.chain,
        txHash,
        amount: { atomic: withdrawal.amountAtomic, decimals: withdrawal.decimals },
        broadcastAt,
      })

      // Single confirmation re-check now; the host scheduler re-enqueues the rest.
      const state = await chain.getTransfer(txHash)
      const policy = chain.confirmationPolicy()
      const confirmed =
        state.status === "finalized" ||
        (state.status === "confirmed" && state.confirmations >= policy.confirmationsRequired)
      if (!confirmed) return withdrawal

      await this.emitter.emit("WithdrawalConfirmed", {
        withdrawalId: withdrawal.id,
        txHash,
        confirmations: state.confirmations,
        confirmedAt: nowIso(),
      })
      const settled = await this.transition(withdrawal, "settled")
      await this.emitter.emit("WithdrawalSettled", {
        withdrawalId: settled.id,
        settledAt: settled.updatedAt,
      })
      return settled
    })
  }

  private async transition(
    withdrawal: WithdrawalRecord,
    status: WithdrawalRecord["status"],
    txHash?: string,
  ): Promise<WithdrawalRecord> {
    const updated: WithdrawalRecord = {
      ...withdrawal,
      status,
      txHash: txHash ?? withdrawal.txHash,
      updatedAt: nowIso(),
    }
    await this.db.withdrawals.update(updated)
    return updated
  }

  /** Failed before/at creation — no lifecycle row to advance. */
  private async createFailed(
    input: RequestWithdrawalInput,
    source: AddressRecord,
    asset: SettlementAsset,
    reason: string,
  ): Promise<WithdrawalRecord> {
    const failed: WithdrawalRecord = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      sourceAddressId: input.sourceAddressId,
      method: input.method,
      chain: source.chain,
      asset,
      destinationAddress: input.destinationAddress,
      amountAtomic: input.amountAtomic,
      decimals: input.decimals,
      fiatCurrency: input.fiatCurrency,
      fiatAmountMinor: input.fiatAmountMinor,
      status: "failed",
      failureReason: reason,
      idempotencyKey: input.idempotencyKey,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    await this.db.withdrawals.insert(failed)
    await this.emitter.emit("WithdrawalFailed", {
      withdrawalId: failed.id,
      reason,
      failedAt: failed.updatedAt,
    })
    return failed
  }

  /** Fail mid-lifecycle: persist terminal state and emit once. */
  private async failTo(
    withdrawal: WithdrawalRecord,
    reason: string,
    screeningResultId?: string,
    railTxId?: string,
  ): Promise<WithdrawalRecord> {
    void screeningResultId
    void railTxId
    const failed = await this.transition(withdrawal, "failed")
    failed.failureReason = reason
    await this.db.withdrawals.update(failed)
    await this.emitter.emit("WithdrawalFailed", {
      withdrawalId: failed.id,
      reason,
      failedAt: failed.updatedAt,
    })
    return failed
  }
}

