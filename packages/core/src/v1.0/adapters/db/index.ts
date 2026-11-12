// import Database from "better-sqlite3"
import { type BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import * as schema from "./schema"

type DB = BetterSQLite3Database<typeof schema> | LibSQLDatabase<typeof schema>

let db: DB | null = null

export interface DBConfig {
  url?: string
  authToken?: string
}

const isProd = process.env.NODE_ENV === "production"
export function createDB(config?: DBConfig): DB {
  if (db) return db
		const connection = {
			url: config?.url ?? process.env.DATABASE_URL!,
			authToken: config?.authToken ?? process.env.DATABASE_AUTH_TOKEN,
		}
		db = drizzle({
			// @ts-ignores
			dialect: isProd ? 'turso' : 'sqlite',
			connection,
			schema
		}) as DB

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
export type { SelectTransaction, InsertTransaction, PatchTransaction } from "./schema/transaction"
export type { SelectInvoice, InsertInvoice, PatchInvoice } from "./schema/invoice"
