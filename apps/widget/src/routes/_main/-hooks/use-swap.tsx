import React, { createContext, useContext } from 'react'

const SwapContext = createContext<{} | null>(null)

interface SwapProviderProps {
  children: React.ReactNode
}

export function SwapProvider({ children }: SwapProviderProps) {
  return <SwapContext.Provider value={{}}>{children}</SwapContext.Provider>
}

export const useSwap = () => {
  const context = useContext(SwapContext)
  if (!context) throw new Error(`useSwap must be used inside <SwapProvider>`)
  return context
}
