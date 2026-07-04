import { describe, expect, it } from 'vitest'
import { privateKeyToAccount } from 'viem/accounts'

import { generateKeypair } from './use-generate-keypair'

describe('generateKeypair', () => {
  it('produces a well-formed secp256k1 keypair and EVM address', () => {
    const { privateKey, publicKey, address } = generateKeypair()

    expect(privateKey).toMatch(/^0x[0-9a-f]{64}$/)
    // Uncompressed public key: 0x04 + 64 bytes.
    expect(publicKey).toMatch(/^0x04[0-9a-f]{128}$/)
    expect(address).toMatch(/^0x[0-9a-fA-F]{40}$/)
  })

  it('derives an address consistent with its own private key', () => {
    const keypair = generateKeypair()
    const rederived = privateKeyToAccount(keypair.privateKey)

    expect(rederived.address).toBe(keypair.address)
    expect(rederived.publicKey).toBe(keypair.publicKey)
  })

  it('returns a different keypair on each call', () => {
    const a = generateKeypair()
    const b = generateKeypair()

    expect(a.privateKey).not.toBe(b.privateKey)
    expect(a.address).not.toBe(b.address)
  })
})
