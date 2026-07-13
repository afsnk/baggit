import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { generateId } from "../utils"
import { toZodV4SchemaTyped } from "@/Core/Lib/zod-utils"
import { organization } from "./auth"
import { relations } from "drizzle-orm"
import { transactions } from "./transaction"

export const invoice = sqliteTable("invoice", {
  id: text("id").primaryKey().$defaultFn(() => generateId('inv')),
  to: text("to").notNull(),
  from: text("from").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency", { enum: ["ngn", "usd", "gbp"] }).notNull(),
  reference: text("reference").notNull(),
  orgId: text("org_id").notNull().references(() => organization.id),
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
  currency: text("currency", { enum: ["ngn", "usd", "gbp", "cngn", "usdt", "usdc"] }).notNull(), // Lock in a currency
  method: text("method", {enum: ['bank-transfer', 'ussd', 'crypto', 'applepay', 'googlepay']}).default("crypto").notNull(), // Lock in a method — when method is bank transfer on-ramp is triggered
  callbackUrl: text("callback_url").notNull(),
  amount: real("amount").notNull().default(0),
  rate: real("currency_rate").default(1395),
  orgId: text("org_id").notNull().references(() => organization.id),
  invoiceId: text("invoice_id").notNull().references(() => invoice.id, {onDelete: "restrict"}),
  metadata: text("metadata", { mode: "json" }).$type<{
    [key: string]: any;
    url: string;
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
export const selectInvoiceWithPayment = createSelectSchema(invoice).extend({payments: z.array(selectPayments)})
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

export const invoiceRelations = relations(invoice, ({ many, one }) => ({
  payments: many(payments),
  organization: one(organization, {
    fields: [invoice.orgId],
    references: [organization.id]
  })
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

export type TPayment = z.infer<typeof selectPayments>;
export type TInvoice = z.infer<typeof selectInvoice>;
