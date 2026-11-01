export const dbConfig = {
  url: process.env.DATABASE_URL ?? "./.db/apra.db",
  tursoUrl: process.env.TURSO_DATABASE_URL,
  tursoToken: process.env.TURSO_AUTH_TOKEN,
} as const
