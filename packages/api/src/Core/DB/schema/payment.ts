import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { generateId } from "../utils"
import { toZodV4SchemaTyped } from "@/Core/Lib/zod-utils"
import { organization } from "./auth"
import { relations } from "drizzle-orm"


export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => generateId('pay_')),
  reference: text("reference").notNull(),
  amount: real("amount").notNull(),
  callbackUrl: text("callback_url").notNull(),
  orgId: text("org_id").references(() => organization.id),
  metadata: text("metadata", { mode: "json" }).$type<{
    [key: string]: string
  }>(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  index("reference_idx").on(table.reference)
])

export const selectPayments = toZodV4SchemaTyped(createSelectSchema(payments));
export const insertPayments = toZodV4SchemaTyped(createInsertSchema(payments)
  .required({
    amount: true,
    reference: true,
    callbackUrl: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  }));

// @ts-expect-error partial exists on zod v4 type
export const patchPayments = insertPayments.partial()

export const paymentRelations = relations(payments, ({ one }) => ({
  organization: one(organization, {
    fields: [payments.orgId],
    references: [organization.id]
  })
}))
