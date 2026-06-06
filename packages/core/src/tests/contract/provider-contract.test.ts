import { describe, it, expect } from "vitest"
import { v4 } from "../../utils/id"

describe("Provider contract compliance", () => {
  it("moonpay module exports provider class", async () => {
    const mod = await import("../../providers/moonpay/moonpay-provider")
    const provider = new mod.MoonpayProvider()
    expect(provider.name).toBe("moonpay")
  })

  it("transak module exports provider class", async () => {
    const mod = await import("../../providers/transak/transak-provider")
    const provider = new mod.TransakProvider()
    expect(provider.name).toBe("transak")
  })

  it("ramp module exports provider class", async () => {
    const mod = await import("../../providers/ramp/ramp-provider")
    const provider = new mod.RampProviderImpl()
    expect(provider.name).toBe("ramp")
  })

  it("yellowcard module exports provider class", async () => {
    const mod = await import("../../providers/yellowcard/yellowcard-provider")
    const provider = new mod.YellowCardProvider()
    expect(provider.name).toBe("yellowcard")
  })

  it("implements isAvailable correctly", async () => {
    const { MoonpayProvider } = await import("../../providers/moonpay/moonpay-provider")
    const provider = new MoonpayProvider()
    const result = await provider.isAvailable("US")
    expect(typeof result).toBe("boolean")
  })

  it("generates quotes with valid structure", async () => {
    const mod = await import("../../providers/ramp/ramp-provider")
    const provider = new mod.RampProviderImpl()
    const quote = await provider.quote({
      sourceAsset: "USD",
      targetAsset: "USDC",
      sourceAmount: 100,
      direction: "buy",
      region: "US",
      paymentMethod: "credit_card",
    })
    expect(quote.provider).toBe("ramp")
    expect(quote.sourceAmount).toBe(100)
    expect(quote.targetAmount).toBeGreaterThan(0)
    expect(quote.estimatedSettlementMs).toBeGreaterThan(0)
  })

  it("initiates transactions", async () => {
    const { TransakProvider } = await import("../../providers/transak/transak-provider")
    const provider = new TransakProvider()
    const tx = await provider.initiate({
      provider: "transak",
      quoteId: "q-1",
      sourceAsset: "USD",
      targetAsset: "USDC",
      sourceAmount: 100,
      targetAmount: 98,
      direction: "buy",
      paymentMethod: "credit_card",
      region: "US",
      userId: "user-1",
      idempotencyKey: v4(),
    })
    expect(tx.status).toBe("processing")
    expect(tx.providerTxId).toBeTruthy()
  })
})
