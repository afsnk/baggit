import type { DBPort } from "../../ports/db.port"
import type { ChainPort, ChainId, SettlementAsset } from "../../ports/chain.port"
import { ASSET_DECIMALS } from "../../ports/chain.port"
import type { CustodyPort } from "../../ports/custody.port"
import type { CompliancePort } from "../../ports/compliance.port"
import type { FiatRailPort, InboundCredit } from "../../ports/fiat-rail.port"
import type { CachePort, LockPort } from "../../ports/cache.port"
import type { Emitter } from "../../primitives/emit"
import type {
  CreateDepositInput,
  DepositInstruction,
  DepositRecord,
} from "../../domain/entities/payments.entity"
import type { AddressRecord } from "../../domain/entities/payments.entity"
import type { WalletService } from "../wallets/wallet-service"

/**
 * REQUIREMENTS.md §2.3: fiat → stablecoin deposits.
 * Virtual-account instruction issuance (idempotent per customer/chain/
 * currency), inbound-credit matching, screening gate, custody broadcast,
 * confirmation-driven settlement. No in-process timers: polling and
 * settlement re-checks are driven by the host scheduler (§6b).
 */

export interface ConversionQuote {
  asset: SettlementAsset
  /** Human decimal rate: crypto major units per 1 unit of fiat. */
  rateDecimal: string
}

const DEFAULT_CONVERSION: ConversionQuote = { asset: "USDC", rateDecimal: "1" }

export interface DepositServiceDeps {
  db: DBPort
  emitter: Emitter
  chains: ChainPort[]
  custody: CustodyPort
  compliance: CompliancePort
  fiatRails: FiatRailPort[]
  cache: CachePort
  lock: LockPort
  wallets: WalletService
  /** Platform hot wallet that funds deliveries to user deposit addresses. */
  treasury?: {
    address?: string
    keyRef?: string
  }
}

/**
 * Integer-only conversion of `fiatAmountMinor` at `rateDecimal` into atomic
 * units of an asset with `decimals` decimals. Pure bigint math — never a
 * float (REQUIREMENTS.md §6d).
 */
export function convertFiatToAtomic(
  fiatAmountMinor: number,
  rateDecimal: string,
  decimals: number,
): string {
  const [whole = "0", frac = ""] = rateDecimal.split(".")
  const scale = frac.length
  const rateNum = BigInt(whole + frac)
  const atomic =
    (BigInt(Math.trunc(fiatAmountMinor)) * rateNum * 10n ** BigInt(decimals)) /
    (100n * 10n ** BigInt(scale))
  return atomic.toString()
}

/** Fixed-precision (18dp) bigint division → human decimal string. */
export function decimalDiv(num: bigint, den: bigint): string {
  if (den === 0n) throw new Error("Division by zero")
  const negative = num < 0n !== den < 0n
  const n = num < 0n ? -num : num
  const d = den < 0n ? -den : den
  const whole = n / d
  const SCALE = 18
  const frac = ((n % d) * 10n ** BigInt(SCALE)) / d
  const fracStr = frac.toString().padStart(SCALE, "0").replace(/0+$/, "")
  const body = `${whole}${fracStr ? "." + fracStr : ""}`
  return negative && body !== "0" ? `-${body}` : body
}

export class DepositService {
  private readonly db: DBPort
  private readonly emitter: Emitter
  private readonly chains: ChainPort[]
  private readonly custody: CustodyPort
  private readonly compliance: CompliancePort
  private readonly fiatRails: FiatRailPort[]
  private readonly cache: CachePort
  private readonly lock: LockPort
  private readonly wallets: WalletService
  private readonly treasury?: { address?: string; keyRef?: string }

  constructor(deps: DepositServiceDeps) {
    this.db = deps.db
    this.emitter = deps.emitter
    this.chains = deps.chains
    this.custody = deps.custody
    this.compliance = deps.compliance
    this.fiatRails = deps.fiatRails
    this.cache = deps.cache
    this.lock = deps.lock
    this.wallets = deps.wallets
    this.treasury = deps.treasury
  }

  chainFor(chain: string): ChainPort {
    const port = this.chains.find((c) => c.chain === chain)
    if (!port) throw new Error(`No chain adapter registered for "${chain}"`)
    return port
  }

