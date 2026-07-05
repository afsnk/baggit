'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePublicClient } from 'wagmi'
import type { Address } from 'viem'

import {
  DEFAULT_MAX_BLOCK_RANGE,
  DEFAULT_POLLING_INTERVAL,
  TOKENS,
  erc20TransferEvent,
} from './config'
import type { SupportedChainId, TokenInfo, TokenSymbol } from './config'
import { scanRange } from './scanner'
import type { IncomingTransfer, ScanCursor } from './scanner'

export type WatchStatus = 'idle' | 'scanning' | 'watching' | 'error'

export interface UseWatchIncomingTokenParameters {
  /** Chain to watch (`base.id` / `bsc.id`). */
  chainId: SupportedChainId
  /** Token whose incoming transfers we care about. */
  token: TokenSymbol
  /** Recipient address to match against the `Transfer.to` topic. */
  address: Address | undefined
  /** First block to scan from (inclusive). */
  fromBlock: bigint
  /** Disable polling without unmounting. Defaults to `true`. */
  enabled?: boolean
  /** Poll cadence in ms. Defaults to 5000. */
  pollingInterval?: number
  /** Max blocks per `getLogs` request. Defaults to {@link DEFAULT_MAX_BLOCK_RANGE}. */
  maxBlockRange?: bigint
  /** Called with each newly-confirmed batch of incoming transfers. */
  onTransfers?: (transfers: Array<IncomingTransfer>) => void
}

export interface UseWatchIncomingTokenReturnType {
  /** All incoming transfers seen so far, in scan order. */
  transfers: Array<IncomingTransfer>
  status: WatchStatus
  error: Error | null
  /** Highest block confirmed scanned, or `null` before the first successful poll. */
  lastScannedBlock: bigint | null
  /** Resolved token metadata (address + decimals) for the watched token. */
  token: TokenInfo
  /** Restart the watch from `fromBlock`, clearing accumulated state. */
  reset: () => void
}

/**
 * Polls for ERC-20 transfers crediting `address` with `token` on `chainId`,
 * every `pollingInterval` ms, starting at `fromBlock`.
 *
 * Backed by {@link scanRange}: a persistent cursor and de-dup set guarantee no
 * transaction is missed or double-counted across polls, even when a poll fails
 * or a previous poll is still in flight.
 */
export function useWatchIncomingToken(
  parameters: UseWatchIncomingTokenParameters,
): UseWatchIncomingTokenReturnType {
  const {
    chainId,
    token,
    address,
    fromBlock,
    enabled = true,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    maxBlockRange = DEFAULT_MAX_BLOCK_RANGE,
    onTransfers,
  } = parameters

  const tokenInfo = TOKENS[chainId][token]
  const client = usePublicClient({ chainId })

  const [transfers, setTransfers] = useState<Array<IncomingTransfer>>([])
  const [status, setStatus] = useState<WatchStatus>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [lastScannedBlock, setLastScannedBlock] = useState<bigint | null>(null)
  const [resetNonce, setResetNonce] = useState(0)

  const cursorRef = useRef<ScanCursor>({ nextBlock: fromBlock })
  const seenRef = useRef<Set<string>>(new Set())
  const runningRef = useRef(false)

  // Keep the user callback fresh without restarting the poll loop.
  const onTransfersRef = useRef(onTransfers)
  useEffect(() => {
    onTransfersRef.current = onTransfers
  }, [onTransfers])

  const reset = useCallback(() => setResetNonce((nonce) => nonce + 1), [])

  const tokenAddress = tokenInfo.address

  useEffect(() => {
    // Fresh watch key: clear cursor, de-dup set, and surfaced state.
    cursorRef.current = { nextBlock: fromBlock }
    seenRef.current = new Set()
    runningRef.current = false
    setTransfers([])
    setError(null)
    setLastScannedBlock(null)

    if (!enabled || !address) {
      setStatus('idle')
      return
    }

    const recipient = address
    const controller = new AbortController()
    // Read through a call so a stale tick that resolves after this effect is
    // torn down (deps changed / unmounted) can't write into the next watch.
    const aborted = () => controller.signal.aborted
    setStatus('scanning')

    const fetchLogs = async (
      from: bigint,
      to: bigint,
    ): Promise<Array<IncomingTransfer>> => {
      const logs = await client.getLogs({
        address: tokenAddress,
        event: erc20TransferEvent,
        args: { to: recipient },
        fromBlock: from,
        toBlock: to,
        strict: true,
      })

      const out: Array<IncomingTransfer> = []
      for (const log of logs) {
        out.push({
          id: `${log.blockNumber}:${log.logIndex}`,
          from: log.args.from,
          to: log.args.to,
          value: log.args.value,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
        })
      }
      return out
    }

    const tick = async () => {
      if (aborted() || runningRef.current) return
      runningRef.current = true
      try {
        await scanRange({
          fetchLogs,
          getBlockNumber: () => client.getBlockNumber(),
          cursor: cursorRef.current,
          seen: seenRef.current,
          maxBlockRange,
          onTransfers: (batch) => {
            if (aborted()) return
            setTransfers((prev) => [...prev, ...batch])
            onTransfersRef.current?.(batch)
          },
        })
        if (aborted()) return
        setLastScannedBlock(cursorRef.current.nextBlock - 1n)
        setError(null)
        setStatus('watching')
      } catch (err) {
        if (aborted()) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setStatus('error')
      } finally {
        runningRef.current = false
      }
    }

    void tick()
    const interval = setInterval(() => void tick(), pollingInterval)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
  }, [
    client,
    chainId,
    tokenAddress,
    address,
    fromBlock,
    enabled,
    pollingInterval,
    maxBlockRange,
    resetNonce,
  ])

  return { transfers, status, error, lastScannedBlock, token: tokenInfo, reset }
}
