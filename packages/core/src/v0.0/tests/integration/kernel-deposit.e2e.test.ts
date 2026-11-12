import { describe, expect, it } from "vitest"
import Database from "better-sqlite3"
import { readFileSync } from "node:fs"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import * as schema from "../../v1.0/adapters/drizzle/schema"
import {
  DrizzleCustomerRepository,
  DrizzleAddressRepository,
  DrizzleDepositInstructionRepository,
  DrizzleDepositRepository,
  DrizzleWithdrawalRepository,
  DrizzleCheckoutSessionRepository,
  DrizzleWebhookEndpointRepository,
  DrizzleWebhookDeliveryRepository,
  DrizzleScreeningResultRepository,
  DrizzleProviderRepository,
  DrizzleQuoteRepository,
  DrizzleTransactionRepository,
  DrizzleSettlementRepository,
} from "../../v1.0/adapters/drizzle/repositories"
import type { DBPort } from "../../ports/db.port"
import type { EventBusPort, ConsumerPort } from "../../ports/event-bus.port"
import type { DomainEvent, EventType, EventPayloadMap } from "../../domain/events/events"
import type { CachePort } from "../../ports/cache.port"
import { MemoryLockPort } from "../../primitives/lock"
import type {
  ChainPort,
  DerivedAddress,
  BalanceSnapshot,
  BuiltTransfer,
  TransferState,
  ConfirmationPolicy,
} from "../../ports/chain.port"
import type { CustodyPort, SignedTransfer, BroadcastResult, SweepPlanItem } from "../../ports/custody.port"
import type {
  FiatRailPort,
  VirtualAccount,
  InboundCredit,
  FiatPayoutRequest,
  FiatPayoutResult,
  FiatPayoutStatus,
} from "../../ports/fiat-rail.port"
import type { CompliancePort, ScreeningInput, ScreeningOutcome, KycLevel } from "../../ports/compliance.port"
import type { WebhookOutPort, WebhookDeliveryAttempt, WebhookDeliveryOutcome } from "../../ports/webhook-out.port"
import { createApraKernel } from "../../kernel/create-kernel"

/**
 * REQUIREMENTS.md §14 acceptance:
 * "createApraKernel() boots … and completes a mock deposit end-to-end" plus
 * the chain-as-ledger proof: queried balance == confirmed transfer history.
 */

let mockTxCounter = 0

class CapturingBus implements EventBusPort {
  readonly events: Array<{ type: EventType; payload: unknown }> = []

  async emit<T extends EventType>(subject: T, payload: EventPayloadMap[T]): Promise<void> {
    this.events.push({ type: subject, payload })
  }
  async subscribe<T extends EventType>(
    _subject: T,
    _handler: (event: DomainEvent<T>) => Promise<void>,
  ): Promise<() => void> {
    return () => undefined
  }
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  last<T extends EventType>(type: T): EventPayloadMap[T] | undefined {
    const found = [...this.events].reverse().find((e) => e.type === type)
    return found?.payload as EventPayloadMap[T] | undefined
  }
  all(): EventType[] {
    return this.events.map((e) => e.type)
  }
  consumer(): ConsumerPort {
    throw new Error("not needed in test")
  }
}

class MemoryCache implements CachePort {
  private store = new Map<string, unknown>()
  async get<T>(key: string) {
    return (this.store.get(key) as T) ?? null
  }
  async set<T>(key: string, value: T) {
    this.store.set(key, value)
  }
  async delete(key: string) {
    this.store.delete(key)
  }
  async exists(key: string) {
    return this.store.has(key)
  }
}

/** Simulated chain: balances derived ONLY from confirmed transfer history. */
class MockChain implements ChainPort {
  readonly chain = "base" as const
  private transfers = new Map<string, TransferState>()
  /** address → atomic units received (confirmed only) — the "public ledger". */
  private ledger = new Map<string, bigint>()

  async deriveAddress(derivationIndex: number): Promise<DerivedAddress> {
    return {
      chain: "base",
      address: `0xdep${derivationIndex.toString().padStart(4, "0")}`,
      derivationIndex,
      keyRef: "",
    }
  }
  validateAddress(address: string): boolean {
    return address.length > 8
  }
  async buildTransfer(intent: {
    chain: "base" | "solana"
    asset: "USDC" | "USDT"
    from: string
    to: string
    amountAtomic: string
  }): Promise<BuiltTransfer> {
    return { intent, estimatedFeeAtomic: "0", unsigned: {} }
  }
  async estimateFee(): Promise<string> {
    return "0"
  }
  async getBalance(address: string, asset: "USDC" | "USDT"): Promise<BalanceSnapshot> {
    return {
      address,
      asset,
      atomic: (this.ledger.get(address) ?? 0n).toString(),
      decimals: 6,
      readAt: new Date().toISOString(),
    }
  }
  async getTransfer(txHash: string): Promise<TransferState> {
    const t = this.transfers.get(txHash)
    if (!t) return { status: "failed", confirmations: 0, failureReason: "unknown tx" }
    return { status: t.status, confirmations: t.confirmations }
  }
  confirmationPolicy(): ConfirmationPolicy {
    return { confirmationsRequired: 1, finalized: false }
  }

