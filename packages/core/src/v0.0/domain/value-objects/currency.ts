export const FIAT_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "BRL",
  "NGN",
  "KES",
  "ZAR",
  "INR",
  "SGD",
  "HKD",
  "CHF",
  "MXN",
  "COP",
  "ARS",
  "PEN",
] as const

export type FiatCurrency = (typeof FIAT_CURRENCIES)[number]

export const CRYPTO_ASSETS = [
  "BTC",
  "ETH",
  "USDC",
  "USDT",
  "DAI",
  "SOL",
  "MATIC",
  "POL",
  "LINK",
  "UNI",
  "AAVE",
  "ARB",
  "OP",
] as const

export type CryptoAsset = (typeof CRYPTO_ASSETS)[number]

export type Asset = FiatCurrency | CryptoAsset

export function isFiat(asset: Asset): asset is FiatCurrency {
  return FIAT_CURRENCIES.includes(asset as FiatCurrency)
}

export function isCrypto(asset: Asset): asset is CryptoAsset {
  return CRYPTO_ASSETS.includes(asset as CryptoAsset)
}
