import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Asset } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = (amount: number) =>
  Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount)

export function formatNumber(num: number) {
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  const format = (value: number, suffix: any) => {
    return `${sign}${formatter(value)}${suffix}`
  }

  if (absNum >= 1_000_000_000_000) {
    return format(absNum / 1_000_000_000_000, 'T')
  } else if (absNum >= 1_000_000_000) {
    return format(absNum / 1_000_000_000, 'B')
  } else if (absNum >= 1_000_000) {
    return format(absNum / 1_000_000, 'M')
  } else {
    return `${sign}${Math.ceil(absNum * 100) / 100}`
  }
}

export const icons: Record<Exclude<Asset, 'crypto'>, string> = {
  usdt: `/assets/token/usdt.svg`,
  usdc: `/assets/token/usdc.png`,
  bitcoin: `/assets/token/bitcoin.svg`,
  solana: `/assets/token/solana.svg`,
}
