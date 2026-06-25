import { describe, expect, it } from 'vitest'

import { scanRange } from './scanner'
import type { IncomingTransfer } from './scanner'

const ADDR = '0x0000000000000000000000000000000000000001' as const
const HASH =
  '0x0000000000000000000000000000000000000000000000000000000000000001' as const

function transfer(blockNumber: bigint, logIndex: number): IncomingTransfer {
  return {
    id: `${blockNumber}:${logIndex}`,
    from: ADDR,
    to: ADDR,
    value: 1n,
    blockNumber,
    transactionHash: HASH,
    logIndex,
  }
}

const DB = [
  transfer(5n, 0),
  transfer(5n, 1),
  transfer(12n, 0),
  transfer(27n, 3),
]

function logsIn(from: bigint, to: bigint): Array<IncomingTransfer> {
  return DB.filter((t) => t.blockNumber >= from && t.blockNumber <= to)
}

describe('scanRange', () => {
  it('collects every transfer across chunk boundaries and advances the cursor', async () => {
    const calls: Array<[bigint, bigint]> = []
    const cursor = { nextBlock: 0n }

    const result = await scanRange({
      fetchLogs: async (from, to) => {
        calls.push([from, to])
        return logsIn(from, to)
      },
      getBlockNumber: async () => 30n,
      cursor,
      seen: new Set(),
      maxBlockRange: 10n,
    })

    expect(result.map((t) => t.id)).toEqual(['5:0', '5:1', '12:0', '27:3'])
    expect(calls).toEqual([
      [0n, 9n],
      [10n, 19n],
      [20n, 29n],
      [30n, 30n],
    ])
    expect(cursor.nextBlock).toBe(31n)
  })

  it('returns nothing and does not re-fetch once the cursor is past the head', async () => {
    let fetched = false
    const result = await scanRange({
      fetchLogs: async (from, to) => {
        fetched = true
        return logsIn(from, to)
      },
      getBlockNumber: async () => 10n,
      cursor: { nextBlock: 11n },
      seen: new Set(),
      maxBlockRange: 10n,
    })

    expect(result).toEqual([])
    expect(fetched).toBe(false)
  })

  it('de-duplicates transfers already present in the seen set', async () => {
    const seen = new Set(['5:0', '5:1'])
    const result = await scanRange({
      fetchLogs: async (from, to) => logsIn(from, to),
      getBlockNumber: async () => 30n,
      cursor: { nextBlock: 0n },
      seen,
      maxBlockRange: 100n,
    })

    expect(result.map((t) => t.id)).toEqual(['12:0', '27:3'])
  })

  it('does not drop or duplicate transfers when a chunk fetch fails mid-scan', async () => {
    const emitted: Array<string> = []
    const cursor = { nextBlock: 0n }
    const seen = new Set<string>()
    let failOnTen = true

    const fetchLogs = async (from: bigint, to: bigint) => {
      if (failOnTen && from === 10n) throw new Error('rpc range limit')
      return logsIn(from, to)
    }
    const onTransfers = (batch: Array<IncomingTransfer>) => {
      for (const t of batch) emitted.push(t.id)
    }

    // First pass fails on the second chunk; cursor parks at the failed range and
    // already-confirmed transfers were surfaced before the throw.
    await expect(
      scanRange({
        fetchLogs,
        getBlockNumber: async () => 30n,
        cursor,
        seen,
        maxBlockRange: 10n,
        onTransfers,
      }),
    ).rejects.toThrow('rpc range limit')
    expect(emitted).toEqual(['5:0', '5:1'])
    expect(cursor.nextBlock).toBe(10n)

    // Retry resumes from the parked cursor: remaining transfers arrive exactly
    // once, with no re-emission of the first chunk.
    failOnTen = false
    const result = await scanRange({
      fetchLogs,
      getBlockNumber: async () => 30n,
      cursor,
      seen,
      maxBlockRange: 10n,
      onTransfers,
    })

    expect(result.map((t) => t.id)).toEqual(['12:0', '27:3'])
    expect(emitted).toEqual(['5:0', '5:1', '12:0', '27:3'])
    expect(cursor.nextBlock).toBe(31n)
  })

  it('rejects a non-positive maxBlockRange', async () => {
    await expect(
      scanRange({
        fetchLogs: async () => [],
        getBlockNumber: async () => 1n,
        cursor: { nextBlock: 0n },
        seen: new Set(),
        maxBlockRange: 0n,
      }),
    ).rejects.toThrow('maxBlockRange must be greater than 0')
  })
})
