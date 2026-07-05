'use client'

import { useCallback, useState } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import type { Address, Hex } from 'viem'

export interface Keypair {
  /** 32-byte secp256k1 private key (`0x` + 64 hex). Keep secret. */
  privateKey: Hex
  /** Uncompressed secp256k1 public key (`0x04…`). */
  publicKey: Hex
  /** Checksummed EVM address derived from the public key. */
  address: Address
}

/** Derives a fresh random secp256k1 keypair plus its EVM address. */
export function generateKeypair(): Keypair {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  return { privateKey, publicKey: account.publicKey, address: account.address }
}

export interface UseGenerateKeypairReturnType {
  /** The most recently generated keypair, or `null` before the first call. */
  keypair: Keypair | null
  /** Generate a new keypair, store it, and return it. */
  generate: () => Keypair
  /** Forget the stored keypair. */
  reset: () => void
}

/** React wrapper around {@link generateKeypair} that retains the last result. */
export function useGenerateKeypair(): UseGenerateKeypairReturnType {
  const [keypair, setKeypair] = useState<Keypair | null>(null)

  const generate = useCallback(() => {
    const next = generateKeypair()
    setKeypair(next)
    return next
  }, [])

  const reset = useCallback(() => setKeypair(null), [])

  return { keypair, generate, reset }
}
