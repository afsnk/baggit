export const natsConfig = {
  servers: process.env.NATS_SERVERS ?? "nats://localhost:4222",
  name: "apra-core",
  maxReconnectAttempts: 10,
  reconnectDelay: 1000,
  streams: {
    settlementEvents: "settlement.events",
    quoteEvents: "quote.events",
    providerHealthEvents: "provider.health.events",
  },
  kv: {
    cache: "apra_cache",
    locks: "apra_locks",
  },
} as const