  /**
   * Idempotent per (customerId, chain, currency): the deterministic reference
   * doubles as the idempotency probe under the lock.
   */
  async createInstruction(input: CreateDepositInput): Promise<DepositInstruction> {
    const reference = `dep:${input.customerId}:${input.chain}:${input.currency}`
    return this.lock.withLock(`instr:${reference}`, async () => {
      const existing = await this.db.depositInstructions.getByReference(reference)
      if (existing) return existing

      const rail =
        this.fiatRails.find(
          (r) =>
            r.capabilities.supportsVirtualAccounts &&
            r.capabilities.currencies.includes(input.currency),
        ) ?? null
      if (!rail) {
        throw new Error(`No fiat rail supports virtual accounts in ${input.currency}`)
      }

      const address = await this.wallets.ensureAddress(input.customerId, input.chain)
      // Guarded by the lock above; rails without idempotent VA creation rely on it.
      const virtualAccount = await rail.createVirtualAccount(input.customerId, input.currency)

      const instruction: DepositInstruction & { virtualAccount: typeof virtualAccount } = {
        id: crypto.randomUUID(),
        customerId: input.customerId,
        addressId: address.id,
        rail: rail.name,
        currency: input.currency,
        virtualAccountId: virtualAccount.id,
        reference,
        status: "initiated",
        createdAt: new Date().toISOString(),
        virtualAccount,
      }
      await this.db.depositInstructions.insert(instruction)

      await this.cache.set<string[]>(
        `va-ids:${rail.name}`,
        [...((await this.cache.get<string[]>(`va-ids:${rail.name}`)) ?? []), virtualAccount.id],
      )

      await this.emitter.emit("DepositInitiated", {
        depositId: instruction.id,
        customerId: input.customerId,
        rail: rail.name,
        fiat: { amountMinor: 0, currency: input.currency },
        createdAt: instruction.createdAt,
      })
      return instruction
    })
  }

  /**
   * Poll every rail (or one by name) over known virtual accounts and run each
   * inbound credit through the deposit flow. Host supplies pricing via
   * `conversion`; defaults to the 1:1 USDC stub.
   */
  async pollAndProcess(railName?: string, conversion: ConversionQuote = DEFAULT_CONVERSION) {
    const rails = railName ? this.fiatRails.filter((r) => r.name === railName) : this.fiatRails
    const processed: Array<DepositRecord | null> = []
    for (const rail of rails) {
      const ids = (await this.cache.get<string[]>(`va-ids:${rail.name}`)) ?? []
      if (ids.length === 0) continue
      const sinceIso = (await this.cache.get<string>(`poll-since:${rail.name}`)) ?? undefined
      const credits = await rail.pollInboundCredits(ids, sinceIso)
      for (const credit of credits) {
        processed.push(await this.handleInboundCredit(credit, conversion))
      }
      await this.cache.set(`poll-since:${rail.name}`, new Date().toISOString())
    }
    return processed.filter((d): d is DepositRecord => d !== null)
  }

  /**
   * Match a credit to its instruction and advance the lifecycle:
   * funds_detected → screened → delivered → settled (or failed).
   * Returns null when the credit matches no known instruction.
   */
  async handleInboundCredit(
    credit: InboundCredit,
    conversion: ConversionQuote = DEFAULT_CONVERSION,
  ): Promise<DepositRecord | null> {
    // Credit-idempotency: a replayed webhook/poll must not double-deliver.
    const existing = await this.db.deposits.getByCreditId(credit.creditId)
    if (existing) return existing

    const instruction = await this.db.depositInstructions.getByReference(credit.reference)
    if (!instruction) return null


    const now = new Date().toISOString()
    const decimals = ASSET_DECIMALS[conversion.asset]
    const amountAtomic = convertFiatToAtomic(credit.amount.amountMinor, conversion.rateDecimal, decimals)

    const address = await this.db.addresses.get(instruction.addressId)
    if (!address) throw new Error(`Address ${instruction.addressId} not found for instruction`)

    let deposit: DepositRecord = {
      id: crypto.randomUUID(),
      instructionId: instruction.id,
      customerId: instruction.customerId,
      creditId: credit.creditId,
      fiatAmountMinor: credit.amount.amountMinor,
      fiatCurrency: credit.amount.currency,
      chain: address.chain,
      asset: conversion.asset,
      destinationAddress: address.address,
      amountAtomic,
      decimals,
      confirmations: 0,
      status: "funds_detected",
      createdAt: now,
      updatedAt: now,
    }
    await this.db.deposits.insert(deposit)
    await this.emitter.emit("DepositFundsDetected", {
      depositId: deposit.id,
      creditId: credit.creditId,
      fiat: credit.amount,
      detectedAt: now,
    })

    // --- Screening gate (hard gate before any broadcast) ---
    const outcome = await this.compliance.screen({
      subjectType: "customer",
      subjectId: instruction.customerId,
      fiatCurrency: credit.amount.currency,
      chain: deposit.chain as ChainId,
    })
    await this.db.screeningResults.insert({
      ...outcome,
      subjectType: "customer",
      subjectId: instruction.customerId,
    })
    await this.emitter.emit("DepositScreened", {
      depositId: deposit.id,
      verdict: outcome.verdict,
      screenedAt: outcome.screenedAt,
    })

    if (outcome.verdict !== "clear") {
      deposit = { ...deposit, status: "screened", updatedAt: new Date().toISOString() }
      await this.db.deposits.update(deposit)
      await this.emitter.emit("ScreeningFlagged", {
        resultId: outcome.resultId,
        subjectType: "customer",
        subjectId: instruction.customerId,
        vendor: outcome.vendor,
        flaggedAt: outcome.screenedAt,
      })
      return deposit
    }

    // --- Delivery through custody, serialized per destination address ---
    deposit = await this.lock.withLock(`addr:${deposit.destinationAddress}`, () =>
      this.deliver(deposit),
    )
    if (deposit.status === "delivered") {
      deposit = await this.trySettle(deposit)
    }
    return deposit
  }

