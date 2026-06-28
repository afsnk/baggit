import { drizzle } from "drizzle-orm/libsql";

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

export default db;
