import type { DBPort } from "../../ports/db.port"
import type { CustodyPort } from "../../ports/custody.port"
import type { CachePort } from "../../ports/cache.port"
import type { ChainPort, ChainId, SettlementAsset, BalanceSnapshot } from "../../ports/chain.port"
import { ASSET_DECIMALS, SETTLEMENT_ASSETS } from "../../ports/chain.port"
import type { AddressRecord } from "../../domain/entities/payments.entity"

/**
 * REQUIREMENTS.md §2.2/§3: custodial wallet addresses and balance reads.
 * Balances are ALWAYS read-through cache over the chain port — never
 * persisted (on-chain state is the system of record).
 */

const BALANCE_TTL_SECONDS = 15
const MAX_DERIVATION_PROBES = 1024

export interface WalletServiceDeps {
  db: DBPort
  chains: ChainPort[]
  custody: CustodyPort
  cache: CachePort
}

export class WalletService {
  private readonly db: DBPort
  private readonly chains: ChainPort[]
  private readonly custody: CustodyPort
  private readonly cache: CachePort

  constructor(deps: WalletServiceDeps) {
    this.db = deps.db
    this.chains = deps.chains
    this.custody = deps.custody
    this.cache = deps.cache
  }

  chainFor(chain: ChainId): ChainPort {
    const port = this.chains.find((c) => c.chain === chain)
    if (!port) throw new Error(`No chain adapter registered for "${chain}"`)
    return port
  }

  /**
   * Return the customer's existing address for `chain`, or derive the next
   * free one: lowest derivation index whose address is unclaimed
   * (deterministic per custody root), key ref derived through custody.
   */
  async ensureAddress(customerId: string, chain: ChainId): Promise<AddressRecord> {
    const existing = await this.db.addresses.getByCustomerAndChain(customerId, chain)
    if (existing) return existing

    const port = this.chainFor(chain)
    for (let index = 0; index < MAX_DERIVATION_PROBES; index++) {
      const derived = await port.deriveAddress(index)
      const claimed = await this.db.addresses.getByAddress(derived.address)
      if (claimed) continue
      const custodyKeyRef = await this.custody.deriveKeyRef(index)
      const record: AddressRecord = {
        id: crypto.randomUUID(),
        customerId,
        chain,
        address: derived.address,
        derivationIndex: index,
        custodyKeyRef,
        allowlistState: "none",
        createdAt: new Date().toISOString(),
      }
      await this.db.addresses.insert(record)
      return record
    }
    throw new Error(`No free derivation index for customer ${customerId} on ${chain}`)
  }

  /** Read-through cached balance; TTL keeps staleness bounded, nothing durable. */
  async getBalance(customerId: string, chain: ChainId, asset: SettlementAsset): Promise<BalanceSnapshot> {
    const address = await this.ensureAddress(customerId, chain)
    const key = `bal:${chain}:${address.address}:${asset}`
    const cached = await this.cache.get<BalanceSnapshot>(key)
    if (cached) return cached
    if (!SETTLEMENT_ASSETS.includes(asset)) {
      throw new Error(`Unsupported settlement asset "${asset}"`)
    }
    const snapshot = await this.chainFor(chain).getBalance(address.address, asset)
    void ASSET_DECIMALS
    await this.cache.set(key, snapshot, BALANCE_TTL_SECONDS)
    return snapshot
  }
}
