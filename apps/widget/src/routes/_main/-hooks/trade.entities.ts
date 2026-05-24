type FiatAsset = 'NGN' | 'USD'
type CryptoAsset = 'USDT' | 'USDC'
export type CryptoDestination = {
  address: `0x${string}`
}
export type FiatDestination = {
  bankCode: string
  accountNumber: string
  accountName?: string
}
export type Asset = CryptoAsset | FiatAsset
export type AssetDestination = CryptoDestination | FiatDestination

interface TransactionReceipt {}

export type TradeAction =
  | { type: 'SET_MODE'; payload: 'buy' | 'sell' }
  | { type: 'SELECT_ASSET_IN'; payload: Asset }
  | { type: 'SELECT_ASSET_OUT'; payload: Asset }
  | {
      type: 'LOAD_ROUTES'
      payload: { isLoadingRoutes: boolean }
    }
  | { type: 'PICK_ROUTE'; payload: Route }
  | { type: 'SET_DESTINATION'; payload: AssetDestination }
  | { type: 'CREATE_RECEIPT'; payload: TransactionReceipt }
  | { type: 'KYC_CHECK'; payload: boolean }
  | { type: 'KYC_START'; payload: any }
  | { type: 'KYC_FINISH'; payload: any }

export interface Route {}

export type TradeState = {
  assetIn: Asset
  amountIn: number
  assetOut: Asset
  amountOut: number
  isKYCDone: boolean
  kycLevel: number
  routes: Array<Route> | undefined
  tradeRoute: Route | null
  isLoadingRoutes: boolean
  destination: AssetDestination | null
}
