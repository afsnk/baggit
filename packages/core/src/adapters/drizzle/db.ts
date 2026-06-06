import Database from "better-sqlite3"
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { createClient } from "@libsql/client"
import { drizzle as drizzleTurso, type LibSQLDatabase } from "drizzle-orm/libsql"
import * as schema from "./schema"

type DB = BetterSQLite3Database<typeof schema> | LibSQLDatabase<typeof schema>

let db: DB | null = null

export interface DBConfig {
  url?: string
  authToken?: string
}

export function createDB(config?: DBConfig): DB {
  if (db) return db

  const isProd = process.env.NODE_ENV === "production"

  if (isProd) {
    const client = createClient({
      url: config?.url ?? process.env.TURSO_DATABASE_URL!,
      authToken: config?.authToken ?? process.env.TURSO_AUTH_TOKEN,
    })
    db = drizzleTurso(client, { schema }) as DB
  } else {
    const sqlite = new Database(config?.url ?? "./.db/apra.db")
    sqlite.pragma("journal_mode = WAL")
    sqlite.pragma("foreign_keys = ON")
    db = drizzle(sqlite, { schema }) as DB
  }

  return db
}

export function getDB(): DB {
  if (!db) throw new Error("DB not initialized. Call createDB() first.")
  return db
}

export function closeDB(): void {
  db = null
}

export { schema }
export type { DB }
