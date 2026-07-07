import { defineConfig } from "drizzle-kit"
import env from "./src/Core/Config/env"

export default defineConfig({
  dialect: env.NODE_ENV === "development" ? "sqlite" : "turso",
  out: env.NODE_ENV == "development"? "./src/Core/DB/migrations" : "./dist/src/Core/DB/migrations",
  schema: env.NODE_ENV === "development"? "./src/Core/DB/schema/*.ts" : "./dist/src/Core/DB/schema/*.js",
  casing: "snake_case",
  breakpoints: env.NODE_ENV !== "development",
  strict: true,
  verbose: true,
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  }
})
