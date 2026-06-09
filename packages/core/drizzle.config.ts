import { defineConfig } from "drizzle-kit"

const isProd = process.env.NODE_ENV === "production"

export default defineConfig({
  schema: "./src/adapters/drizzle/schema.ts",
  out: "./src/adapters/drizzle/migrations",
  dialect: isProd ? "turso" : "sqlite",
  dbCredentials: isProd
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: "./.db/apra.db",
      },
})
