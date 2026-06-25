import type { Address, Hex } from 'viem'

export interface IncomingTransfer {
  /** Globally-unique id `${blockNumber}:${logIndex}` used for de-duplication. */
  id: string
  from: Address
  to: Address
  /** Raw token amount in the smallest unit; format with the token's decimals. */
  value: bigint
  blockNumber: bigint
  transactionHash: Hex
  logIndex: number | bigint
}

/** Mutable cursor pointing at the next block to scan (inclusive). */
export interface ScanCursor {
  nextBlock: bigint
}

export interface ScanRangeOptions {
  /** Fetch decoded incoming transfers within an inclusive `[fromBlock, toBlock]`. */
  fetchLogs: (
    fromBlock: bigint,
    toBlock: bigint,
  ) => Promise<Array<IncomingTransfer>>
  /** Latest block number to scan up to. */
  getBlockNumber: () => Promise<bigint>
  /** Advanced in place as chunks are confirmed; persists across polls. */
  cursor: ScanCursor
  /** Ids already emitted; persists across polls to keep retries idempotent. */
  seen: Set<string>
  /** Max blocks per `fetchLogs` call. Must be greater than 0. */
  maxBlockRange: bigint
  /** Invoked with every freshly-seen batch as each chunk is confirmed. */
  onTransfers?: (transfers: Array<IncomingTransfer>) => void
}

/**
 * Scans `[cursor.nextBlock, latestBlock]` in `maxBlockRange`-sized chunks and
 * returns every transfer not already present in `seen`.
 *
 * No-drop guarantee: `cursor.nextBlock` only advances past a chunk after that
 * chunk's logs have been fetched and recorded. If `fetchLogs` rejects, the error
 * propagates with the cursor parked at the failed chunk, so the next call
 * retries that exact range. Overlapping retries stay idempotent via `seen`, and
 * confirmed batches are surfaced through `onTransfers` before any later failure,
 * so partial progress is never lost.
 */
export async function scanRange(
  options: ScanRangeOptions,
): Promise<Array<IncomingTransfer>> {
  const {
    fetchLogs,
    getBlockNumber,
    cursor,
    seen,
    maxBlockRange,
    onTransfers,
  } = options
  if (maxBlockRange <= 0n) {
    throw new Error('maxBlockRange must be greater than 0')
  }

  const latestBlock = await getBlockNumber()
  const collected: Array<IncomingTransfer> = []

  while (cursor.nextBlock <= latestBlock) {
    const fromBlock = cursor.nextBlock
    const span = fromBlock + maxBlockRange - 1n
    const toBlock = span < latestBlock ? span : latestBlock

    const logs = await fetchLogs(fromBlock, toBlock)

    const fresh: Array<IncomingTransfer> = []
    for (const log of logs) {
      if (seen.has(log.id)) continue
      seen.add(log.id)
      fresh.push(log)
    }
    if (fresh.length > 0) {
      collected.push(...fresh)
      onTransfers?.(fresh)
    }

    // Advance only after the chunk is fully recorded, so a later throw cannot
    // skip an un-scanned range.
    cursor.nextBlock = toBlock + 1n
  }

  return collected
}
