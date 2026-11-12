import { defineConfig } from "drizzle-kit"

const src = "node_modules/@baggit/core/dist/v1.0/adapters/db/schema/*.js"

export default defineConfig({
  dialect: "turso",
	schema: src,
	out: "./drizzle",
  casing: "snake_case",
  breakpoints: process.env.NODE_ENV !== "development",
  strict: process.env.NODE_ENV === "development",
	verbose: process.env.NODE_ENV === "development",
  tablesFilter: ["!__turso_internal_*"],
  dbCredentials: {
    url: (process.env.DATABASE_URL || '').replace(/^turso:\/\//, 'https://'),
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }
})
