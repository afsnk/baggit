import { createConfig, http } from 'wagmi'
import { base, bsc } from 'wagmi/chains'
import { parseAbiItem } from 'viem'
import type { Address } from 'viem'

import { env } from '@/env'

/**
 * Shared wagmi config for read-only on-chain access on Base and BNB Smart Chain.
 * No connectors are registered — these hooks watch/read public state only.
 */
export const wagmiConfig = createConfig({
  chains: [base, bsc],
  ssr: true,
  transports: {
    [base.id]: http(env.VITE_BASE_RPC_URL),
    [bsc.id]: http(env.VITE_BSC_RPC_URL),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}

export type SupportedChainId = (typeof wagmiConfig)['chains'][number]['id']
export type TokenSymbol = 'USDC' | 'USDT'

export interface TokenInfo {
  symbol: TokenSymbol
  address: Address
  decimals: number
}

/**
 * Token contracts keyed by chain id. Addresses and decimals were verified
 * on-chain via `symbol()`/`decimals()` calls against each network.
 */
export const TOKENS: Record<
  SupportedChainId,
  Record<TokenSymbol, TokenInfo>
> = {
  [base.id]: {
    USDC: {
      symbol: 'USDC',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
    },
    USDT: {
      symbol: 'USDT',
      address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
      decimals: 6,
    },
  },
  [bsc.id]: {
    USDC: {
      symbol: 'USDC',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      decimals: 18,
    },
    USDT: {
      symbol: 'USDT',
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 18,
    },
  },
}

/** ERC-20 `Transfer` event used to detect incoming token movements. */
export const erc20TransferEvent = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
)

export const DEFAULT_POLLING_INTERVAL = 5_000
/** Max blocks per `getLogs` request; keeps within public-RPC range limits. */
export const DEFAULT_MAX_BLOCK_RANGE = 500n
