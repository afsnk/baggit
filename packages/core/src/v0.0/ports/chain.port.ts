/**
 * REQUIREMENTS.md §3: chain abstraction.
 * Address derivation, transfer build, balance reads, confirmation tracking,
 * fee estimation. Balances read here are the system of record (§2.2).
 */

export const CHAIN_IDS = ["base", "solana"] as const
export type ChainId = (typeof CHAIN_IDS)[number]

export const SETTLEMENT_ASSETS = ["USDC", "USDT"] as const
export type SettlementAsset = (typeof SETTLEMENT_ASSETS)[number]

/** Default decimals metadata per settlement asset. */
export const ASSET_DECIMALS: Record<SettlementAsset, number> = {
  USDC: 6,
  USDT: 6,
}

export interface DerivedAddress {
  chain: ChainId
  address: string
  derivationIndex: number
  /** Reference to key material inside CustodyPort; never a raw key. */
  keyRef: string
}

export interface TransferIntent {
  chain: ChainId
  asset: SettlementAsset
  from: string
  to: string
  /** Decimal string of atomic units. */
  amountAtomic: string
}

export interface BuiltTransfer {
  intent: TransferIntent
  /** Decimal string of atomic units. */
  estimatedFeeAtomic: string
  /** Opaque chain-specific unsigned payload for CustodyPort signing. */
  unsigned: Record<string, unknown>
}

export type TransferStatus = "pending" | "confirmed" | "finalized" | "failed"

export interface TransferState {
  status: TransferStatus
  confirmations: number
  blockNumber?: number
  failureReason?: string
}

export interface ConfirmationPolicy {
  /** Confirmations required before a transfer counts as settled. */
  confirmationsRequired: number
  finalized: boolean
}

export interface BalanceSnapshot {
  address: string
  asset: SettlementAsset
  /** Decimal string of atomic units. */
  atomic: string
  decimals: number
  /** Chain tip at read time — callers decide freshness vs cached values. */
  readAt: string
}

export interface ChainPort {
  readonly chain: ChainId

  deriveAddress(derivationIndex: number): Promise<DerivedAddress>
  validateAddress(address: string): boolean

  buildTransfer(intent: TransferIntent): Promise<BuiltTransfer>
  estimateFee(intent: TransferIntent): Promise<string>

  /** On-chain truth — the platform's only authoritative balance source. */
  getBalance(address: string, asset: SettlementAsset): Promise<BalanceSnapshot>
  getTransfer(txHash: string): Promise<TransferState>
  confirmationPolicy(): ConfirmationPolicy
}
