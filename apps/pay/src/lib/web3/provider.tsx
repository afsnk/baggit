'use client'

import { WagmiProvider } from 'wagmi'
import type { ReactNode } from 'react'

import { wagmiConfig } from './config'

/**
 * Provides the shared {@link wagmiConfig} to the tree. Must sit under the app's
 * `QueryClientProvider`, since the data hooks rely on TanStack Query.
 */
export function Web3Provider({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
}
