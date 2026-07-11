import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { generateId } from "../utils"


export const ramps = sqliteTable("ramps", {
  id: text('id').primaryKey().$defaultFn(() => generateId('rmp')),
  reference: text("reference").notNull(),
  type: text("type", { enum: ["buy", "sell"] }),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  index("ramp_reference_Idx").on(table.reference)
])
