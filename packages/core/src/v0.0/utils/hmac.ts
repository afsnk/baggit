/**
 * REQUIREMENTS.md §2.6: HMAC-SHA256 webhook signing.
 * Universal tier — WebCrypto only, no Node globals.
 */

const encoder = new TextEncoder()

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function signHmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return bytesToHex(new Uint8Array(mac))
}

/** Constant-time comparison of provided vs expected signature. */
export async function verifyHmac(
  secret: string,
  message: string,
  signatureHex: string,
): Promise<boolean> {
  const expected = await signHmac(secret, message)
  return timingSafeEqualHex(expected, signatureHex.toLowerCase())
}