  /**
   * Single confirmation re-check for a delivered deposit. The host scheduler
   * re-enqueues these (SettlementCheckDue-style) — no timers here.
   */
  async trySettle(deposit: DepositRecord): Promise<DepositRecord> {
    const txHash = deposit.txHash
    if (!txHash) return deposit
    const chain = this.chainFor(deposit.chain)
    const state = await chain.getTransfer(txHash)
    const policy = chain.confirmationPolicy()
    const settled =
      state.status === "finalized" ||
      (state.status === "confirmed" && state.confirmations >= policy.confirmationsRequired)
    if (!settled) return deposit

    const updated: DepositRecord = {
      ...deposit,
      status: "settled",
      confirmations: Math.max(deposit.confirmations, state.confirmations),
      updatedAt: new Date().toISOString(),
    }
    await this.db.deposits.update(updated)
    await this.emitter.emit("DepositSettled", {
      depositId: updated.id,
      txHash,
      confirmations: updated.confirmations,
      settledAt: updated.updatedAt,
    })
    return updated
  }

  /** Re-check every unsettled deposit — host-driven sweep, no timers. */
  async processSettlementChecks(): Promise<void> {
    for (const deposit of await this.db.deposits.listUnsettled()) {
      await this.trySettle(deposit)
    }
  }

  private async deliver(deposit: DepositRecord): Promise<DepositRecord> {
    const chain = this.chainFor(deposit.chain)
    if (!this.treasury?.address || !this.treasury.keyRef) {
      return this.fail(deposit, "delivered", "treasury not configured")
    }
    try {
      const built = await chain.buildTransfer({
        chain: chain.chain,
        asset: deposit.asset as SettlementAsset,
        from: this.treasury.address,
        to: deposit.destinationAddress,
        amountAtomic: deposit.amountAtomic,
      })
      const signed = await this.custody.sign(built, this.treasury.keyRef)
      const { txHash } = await this.custody.broadcast(signed)
      const delivered: DepositRecord = {
        ...deposit,
        status: "delivered",
        txHash,
        updatedAt: new Date().toISOString(),
      }
      await this.db.deposits.update(delivered)
      await this.emitter.emit("DepositDelivered", {
        depositId: delivered.id,
        chain: chain.chain,
        asset: deposit.asset as SettlementAsset,
        toAddress: deposit.destinationAddress,
        txHash,
        amount: { atomic: deposit.amountAtomic, decimals: deposit.decimals },
        deliveredAt: delivered.updatedAt,
      })
      return delivered
    } catch (error) {
      return this.fail(deposit, "delivered", error instanceof Error ? error.message : String(error))
    }
  }

  private async fail(
    deposit: DepositRecord,
    stage: "initiated" | "funds_detected" | "screened" | "delivered",
    reason: string,
  ): Promise<DepositRecord> {
    const failed: DepositRecord = {
      ...deposit,
      status: "failed",
      failureReason: reason,
      updatedAt: new Date().toISOString(),
    }
    await this.db.deposits.update(failed)
    await this.emitter.emit("DepositFailed", {
      depositId: failed.id,
      stage,
      reason,
      failedAt: failed.updatedAt,
    })
    return failed
  }
}

