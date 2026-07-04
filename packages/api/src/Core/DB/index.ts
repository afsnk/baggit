import { drizzle } from "drizzle-orm/libsql";
import {migrate} from "drizzle-orm/libsql/migrator"

import env from "@/Core/Config/env";

import * as schema from "./schema";

const db = drizzle({
  // @ts-ignore
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  dialect: env.NODE_ENV === "development" ? "sqlite" : "turso", // Configure dialect, turso for prod/staging - sqlite for local
  casing: "snake_case",
  schema: {...schema},
});


async function mainMigrator() {
  await migrate(db, { migrationsFolder: env.NODE_ENV == "development" ? "./src/Core/DB/migrations" : "./dist/src/Core/DB/migrations" })
  db.$client.close()
}

// mainMigrator().catch(console.log)

export default db;
