import { describe, expect, it } from "vitest"
import { signHmac, verifyHmac } from "../../utils/hmac"

describe("webhook HMAC-SHA256 signing — §2.6", () => {
  const secret = "whsec_test_123"
  const body = JSON.stringify({ eventId: "evt_1", type: "DepositSettled" })

  it("verifies its own signature", async () => {
    const sig = await signHmac(secret, body)
    expect(sig).toMatch(/^[0-9a-f]{64}$/)
    expect(await verifyHmac(secret, body, sig)).toBe(true)
  })

  it("rejects unsigned payloads", async () => {
    expect(await verifyHmac(secret, body, "")).toBe(false)
  })

  it("rejects tampered bodies", async () => {
    const sig = await signHmac(secret, body)
    const tampered = body.replace("DepositSettled", "DepositFailed")
    expect(await verifyHmac(secret, tampered, sig)).toBe(false)
  })

  it("rejects signatures from a wrong secret", async () => {
    const sig = await signHmac("other-secret", body)
    expect(await verifyHmac(secret, body, sig)).toBe(false)
  })
})
