/**
 * Handle Transaction service database read/write
 */

import { DB } from "@core/adapters";
import { transaction, type SelectTransaction, type InsertTransaction, type PatchTransaction } from "@core/adapters/db/schema/transaction";
import { eq } from "drizzle-orm";

export default class TransactionRepository {
	constructor(private db: DB) {}

	async create(entry: InsertTransaction) {
		return await this.db.insert(transaction)
			.values({...entry})
			.returning()
			.catch((error: any) => {
				console.log(`Failed to create new transaction:—`, { error });
				throw error;
			})
	}

	async patch(entry: PatchTransaction, id: string) {
		return await this.db.update(transaction)
			.set(entry)
			.where(eq(transaction.id, id))
			.returning();
	}

	async get(merchantId: string, id: string) {
		const result = await this.db.query.transaction.findFirst({
			where: (fields, ops) => ops.and(ops.eq(fields.id, id), ops.eq(fields.entityId, merchantId)),
			with: {
				order: true,
				invoice: true,
				org: true,
			}
		}).catch((error: any) => {
			console.log(`Failed to fetch transaction for merchant ${merchantId} with id: ${id}:—`, { error });
			throw error;
		});

		return result;
	}

	async getAll(merchantId: string, filters?: {}) {
		const result = await this.db.query.transaction.findMany({
			where: (fields, ops) => ops.and(ops.eq(fields.entityType, 'org'), ops.eq(fields.entityId, merchantId)),
			with: {
				order: true,
				invoice: true,
				org: true,
			}
		}).catch((error: any) => {
			console.log(`Failed to fetch transactions for merchant ${merchantId}:—`, { error });
			return [];
		});

		return result;
	}
}
