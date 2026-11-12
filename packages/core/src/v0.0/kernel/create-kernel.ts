import type { DBPort } from "../ports/db.port"
import type { EventBusPort } from "../ports/event-bus.port"
import type { CachePort, LockPort } from "../ports/cache.port"
import type { ChainPort } from "../ports/chain.port"
import type { CustodyPort } from "../ports/custody.port"
import type { FiatRailPort } from "../ports/fiat-rail.port"
import type { CompliancePort } from "../ports/compliance.port"
import type { AuthPort } from "../ports/auth.port"
import type { WebhookOutPort } from "../ports/webhook-out.port"
import { createEmitter, type Emitter } from "../primitives/emit"
import { MemoryLockPort } from "../primitives/lock"
import { WalletService } from "../application/wallets/wallet-service"
import { DepositService } from "../application/deposits/deposit-service"
import { WithdrawalService } from "../application/withdrawals/withdrawal-service"
import { CheckoutService } from "../application/checkout/checkout-service"
import { WebhookDispatcher } from "../application/webhooks/webhook-dispatcher"
import {
  ApraKernelConfigSchema,
  type ApraKernelConfig,
} from "./config"

/**
 * REQUIREMENTS.md §11/§12: composition root (server-only).
 * Pure factory — every dependency is injected by the host at its trust
 * boundary; the kernel holds no process state beyond those handles (§6a).
 */

export interface ApraKernelDeps {
  db: DBPort
  bus: EventBusPort
  cache: CachePort
  lock?: LockPort
  chains: ChainPort[]
  custody: CustodyPort
  fiatRails: FiatRailPort[]
  compliance: CompliancePort
  auth?: AuthPort
  transport: WebhookOutPort
  config?: Partial<ApraKernelConfig>
}

export interface ApraKernel {
  config: ApraKernelConfig
  emitter: Emitter
  wallets: WalletService
  deposits: DepositService
  withdrawals: WithdrawalService
  checkout: CheckoutService
  webhooks: WebhookDispatcher
  auth?: AuthPort
}

export function createApraKernel(deps: ApraKernelDeps): ApraKernel {
  const config = ApraKernelConfigSchema.parse(deps.config ?? {})
  const emitter = createEmitter(deps.bus)
  const lock = deps.lock ?? new MemoryLockPort()

  const chainByConfig = deps.chains.filter((c) => config.chains.includes(c.chain))
  if (chainByConfig.length === 0) {
    throw new Error(
      `createApraKernel: no chain adapters match configured chains [${config.chains.join(", ")}]`,
    )
  }

  const wallets = new WalletService({
    db: deps.db,
    chains: deps.chains,
    custody: deps.custody,
    cache: deps.cache,
  })

  const deposits = new DepositService({
    wallets,
    db: deps.db,
    emitter,
    chains: deps.chains,
    custody: deps.custody,
    compliance: deps.compliance,
    fiatRails: deps.fiatRails,
    cache: deps.cache,
    lock,
    treasury: {
      address: config.treasuryAddress,
      keyRef: config.treasuryKeyRef ?? config.treasuryAddress ?? "",
    },
  })

  const withdrawals = new WithdrawalService({
    db: deps.db,
    emitter,
    chains: deps.chains,
    custody: deps.custody,
    compliance: deps.compliance,
    fiatRails: deps.fiatRails,
    cache: deps.cache,
    lock,
    options: {
      velocityLimit: config.withdrawalVelocityLimit,
      velocityWindowMs: config.velocityWindowMs,
      coolingMs: config.addressCoolingMs,
    },
  })

  const checkout = new CheckoutService({
    db: deps.db,
    emitter,
    chains: deps.chains,
  })

  const webhooks = new WebhookDispatcher({
    db: deps.db,
    emitter,
    transport: deps.transport,
    maxAttempts: config.webhookMaxAttempts,
  })

  return Object.freeze({
    config,
    emitter,
    wallets,
    deposits,
    withdrawals,
    checkout,
    webhooks,
    auth: deps.auth,
  })
}
