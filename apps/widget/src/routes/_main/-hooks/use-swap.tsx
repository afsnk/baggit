import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { TradeAction, TradeState } from './swap.entities'

interface SwapContext {
  tradeState: TradeState
}
const SwapContext = createContext<SwapContext | null>(null)

interface SwapProviderProps {
  children: React.ReactNode
}

function tradeReducer(state: TradeState, action: TradeAction): TradeState {
  switch (action.type) {
    case 'SELECT_ASSET': {
      return { ...state, assetIn: action.payload }
    }
    case 'LOAD_ROUTES': {
      // Load routes here

      return { ...state }
    }
    case 'PICK_ROUTE': {
      // User picks route best for them
      return { ...state }
    }
    case 'SET_DESTINATION': {
      return { ...state }
    }

    case 'CREATE_RECEIPT': {
      return { ...state }
    }
    case 'KYC_CHECK': {
      return { ...state }
    }
    case 'KYC_START': {
      return { ...state }
    }
    case 'KYC_DONE': {
      return { ...state }
    }

    default:
      return state
  }
}

export function SwapProvider({ children }: SwapProviderProps) {
  const [state, dispatch] = useReducer(tradeReducer, {
    assetIn: 'NGN',
    amountIn: 0,
    assetOut: 'USDT',
    amountOut: 0,
    isKYCDone: false,
    kycLevel: 0, // KYC level 0 - Not done, 1 - Simple KYC, 2 - Gov verified, 3 - Super level
    routes: [],
  })
  const debounceRef = useRef(null)

  return (
    <SwapContext.Provider
      value={{
        tradeState: state,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}

export const useSwap = () => {
  const context = useContext(SwapContext)
  if (!context) throw new Error(`useSwap must be used inside <SwapProvider>`)
  return context
}
