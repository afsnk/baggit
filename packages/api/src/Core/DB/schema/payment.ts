import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { generateId } from "../utils"
import { toZodV4SchemaTyped } from "@/Core/Lib/zod-utils"
import { organization } from "./auth"
import { relations } from "drizzle-orm"

export const invoice = sqliteTable("invoice", {
  id: text("id").primaryKey().$defaultFn(() => generateId('inv')),
  to: text("to").notNull(),
  from: text("from").notNull(),
  amount: real("amount").notNull(),
  reference: text("reference").notNull(),
  memo: text("memo"),
  metadata: text("metadata", { mode: "json" }).$type<{
    type: "recurring" | "onetime", // required
    nextPayAt?: Date, // for recurring invoices — On this date a new invoice is created with updated `nextPayAt`
    range?: "monthly" | "yearly"
    [key: string]: any
  }>().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  index("invoice_reference_idx").on(table.reference),
])


export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => generateId('pay')),
  currency: text("currency", { enum: ["ngn", "usd", "gbp"] }).notNull(), // Lock in a currency
  method: text("method", {enum: ['bank-transfer', 'ussd', 'crypto', 'applepay', 'googlepay']}).notNull(), // Lock in a method — when method is bank transfer on-ramp is triggered
  callbackUrl: text("callback_url").notNull(),
  orgId: text("org_id").notNull().references(() => organization.id),
  invoiceId: text("invoice_id").notNull().references(() => invoice.id, {onDelete: "restrict"}),
  metadata: text("metadata", { mode: "json" }).$type<{
    [key: string]: any
  }>(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  index("invoice_idx").on(table.invoiceId),
  index("currency_idx").on(table.currency),
  index("method_idx").on(table.method),
])

export const selectPayments = toZodV4SchemaTyped(createSelectSchema(payments));
export const insertPayments = toZodV4SchemaTyped(createInsertSchema(payments)
  .required({
    callbackUrl: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  }));

// @ts-expect-error partial exists on zod v4 type
export const patchPayments = insertPayments.partial()

export const selectInvoice = toZodV4SchemaTyped(createSelectSchema(invoice));
export const selectInvoiceWithPayment = createSelectSchema(invoice).extend({payments: selectPayments})
export const insertInvoice = toZodV4SchemaTyped(createInsertSchema(invoice)
  .required({
    to: true,
    from: true,
    amount: true,
    reference: true
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  }));

// @ts-expect-error partial exists on zod v4 type
export const patchInvoice = insertInvoice.partial()

export const invoiceRelations = relations(invoice, ({ many }) => ({
  payments: many(payments)
}))

export const paymentRelations = relations(payments, ({ one }) => ({
  organization: one(organization, {
    fields: [payments.orgId],
    references: [organization.id]
  }),
  invoice: one(invoice, {
    fields: [payments.invoiceId],
    references: [invoice.id]
  })
}))
