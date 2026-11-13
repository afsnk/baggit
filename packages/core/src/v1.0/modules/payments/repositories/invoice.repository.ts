/**
 * Handle checkout service database read/write
 */

import { DB } from '@core/adapters'
import { CheckoutFilterConfig } from '../entities/checkout.entitie'
import {
  type SelectInvoice,
  type PatchInvoice,
  type InsertInvoice,
  invoice,
} from '@core/adapters/db/schema/invoice'
import { makeCheckoutUrl } from '../utils/checkout'
import { eq } from 'drizzle-orm'
import { SelectOrganization } from '@core/adapters/db/schema/auth'

export default class InvoiceRepository {
  constructor(private db: DB) {}

  async createInvoice(
    data: InsertInvoice,
    clientUrl?: string,
  ): Promise<SelectInvoice> {
    try {
      const [newInvoice] = await this.db
        .insert(invoice)
        .values({
          ...data,
          orgId: data.orgId,
        })
        .returning()

      const paymentUrl = makeCheckoutUrl(newInvoice.id, clientUrl)

      // Update with payment url
      const [updatedInvoice] = await this.db
        .update(invoice)
        .set({
          payment: {
            ...newInvoice.payment,
            url: paymentUrl,
          },
        })
        .where(eq(invoice.id, newInvoice.id))
        .returning()
        .catch((error) => {
          console.log(`Failed to update invoice`, { ...error })
          // Roll back transaction or retry update
          throw error
        })

      return updatedInvoice
    } catch (error: any) {
      // Log error here with evlog
      console.log(`Failed to create invoice`, {
        ...error,
      })
      throw error
    }
  }

  async patchInvoice(data: PatchInvoice, id: string): Promise<SelectInvoice> {
    try {
      const [patchedInvoice] = await this.db
        .update(invoice)
        .set(data)
				.where(eq(invoice.id, id))
        .returning()

      return patchedInvoice
    } catch (error: any) {
      console.log(`Failed to patch invoice`, { error })
      throw error
    }
  }

  async get(id: string): Promise<SelectInvoice> {
    try {
      const invoice = await this.db.query.invoice.findFirst({
				where: (fields, ops) => ops.eq(fields.id, id),
      })

      if (!invoice) {
        // Handle no invoice found
        throw new Error(`No invoice with ${id} found`)
      }

      return invoice
    } catch (error: any) {
      console.log(`Failed to get invoice`, { error })
      throw error
    }
	}

  async getWithOrg(id: string): Promise<SelectInvoice & {organization: SelectOrganization}> {
    try {
      const invoice = await this.db.query.invoice.findFirst({
				where: (fields, ops) => ops.eq(fields.id, id),
				with: {
					organization: true,
				}
      })

      if (!invoice) {
        // Handle no invoice found
        throw new Error(`No invoice with ${id} found`)
      }

      return invoice
    } catch (error: any) {
      console.log(`Failed to get invoice`, { error })
      throw error
    }
	}

  static async getAll(merchantId: string, filters?: CheckoutFilterConfig) {}
}

export type InvoiceWithOrg = NonNullable<Awaited<ReturnType<InvoiceRepository['get']>>>;
