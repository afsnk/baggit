import type { ProviderPort } from "../ports/provider.port"
import type { CryptoAsset, FiatCurrency } from "../domain/value-objects/currency"
import type { Region } from "../domain/value-objects/region"
import type { PaymentMethod } from "../domain/value-objects/payment-method"
import type { KYCLevel } from "../domain/value-objects/kyc"

export interface ProviderFilter {
  regions?: Region[]
  fiatCurrencies?: FiatCurrency[]
  cryptoAssets?: CryptoAsset[]
  paymentMethods?: PaymentMethod[]
  capabilities?: Array<"buy" | "sell">
  kycLevel?: KYCLevel
  minUptime?: number
}

export class ProviderRegistry {
  private providers = new Map<string, ProviderPort>()
  private onRegisterCallbacks: Array<(provider: ProviderPort) => void> = []
  private onUnregisterCallbacks: Array<(name: string) => void> = []

  register(provider: ProviderPort): void {
    if (this.providers.has(provider.name)) {
      throw new Error(`Provider "${provider.name}" is already registered`)
    }
    this.providers.set(provider.name, provider)
    for (const cb of this.onRegisterCallbacks) {
      cb(provider)
    }
  }

  unregister(name: string): boolean {
    const removed = this.providers.delete(name)
    if (removed) {
      for (const cb of this.onUnregisterCallbacks) {
        cb(name)
      }
    }
    return removed
  }

  get(name: string): ProviderPort | undefined {
    return this.providers.get(name)
  }

  list(filter?: ProviderFilter): ProviderPort[] {
    const all = Array.from(this.providers.values())
    if (!filter) return all

    return all.filter((p) => {
      const caps = p.capabilities
      if (filter.regions && !filter.regions.some((r) => caps.supportedRegions.includes(r))) {
        return false
      }
      if (
        filter.fiatCurrencies &&
        !filter.fiatCurrencies.some((f) => caps.supportedFiatCurrencies.includes(f))
      ) {
        return false
      }
      if (
        filter.cryptoAssets &&
        !filter.cryptoAssets.some((c) => caps.supportedCryptoAssets.includes(c))
      ) {
        return false
      }
      if (
        filter.paymentMethods &&
        !filter.paymentMethods.some((pm) => caps.supportedPaymentMethods.includes(pm))
      ) {
        return false
      }
      if (
        filter.capabilities &&
        !filter.capabilities.some((c) => caps.capabilities.includes(c))
      ) {
        return false
      }
      if (filter.kycLevel) {
        if (!caps.kycRequired) return false
      }
      return true
    })
  }

  listNames(): string[] {
    return Array.from(this.providers.keys())
  }

  count(): number {
    return this.providers.size
  }

  onRegister(cb: (provider: ProviderPort) => void): () => void {
    this.onRegisterCallbacks.push(cb)
    return () => {
      const idx = this.onRegisterCallbacks.indexOf(cb)
      if (idx >= 0) this.onRegisterCallbacks.splice(idx, 1)
    }
  }

  onUnregister(cb: (name: string) => void): () => void {
    this.onUnregisterCallbacks.push(cb)
    return () => {
      const idx = this.onUnregisterCallbacks.indexOf(cb)
      if (idx >= 0) this.onUnregisterCallbacks.splice(idx, 1)
    }
  }

  clear(): void {
    const names = Array.from(this.providers.keys())
    this.providers.clear()
    for (const name of names) {
      for (const cb of this.onUnregisterCallbacks) {
        cb(name)
      }
    }
  }
}
