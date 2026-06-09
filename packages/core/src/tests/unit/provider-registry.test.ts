import { describe, it, expect } from "vitest"
import { ProviderRegistry } from "../../registry/provider-registry"
import type { ProviderPort } from "../../ports/provider.port"

class MockProvider implements ProviderPort {
  name: string
  capabilities: any = {
    capabilities: ["buy", "sell"],
    supportedRegions: ["US", "EU"],
    supportedFiatCurrencies: ["USD", "EUR"],
    supportedCryptoAssets: ["BTC", "ETH", "USDC"],
    supportedPaymentMethods: ["credit_card", "bank_transfer"],
    kycRequired: true,
    kycLevels: ["basic"],
  }

  constructor(name: string) {
    this.name = name
  }

  async isAvailable() { return true }
  async quote(): Promise<any> { throw new Error("not implemented") }
  async initiate(): Promise<any> { throw new Error("not implemented") }
  async status() { return "pending" as any }
  async health() {
    return {
      status: "active" as any,
      uptime: 100,
      lastChecked: new Date(),
      failureRate: 0,
      avgResponseTime: 100,
    }
  }
}

describe("ProviderRegistry", () => {
  it("registers and retrieves a provider", () => {
    const registry = new ProviderRegistry()
    const provider = new MockProvider("test")
    registry.register(provider)
    expect(registry.get("test")).toBe(provider)
    expect(registry.count()).toBe(1)
  })

  it("throws on duplicate registration", () => {
    const registry = new ProviderRegistry()
    registry.register(new MockProvider("dup"))
    expect(() => registry.register(new MockProvider("dup"))).toThrow()
  })

  it("unregisters a provider", () => {
    const registry = new ProviderRegistry()
    registry.register(new MockProvider("p1"))
    expect(registry.unregister("p1")).toBe(true)
    expect(registry.get("p1")).toBeUndefined()
    expect(registry.count()).toBe(0)
  })

  it("lists all providers", () => {
    const registry = new ProviderRegistry()
    registry.register(new MockProvider("p1"))
    registry.register(new MockProvider("p2"))
    expect(registry.list()).toHaveLength(2)
  })

  it("filters providers by region", () => {
    const registry = new ProviderRegistry()
    registry.register(new MockProvider("us-provider"))
    const euOnly = new MockProvider("eu-provider")
    euOnly.capabilities.supportedRegions = ["EU"]
    registry.register(euOnly)
    const result = registry.list({ regions: ["US"] })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("us-provider")
  })

  it("filters providers by capability", () => {
    const registry = new ProviderRegistry()
    const buyOnly = new MockProvider("buy-only")
    buyOnly.capabilities.capabilities = ["buy"]
    registry.register(buyOnly)
    registry.register(new MockProvider("both"))
    const result = registry.list({ capabilities: ["sell"] })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe("both")
  })

  it("fires onRegister callback", () => {
    const registry = new ProviderRegistry()
    const calls: string[] = []
    registry.onRegister((p) => calls.push(p.name))
    registry.register(new MockProvider("p1"))
    expect(calls).toEqual(["p1"])
  })

  it("fires onUnregister callback", () => {
    const registry = new ProviderRegistry()
    const calls: string[] = []
    registry.onUnregister((n) => calls.push(n))
    registry.register(new MockProvider("p1"))
    registry.unregister("p1")
    expect(calls).toEqual(["p1"])
  })
})
