export const providersConfig = {
  moonpay: {
    apiKey: process.env.MOONPAY_API_KEY,
    baseUrl: process.env.MOONPAY_BASE_URL ?? "https://api.moonpay.com",
    timeoutMs: 5_000,
  },
  transak: {
    apiKey: process.env.TRANSAK_API_KEY,
    baseUrl: process.env.TRANSAK_BASE_URL ?? "https://api.transak.com",
    timeoutMs: 5_000,
  },
  ramp: {
    apiKey: process.env.RAMP_API_KEY,
    baseUrl: process.env.RAMP_BASE_URL ?? "https://api.ramp.network",
    timeoutMs: 5_000,
  },
  yellowcard: {
    apiKey: process.env.YELLOWCARD_API_KEY,
    baseUrl: process.env.YELLOWCARD_BASE_URL ?? "https://api.yellowcard.io",
    timeoutMs: 5_000,
  },
} as const
