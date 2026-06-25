'use client'

import { useTransactionReceipt as useWagmiTransactionReceipt } from 'wagmi'
import { getTransactionReceipt as getViemTransactionReceipt } from 'viem/actions'
import type { Hex } from 'viem'

import { wagmiConfig } from './config'
import type { SupportedChainId } from './config'

export interface UseTransactionReceiptParameters {
  /** Transaction hash to look up. The query stays disabled until it is set. */
  hash: Hex | undefined
  /** Chain to query; defaults to the connected/first configured chain. */
  chainId?: SupportedChainId
  enabled?: boolean
}

/**
 * Fetches the receipt for an already-mined transaction by hash. Unlike
 * `useWaitForTransactionReceipt`, this does not wait — it reports `error` while
 * the transaction is still pending/unknown. `refetch` re-checks on demand.
 */
export function useTransactionReceipt(
  parameters: UseTransactionReceiptParameters,
) {
  const { hash, chainId, enabled = true } = parameters

  const query = useWagmiTransactionReceipt({
    hash,
    chainId,
    query: { enabled: Boolean(hash) && enabled },
  })

  return {
    receipt: query.data,
    status: query.status,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Imperative, non-React variant: resolve a transaction receipt by hash using the
 * shared {@link wagmiConfig} client. Rejects if the transaction is not yet mined.
 */
export function getTransactionReceipt(
  hash: Hex,
  options?: { chainId?: SupportedChainId },
) {
  const client = wagmiConfig.getClient({ chainId: options?.chainId })
  return getViemTransactionReceipt(client, { hash })
}
