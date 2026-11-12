import type { BuiltTransfer } from "./chain.port"

/**
 * REQUIREMENTS.md §3: key custody abstraction.
 * Key material derives from a KMS/HSM root and NEVER leaves the adapter.
 * All broadcasts execute through this port (§3: "Broadcasts execute only
 * through CustodyPort").
 */
export interface SignedTransfer {
  built: BuiltTransfer
  /** Opaque chain-specific signed payload. */
  signed: Record<string, unknown>
  keyRef: string
}

export interface BroadcastResult {
  txHash: string
  broadcastAt: string
}

export interface SweepPlanItem {
  fromKeyRef: string
  fromAddress: string
  /** Decimal string of atomic units. */
  amountAtomic: string
  asset: string
}

export interface CustodyPort {
  /**
   * Derive key material + address for `derivationIndex`. Deterministic per
   * root: same index always yields the same address (§2.2).
   */
  deriveKeyRef(derivationIndex: number): Promise<string>

  sign(built: BuiltTransfer, keyRef: string): Promise<SignedTransfer>
  broadcast(signed: SignedTransfer): Promise<BroadcastResult>

  /** Treasury sweep support: move funds from user wallets into treasury. */
  sweep(plan: SweepPlanItem[], treasuryKeyRef: string): Promise<BroadcastResult[]>
}
