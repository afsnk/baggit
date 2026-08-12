import React, { createContext, useContext, useReducer, useRef } from 'react'
import type { Asset, TradeAction, TradeState, Route } from './trade.entities'
import { useQuery } from '@tanstack/react-query'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '#/components/ui/drawer'
import { Button } from '#/components/ui/button'
import { KYCModal } from '../-components/kyc.modal'
import { authClient } from '#/lib/auth-client'
import { RoutesModal } from '../-components/routes-modal'

interface TradeContext {
  tradeState: TradeState
  pickAssetIn: (asset: Asset) => void
  pickAssetOut: (asset: Asset) => void
  pickRoute: (route: Route) => void
  tradeError: Error | any
  setMode: (mode: 'buy' | 'sell') => void
}
const TradeContext = createContext<TradeContext | null>(null)

interface TradeProviderProps {
  children: React.ReactNode
}

function tradeReducer(state: TradeState, action: TradeAction): TradeState {
  switch (action.type) {
    case 'SELECT_ASSET_IN': {
      return { ...state, assetIn: action.payload }
    }
    case 'SELECT_ASSET_OUT': {
      return { ...state, assetOut: action.payload }
    }
    case 'LOAD_ROUTES': {
      // Load routes here

      return { ...state, isLoadingRoutes: action.payload.isLoadingRoutes }
    }
    case 'PICK_ROUTE': {
      // User picks route best for them
      return { ...state, tradeRoute: action.payload }
    }
    case 'SET_DESTINATION': {
      return { ...state, destination: action.payload }
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
    case 'KYC_FINISH': {
      return { ...state }
    }
    default:
      return state
  }
}

export function TradeProvider({ children }: TradeProviderProps) {
  const [state, dispatch] = useReducer(tradeReducer, {
    assetIn: 'NGN',
    amountIn: 0,
    assetOut: 'USDT',
    amountOut: 0,
    isKYCDone: false,
    kycLevel: 0, // KYC level 0 - Not done, 1 - Simple KYC, 2 - Gov verified, 3 - Super level
    routes: [],
    tradeRoute: null,
    isLoadingRoutes: false,
    destination: null,
  })
  const debounceRef = useRef(null)
  const { data: session, isPending: loadingUser } = authClient.useSession()

  const pickAssetIn = (asset: Asset) =>
    dispatch({ type: 'SELECT_ASSET_IN', payload: asset })
  const pickAssetOut = (asset: Asset) =>
    dispatch({ type: 'SELECT_ASSET_OUT', payload: asset })
  const pickRoute = (route: Route) =>
    dispatch({ type: 'PICK_ROUTE', payload: route })
  const setMode = (mode: 'buy' | 'sell') =>
    dispatch({ type: 'SET_MODE', payload: mode })

  const {
    data: routeData,
    error: routeError,
    isLoading: loadRoutes,
    refetch,
  } = useQuery({
    queryKey: ['routes'],
    queryFn: () => {
      // throw new Error(`Failed to fetch items...`)

      return [{}] as Route[]
    },
    throwOnError: false,
    enabled: state.isLoadingRoutes,
    gcTime: 30_000,
    staleTime: 30_000,
    refetchOnMount: true,
  })

  const refetchRoutes = () => {
    dispatch({
      type: 'LOAD_ROUTES',
      payload: { isLoadingRoutes: true },
    })
    refetch()
  }

  return (
    <TradeContext.Provider
      value={{
        tradeState: {
          ...state,
          isLoadingRoutes: loadRoutes,
          routes: routeData,
        },
        pickAssetIn,
        pickAssetOut,
        pickRoute,
        setMode,
        tradeError: routeError,
      }}
    >
      {children}
      {/* KYC modal controlled by users current KYC level */}
      <KYCModal
        open={session === null}
        openChange={(open) => {
          console.log(`KYC Modal open state`, { open })
        }}
      />
      {/* Routes modal with route function and picker input options */}
      <RoutesModal routes={state.routes} open={false} />
      <Drawer open={!!routeError}>
        <DrawerContent className="max-w-sm w-full p-4 items-center mx-auto mb-4">
          <DrawerHeader>
            <DrawerTitle>An error occurred</DrawerTitle>
          </DrawerHeader>
          <div role="alert">
            <p>Something went wrong:</p>
            <pre>{routeError?.message}</pre>
            <Button onClick={refetchRoutes}>Try again</Button>
          </div>
        </DrawerContent>
      </Drawer>
    </TradeContext.Provider>
  )
}

export const useTrade = () => {
  const context = useContext(TradeContext)
  if (!context) throw new Error(`useTrade must be used inside <TradeProvider>`)
  return context
}
