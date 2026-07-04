export const defaultConfig = {
  engine: {
    quoteTimeoutMs: 5_000,
    maxQuotesPerProvider: 1,
    cacheTtlSec: 30,
  },
  scoring: {
    weights: {
      settlementSpeed: 0.25,
      feePercentage: 0.25,
      liquidityDepth: 0.15,
      failureRate: 0.15,
      providerUptime: 0.1,
      regionalAvailability: 0.1,
    },
  },
  settlement: {
    pollingIntervalMs: 5_000,
    maxPollingAttempts: 60,
  },
} as const

export type AppConfig = typeof defaultConfig
