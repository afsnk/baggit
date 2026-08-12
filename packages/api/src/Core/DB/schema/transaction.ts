import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { toZodV4SchemaTyped } from "@/Core/Lib/zod-utils";
import { payments } from "./payment";
import { ramps } from "./ramp";
import { generateId } from "../utils";
import { relations } from "drizzle-orm";
import { organization } from "./auth";

// Carries the actual values for processing the payment like provider details
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => generateId('trx')),
  status: text("status", { enum: ["failed", "canceled", "expired", "pending", "complete"] }).default("pending"),
  network: text("network", { enum: ["base", "bsc", "solana", "stellar"] }).notNull().default("base"), // Base is still crypto
  asset: text("asset", { enum: ["usdc", "usdt", "cngn", "ngn", "usd", "gbp"] }).notNull(),
  paymentId: text("payment_id").references(() => payments.id, {onDelete: "no action"}),
  rampId: text("ramp_id").references(() => ramps.id, { onDelete: "no action" }),
  orgId: text("org_id").references(() => organization.id),
  metadata: text("metadata", { mode: "json" }).$type<{
    address?: `0x${string}`;
    pk?: string;
    collectionHash?: `0x${string}`;
    payoutHash?: `0x${string}`;
    fromBlock?: number;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    bankCode?: string;
    [x: string]: any;
  }>().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  index("transactions_status_idx").on(table.status),
  index("transactions_network_idx").on(table.network),
  index("transactions_asset_idx").on(table.asset),
  index("transactions_paymentId_idx").on(table.paymentId)
]);

export const selectTransactions = toZodV4SchemaTyped(createSelectSchema(transactions));
export const cleanedTransaction = createSelectSchema(transactions).omit({ metadata: true }).extend({
  payment: createSelectSchema(payments).nullable().optional(),
  ramp: createSelectSchema(ramps).nullable().optional(),
});
export const insertTransactions = toZodV4SchemaTyped(createInsertSchema(
  transactions,
).required({
  network: true,
  asset: true,
  paymentId: true,
  orgId: true,
}).omit({
  metadata: true,
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchTransactions = insertTransactions.partial();


// Ties payment and ramp to transaction shema
export const transactionRelations = relations(transactions, ({ one }) => ({
  payment: one(payments, {
    fields: [transactions.paymentId],
    references: [payments.id]
  }),
  ramp: one(ramps, {
    fields: [transactions.rampId],
    references: [ramps.id]
  }),
  organization: one(organization, {
    fields: [transactions.orgId],
    references: [organization.id]
  })
}))


export type TTransaction = z.infer<typeof selectTransactions>
export type CleanedTransaction = z.infer<typeof cleanedTransaction>
