import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { generateId } from "../utils"
import { toZodV4SchemaTyped } from "@/Core/Lib/zod-utils"
import { organization } from "./auth"
import { relations } from "drizzle-orm"


export const ramps = sqliteTable("ramps", {
  id: text('id').primaryKey().$defaultFn(() => generateId('rmp')),
  reference: text("reference").notNull(),
	type: text("type", { enum: ["buy", "sell"] }).notNull().default('sell'),
	amount: real("amount").notNull().default(0),
	orgId: text("org_id").references(() => organization.id),
	metadata: text("metadata", { mode: "json" }).$type<{
		[key: string]: any
	}>(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  index("ramp_reference_Idx").on(table.reference)
])

export const selectRamp = toZodV4SchemaTyped(createSelectSchema(ramps))
export const insertRamp = toZodV4SchemaTyped(createInsertSchema(ramps).required({
	reference: true,
	type: true,
	amount: true,
}).omit({
	metadata: true,
	createdAt: true,
	updatedAt: true,
	id: true
}))
// @ts-expect-error partial exists on zod v4 type
export const patchRamp = insertRamp.partial();


export const rampRelations = relations(ramps, ({ one }) => ({
	organiztion: one(organization, {
		fields: [ramps.orgId],
		references: [organization.id]
	})
}))
