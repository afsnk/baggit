import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"


export const ramps = sqliteTable("ramps", {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  reference: text("reference").notNull(),
  type: text("type", { enum: ["buy", "sell"] }),
})
