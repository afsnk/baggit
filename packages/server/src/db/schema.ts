import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { toZodV4SchemaTyped } from "@/lib/zod-utils";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  reference: text("reference").notNull(),
  amount: real("amount").notNull(),
  callbackUrl: text("callback_url").notNull().default("https://webhook.site/a6428992-34ce-4b09-90c0-7fe778d762e4"),
  status: text("status", { enum: ["pending", "failed", "complete"] }).default("pending"),
  network: text("network", { enum: ["base", "bsc"] }).notNull().default("base"),
  asset: text("asset", { enum: ["usdc", "usdt", "cngn"] }).notNull(),
  metadata: text("metadata", { mode: "json" }).$type<{
    address: `0x${string}`;
    pk: `0x${string}`;
    collectionHash?: `0x${string}`;
    payoutHash?: `0x${string}`;
    fromBlock: number;
    [x: string]: any;
  }>().notNull(),
  merchantMetadata: text("merchant_metadata", { mode: "json" }).$type<{
    [x: string]: any;
  }>(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectTransactions = toZodV4SchemaTyped(createSelectSchema(transactions));
export const cleanedTransaction = toZodV4SchemaTyped(createSelectSchema(transactions).omit({ metadata: true }));
export const insertTransactions = toZodV4SchemaTyped(createInsertSchema(
  transactions,
).required({
  amount: true,
  reference: true,
  network: true,
  asset: true,
  callbackUrl: true,
}).omit({
  metadata: true,
  id: true,
  createdAt: true,
  updatedAt: true,
}));

// @ts-expect-error partial exists on zod v4 type
export const patchTransactions = insertTransactions.partial();