  /** Test hook used by MockCustody: broadcast ⇒ instantly confirmed + credited. */
  confirmInstantly(txHash: string, to: string, amountAtomic: string): void {
    this.transfers.set(txHash, { status: "confirmed", confirmations: 1 })
    this.ledger.set(to, (this.ledger.get(to) ?? 0n) + BigInt(amountAtomic))
  }
}

class MockCustody implements CustodyPort {
  constructor(private readonly chain: MockChain) {}
  async deriveKeyRef(derivationIndex: number): Promise<string> {
    return `kms://root/0/${derivationIndex}`
  }
  async sign(built: BuiltTransfer): Promise<SignedTransfer> {
    return { built, signed: {}, keyRef: "" }
  }
  async broadcast(signed: SignedTransfer): Promise<BroadcastResult> {
    const hash = `0xtx${++mockTxCounter}`
    // Instant finality in the mock: broadcast ⇒ confirmed ⇒ credited.
    this.chain.confirmInstantly(hash, signed.built.intent.to, signed.built.intent.amountAtomic)
    return { txHash: hash, broadcastAt: new Date().toISOString() }
  }
  async sweep(plan: SweepPlanItem[]): Promise<BroadcastResult[]> {
    void plan
    return [{ txHash: `0xsweep${++mockTxCounter}`, broadcastAt: new Date().toISOString() }]
  }
}

class MockFiatRail implements FiatRailPort {
  readonly name = "mock-fiat"
  readonly capabilities = { currencies: ["USD"], supportsVirtualAccounts: true, supportsPayouts: true }
  lastAccount: VirtualAccount | null = null

  async createVirtualAccount(customerId: string, currency: string): Promise<VirtualAccount> {
    const account: VirtualAccount = {
      id: `va-${customerId}`,
      customerId,
      rail: this.name,
      currency,
      accountNumber: "9999",
      reference: `ref-${customerId}-${currency}`,
      instructions: { bank: "Mock Bank" },
    }
    this.lastAccount = account
    return account
  }
  async pollInboundCredits(_ids: string[]): Promise<InboundCredit[]> {
    return []
  }
  async payout(_request: FiatPayoutRequest): Promise<FiatPayoutResult> {
    return { railTxId: "rail-1", status: "settled" satisfies FiatPayoutStatus as FiatPayoutStatus }
  }
  async getPayoutStatus(): Promise<FiatPayoutStatus> {
    return "settled"
  }
}

class ClearCompliance implements CompliancePort {
  screened = 0
  async screen(_input: ScreeningInput): Promise<ScreeningOutcome> {
    this.screened += 1
    return {
      resultId: `scr-${this.screened}`,
      vendor: "mock-vendor",
      verdict: "clear",
      screenedAt: new Date().toISOString(),
    }
  }
  async getKycLevel(_customerId: string): Promise<KycLevel> {
    return "basic"
  }
}

class StubTransport implements WebhookOutPort {
  attempts: WebhookDeliveryAttempt[] = []
  async send(attempt: WebhookDeliveryAttempt): Promise<WebhookDeliveryOutcome> {
    this.attempts.push(attempt)
    return { ok: true, statusCode: 200, attemptedAt: new Date().toISOString() }
  }
}

function makeDbPort(db: BetterSQLite3Database<typeof schema>): DBPort {
  return {
    connect: async () => {},
    disconnect: async () => {},
    migrate: async () => {},
    providers: new DrizzleProviderRepository(db),
    quotes: new DrizzleQuoteRepository(db),
    transactions: new DrizzleTransactionRepository(db),
    settlements: new DrizzleSettlementRepository(db),
    customers: new DrizzleCustomerRepository(db),
    addresses: new DrizzleAddressRepository(db),
    depositInstructions: new DrizzleDepositInstructionRepository(db),
    deposits: new DrizzleDepositRepository(db),
    withdrawals: new DrizzleWithdrawalRepository(db),
    checkoutSessions: new DrizzleCheckoutSessionRepository(db),
    webhookEndpoints: new DrizzleWebhookEndpointRepository(db),
    webhookDeliveries: new DrizzleWebhookDeliveryRepository(db),
    screeningResults: new DrizzleScreeningResultRepository(db),
  } as DBPort
}

