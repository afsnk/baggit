import { describe, it, expect } from "vitest"
import { ProviderRegistry } from "../../registry/provider-registry"
import { RouteScorer } from "../../application/scoring/route-scorer"
import { RouteEngine } from "../../application/routing/route-engine"
import { MoonpayProvider } from "../../providers/moonpay/moonpay-provider"
import { RampProviderImpl } from "../../providers/ramp/ramp-provider"
import { TransakProvider } from "../../providers/transak/transak-provider"

describe("RouteEngine Integration", () => {
  it("discovers routes from registered providers", async () => {
    const registry = new ProviderRegistry()
    registry.register(new MoonpayProvider())
    registry.register(new RampProviderImpl())
    registry.register(new TransakProvider())

    const scorer = new RouteScorer()
    const engine = new RouteEngine(registry, scorer)

    const routes = await engine.findRoutes({
      sourceAsset: "USD",
      targetAsset: "USDC",
      amount: 100,
      direction: "buy",
      region: "US",
      paymentMethod: "credit_card",
    })

    expect(routes.length).toBeGreaterThan(0)
    for (const route of routes) {
      expect(route.provider).toBeTruthy()
      expect(route.score).toBeGreaterThanOrEqual(0)
      expect(route.score).toBeLessThanOrEqual(1)
      expect(route.quote.sourceAmount).toBe(100)
    }
  })

  it("returns empty when no providers match filters", async () => {
    const registry = new ProviderRegistry()
    registry.register(new MoonpayProvider())

    const scorer = new RouteScorer()
    const engine = new RouteEngine(registry, scorer)

    const routes = await engine.findRoutes({
      sourceAsset: "USD",
      targetAsset: "BTC",
      amount: 100,
      direction: "buy",
      region: "JP",
      paymentMethod: "credit_card",
    })

    expect(routes).toHaveLength(0)
  })

  it("ranks routes by score descending", async () => {
    const registry = new ProviderRegistry()
    registry.register(new MoonpayProvider())
    registry.register(new RampProviderImpl())

    const scorer = new RouteScorer()
    const engine = new RouteEngine(registry, scorer)

    const routes = await engine.findRoutes({
      sourceAsset: "USD",
      targetAsset: "USDC",
      amount: 100,
      direction: "buy",
      region: "US",
      paymentMethod: "credit_card",
    })

    for (let i = 1; i < routes.length; i++) {
      expect(routes[i - 1].score).toBeGreaterThanOrEqual(routes[i].score)
    }
  })

  it("uses cached routes on subsequent calls", async () => {
    const registry = new ProviderRegistry()
    registry.register(new MoonpayProvider())

    const cacheCalls: string[] = []
    const mockCache = {
      get: async (key: string) => {
        cacheCalls.push(`get:${key}`)
        return null
      },
      set: async (key: string, _value: any) => {
        cacheCalls.push(`set:${key}`)
      },
      delete: async () => {},
      exists: async () => false,
    }

    const scorer = new RouteScorer()
    const engine = new RouteEngine(registry, scorer, { cache: mockCache })

    await engine.findRoutes({
      sourceAsset: "USD",
      targetAsset: "USDC",
      amount: 100,
      direction: "buy",
      region: "US",
      paymentMethod: "credit_card",
    })

    expect(cacheCalls.some((c) => c.startsWith("get:"))).toBe(true)
    expect(cacheCalls.some((c) => c.startsWith("set:"))).toBe(true)
  })
})
