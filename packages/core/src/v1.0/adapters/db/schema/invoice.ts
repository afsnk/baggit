import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { generateId } from "@core/utils"
import { toZodV4SchemaTyped } from "@core/zod-utils"
import { organization } from "./auth"

export const invoice = sqliteTable("invoice", {
  id: text("id").primaryKey().$defaultFn(() => generateId('inv')),
  subject: text("subject").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency", { enum: ["ngn", "usd", "gbp"] }).notNull(),
  reference: text("reference").notNull(),
  orgId: text("org_id").notNull().references(() => organization.id),
	memo: text("memo"),
	payment: text("payment", { mode: "json" }).$type<PaymentMeta>().notNull(),
	metadata: text("metadata", { mode: "json" }).$type<InvoiceMeta>().notNull(),
	redirectUrl: text("redirect_url"),
	// return back to redirect or webhook what ever is stored here
  callbackMetadata: text("callback_metadata", {mode: "json"}).$type<{[key: string]: any}>(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
		.$onUpdate(() => new Date()),
	nextPayAt: integer({ mode: "timestamp" }),
}, (table) => [
  index("invoice_reference_idx").on(table.reference),
])

export type PaymentMeta = {
	method: string | "bank-transfer" | "crypto";
	currency: string;
	url: string
}

export type InvoiceMeta = {
	type: "recurring" | "onetime";
	customer: GlobalCustomer;
	items?: InvoiceItems[];
	range?: "weekly" | "monthly" | "yearly"
}

export type InvoiceItems = {
	title: string;
	quantity: number;
	price: number;
}

export type GlobalCustomer = {
	name: string;
	email?: string;
	phone?: string
	countryCode?: string;
	addressLine?: Record<string, any>
}

export const selectInvoice = toZodV4SchemaTyped(createSelectSchema(invoice));
export const insertInvoice = toZodV4SchemaTyped(createInsertSchema(invoice)
  .required({
  	subject: true,
		amount: true,
		currency: true,
		reference: true,
		orgId: true,
    payment: true,
		metadata: true,
  })
  .omit({
    id: true,
    createdAt: true,
		updatedAt: true,
    nextPayAt: true,
  }));

// @ts-expect-error partial exists on zod v4 type
export const patchInvoice = insertInvoice.partial()

export const invoiceRelations = relations(invoice, ({ one }) => ({
	organization: one(organization, {
		fields: [invoice.orgId],
		references: [organization.id]
	})
}))

export type SelectInvoice = z.infer<typeof selectInvoice>;
export type InsertInvoice = z.infer<typeof insertInvoice>;
export type PatchInvoice = z.infer<typeof patchInvoice>;
