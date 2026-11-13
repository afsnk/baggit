import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"
import { toZodV4SchemaTyped } from "@core/zod-utils";
import { insertInvoice, invoice, patchInvoice } from "./invoice";
import { ramps } from "./ramp";
import { generateId } from "@core/utils";
import { relations } from "drizzle-orm";
import { organization, user } from "./auth";

// Carries the actual values for processing the payment like provider details
export const transaction = sqliteTable("transactions", {
	id: text("id").primaryKey().$defaultFn(() => generateId('trx')),
  status: text("status", { enum: ["failed", "canceled", "expired", "pending", "complete"] }).default("pending"),
  settledForId: text("settled_for_id").unique().notNull(), // The primitive id being fulfilled (invoice|order)
	entityId: text("entity_id").notNull(), // ID for the entity owner of the transaction
  entityType: text("entity_type", {enum: ['org', 'user', 'anon']}).notNull(), // TYPE of the entity owner (org|user)
	medium: text("medium", { mode: "json" }).$type<Medium>(), // Base is still crypto
	asset: text("asset", { mode: "json" }).$type<Asset>().notNull(),
  receipt: text("receipt", {mode: "json"}).$type<Receipt>(),
  metadata: text("metadata", { mode: "json" }).$type<TransactionMeta>().notNull(),
  createdAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date()),
  updatedAt: integer({ mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
	index("transaction_status_idx").on(table.status),
	index("transaction_settled_for_id_idx").on(table.settledForId),
  index("transaction_entity_type_idx").on(table.entityType)
]);

export type Asset = {
	amount: number;
	rate: number;
	in?: (CryptoAsset | FiatAsset);
	out?: (CryptoAsset | FiatAsset);
	pass?: (CryptoAsset | FiatAsset)[];
};

type CryptoAsset = {
	token: string;
	symbol: string; // Token symbol
	tokenAddress: string;
}
type FiatAsset = {
	name: string;
	symbol: string; // Currency
	country: string; // e.g NGN
}

export type Medium = (CryptoRail | FiatRail);

export type CryptoRail = {
	id: string; // psp ID for internal
	baseAction: "swap" | "onramp" | "offramp" | "transfer" | "collection" | string;
	chainId: number | string;
	network: string;
	fee?: string | number | Record<string, any>;
}

// Details about the PSP Fiat rail
export type FiatRail = {
	id: string; // psp ID for internal
	baseAction: "transfer" | "payout" | "collection" | string;
	fee?: string | number | Record<string, any>;
}

export type TransactionMeta = {
	address?: `0x${string}` | string;
	callbackUrl: string;
	encryptedPk?: string;
  [x: string]: any;
}

export type Receipt = (CryptoReceipt | FiatReceipt);
type CryptoReceipt = {
	reference: string;
	hash: string;
	explorerUrl: string;
	txBlock: string | number;
	[key: string]: any;
}
type FiatReceipt = {
	refereence: string;
	bank: {
		name: string;
		code: string;
		account: {
			name: string;
			number: string;
		}
		asset?: string;
	};
	receiptUrl?: string; // Generated internally or stored from PSP
	[key: string]: any;
}
// TODO: Others like MOMO can be represented later on

export const selectTransaction = toZodV4SchemaTyped(createSelectSchema(transaction));
const internalInsert = createInsertSchema(
  transaction,
).required({
	settledForId: true,
  medium: true,
  asset: true,
  metadata: true,
  entityId: true,
  entityType: true,
}).omit({
	id: true,
  receipt: true,
  createdAt: true,
  updatedAt: true,
})
export const insertTransaction = toZodV4SchemaTyped(internalInsert);
export const patchTransaction = toZodV4SchemaTyped(internalInsert.partial())

// Polymorphic References to related tables
export const transactionRelations = relations(transaction, ({ one }) => ({
	user: one(user, {
		fields: [transaction.entityId],
		references: [user.id]
	}),
  org: one(organization, {
    fields: [transaction.entityId],
    references: [organization.id]
	}),
	order: one(ramps, {
		fields: [transaction.settledForId],
		references: [ramps.id]
  }),
	invoice: one(invoice, {
		fields: [transaction.settledForId],
		references: [invoice.id],
	})
}))

export type SelectTransaction = z.infer<typeof selectTransaction>;
export type InsertTransaction = z.infer<typeof insertTransaction>;
export type PatchTransaction = z.infer<typeof patchTransaction>;