const client = new Database(":memory:")
client.exec(
  readFileSync(new URL("../../adapters/drizzle/migrations/0000_payments_surfaces.sql", import.meta.url), "utf8"),
)
const db = drizzle(client, { schema })

const bus = new CapturingBus()
const chain = new MockChain()
const rail = new MockFiatRail()
const compliance = new ClearCompliance()

const kernel = createApraKernel({
  db: makeDbPort(db),
  bus,
  cache: new MemoryCache(),
  lock: new MemoryLockPort(),
  chains: [chain],
  custody: new MockCustody(chain),
  fiatRails: [rail],
  compliance,
  transport: new StubTransport(),
  config: {
    chains: ["base"],
    environment: "test",
    treasuryAddress: "0xtreasury0001",
    treasuryKeyRef: "kms://root/0/treasury",
  },
})

async function seedCustomer(id: string): Promise<void> {
  const now = new Date().toISOString()
  await db.insert(schema.customers).values({ id, externalId: `ext-${id}`, createdAt: now, updatedAt: now })
}

describe("createApraKernel — mock deposit E2E (§14)", () => {
  it("boots, issues an instruction, screens, broadcasts, and settles on-chain", async () => {
    await seedCustomer("cust-1")

    const address = await kernel.wallets.ensureAddress("cust-1", "base")
    expect(address.address).toBe("0xdep0000")
    expect(address.custodyKeyRef).toBe("kms://root/0/0")

    const instruction = await kernel.deposits.createInstruction({
      customerId: "cust-1",
      currency: "USD",
      chain: "base",
    })

    const deposit = await kernel.deposits.handleInboundCredit({
      creditId: "credit-1",
      virtualAccountId: rail.lastAccount!.id,
      reference: instruction.reference,
      amount: { amountMinor: 10_000, currency: "USD" }, // $100.00
      receivedAt: new Date().toISOString(),
    })

    expect(deposit).not.toBeNull()
    expect(deposit!.status).toBe("settled")
    expect(deposit!.txHash).toMatch(/^0xtx/)
    expect(deposit!.amountAtomic).toBe("100000000") // 100 USDC at rate 1.0, 6 dp

    expect(bus.all()).toContain("DepositInitiated")
    expect(bus.all()).toContain("DepositScreened")
    expect(bus.all()).toContain("DepositDelivered")
    expect(bus.all()).toContain("DepositSettled")

    const delivered = bus.last("DepositDelivered")!
    expect(delivered.chain).toBe("base")
    expect(delivered.amount.atomic).toBe("100000000")
  })
  it("resolves balances on-chain: queried balance equals confirmed history", async () => {
    const instruction = await kernel.deposits.createInstruction({
      customerId: "cust-1",
      currency: "USD",
      chain: "base",
    })
    await kernel.deposits.handleInboundCredit({
      creditId: "credit-2",
      virtualAccountId: rail.lastAccount!.id,
      reference: instruction.reference,
      amount: { amountMinor: 5_000, currency: "USD" },
      receivedAt: new Date().toISOString(),
    })

    const snapshot = await kernel.wallets.getBalance("cust-1", "base", "USDC")
    expect(snapshot.atomic).toBe("150000000")
  })

  it("is idempotent per inbound credit — replay does not double-deliver", async () => {
    await seedCustomer("cust-2")
    const instruction = await kernel.deposits.createInstruction({
      customerId: "cust-2",
      currency: "USD",
      chain: "base",
    })
    const credit: InboundCredit = {
      creditId: "credit-replay",
      virtualAccountId: rail.lastAccount!.id,
      reference: instruction.reference,
      amount: { amountMinor: 1_000, currency: "USD" }, // $10.00
      receivedAt: new Date().toISOString(),
    }

    const replay = await kernel.deposits.handleInboundCredit(credit)
    const again = await kernel.deposits.handleInboundCredit(credit)

    expect(replay!.status).toBe("settled")
    if (again) {
      expect(again.creditId).toBe(replay!.creditId)
    }
    const snapshot = await kernel.wallets.getBalance("cust-2", "base", "USDC")
    expect(snapshot.atomic).toBe("10000000")
    expect(snapshot.atomic).toBe("10000000")
  })
})
