type FiatAsset = 'NGN' | 'USD'
type CryptoAsset = 'USDT' | 'USDC'
export type CryptoDestination = {}
export type FiatDestination = {}
export type Asset = CryptoAsset | FiatAsset
type AssetDestination = CryptoDestination | FiatDestination

interface TransactionReceipt {}

export type TradeAction =
  | { type: 'SET_MODE'; payload: 'buy' | 'sell' }
  | { type: 'SELECT_ASSET'; payload: Asset }
  | { type: 'LOAD_ROUTES'; payload: any }
  | { type: 'PICK_ROUTE'; payload: any }
  | { type: 'SET_DESTINATION'; payload: AssetDestination }
  | { type: 'CREATE_RECEIPT'; payload: TransactionReceipt }
  | { type: 'KYC_CHECK'; payload: boolean }
  | { type: 'KYC_START'; payload: any }
  | { type: 'KYC_DONE'; payload: any }

interface Routes {}

export type TradeState = {
  assetIn: Asset
  amountIn: number
  assetOut: Asset
  amountOut: number
  isKYCDone: boolean
  kycLevel: number
  routes: Array<Routes>
}
