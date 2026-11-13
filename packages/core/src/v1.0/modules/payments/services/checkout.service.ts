/**
 * Factory class for checkout business logic in relation to merchant
 */

import {
  type InsertInvoice,
  type PaymentMeta,
} from '@core/adapters/db/schema/invoice'
import {
  type InsertTransaction,
  type SelectTransaction,
} from '@core/adapters/db/schema/transaction'
import InvoiceRepository from '../repositories/invoice.repository'
import TransactionRepository from '../repositories/transaction.repository'
import { PSPAdapter } from '@core/adapters/psp/base.adapter'
import { SwitchAdapter } from '@core/adapters/psp/switch'
import {
  PaymentDetailsDto,
  PaymentDetailsReturn,
} from '../entities/checkout.entitie'
import {
  generateAccount,
  getChain,
  TOKEN_ADDRESSES,
} from '../utils/wallet.utils'
import { Address } from 'viem'

export default class CheckoutService {
  constructor(
    private invoiceRepository: InvoiceRepository,
    private transactionRepository: TransactionRepository,
    private adapter: PSPAdapter<SwitchAdapter>,
    private cryptoAdapterConfig: {
      environment: string
      zeroDevRPC: string
      encryptionKey: string
    },
  ) {}

  async createInvoice(
    data: InsertInvoice,
    payClientUrl: string = process.env.VITE_PAY_CLIENT_URL || 'pay.baggit.link',
  ) {
    const invoice = await this.invoiceRepository.createInvoice(
      data,
      payClientUrl,
    )

    return {
      reference: invoice.reference,
      ...invoice.payment,
    }
  }

  // TODO: Handle checkout/payment life cycle
  async getInvoice(id: string) {
    return await this.invoiceRepository.get(id)
  }

  async updatePaymentMethod(
    data: Pick<PaymentMeta, 'method' | 'currency'>,
    id: string,
  ) {
    const currentInvoice = await this.invoiceRepository.getWithOrg(id)
    const patchedInvoice = await this.invoiceRepository.patchInvoice(
      { payment: { ...data, url: currentInvoice.payment.url } },
      id,
    )

    const paymentDetails = await this.makePaymentDetails(
      id,
      currentInvoice.orgId,
      {
        currency: data.currency,
        method: data.method as any,
        amount: patchedInvoice.amount, // TODO: explore always pre-converting the amount based on currency/asset
        country: patchedInvoice.metadata.customer.countryCode,
        orgAddresses: {
          evm: currentInvoice.organization.metadata?.address || '', // makeNewAddress with `orgId` field if address null
        },
      },
    )
    return { ...patchedInvoice, details: paymentDetails.details }
  }

  async handleWebhook(
    body: any,
    params: {
      pspId: string
      extra?: string
    },
  ): Promise<{
		code: 200 | 400;
		response: { message: string; status: string };
	}> {
		// handle for both switch and alchemy

    return {
      code: 200,
      response: { message: 'Webhook processed', status: 'success' },
    }
  }

  private async makePaymentDetails(
    invoiceId: string,
    orgId: string,
    dto: PaymentDetailsDto,
  ): Promise<{
    transaction: SelectTransaction
    details: PaymentDetailsReturn
  }> {
    // Confirm that a transaction for the entityId doesn't already exist
    // If it doens't create new transaction entry with PSP adapter
    // TODO: Based on currency, method and country — Find best psp route to handle transaction and filter by fee and availability
    // > Data all stored and identified with nats-messaging

    const existing = await this.transactionRepository.get(invoiceId)

    if (existing) {
      // Return already created payment details for transaction, check details validity, if invalid create new
      // Compare payment methods, and if details still valid — Return same details
    }

    // If transaction with invoiceId as settledForId doesn't exist yet create it
    let details:
      | {
          method: 'bank-transfer'
          [key: string]: any
          deposit: {
            amount: number
            bank_name: string
            bank_code: string
            account_name: string
            account_number: string
            note: Array<string>
          }
        }
      | {
          method: 'crypto'
          deposit: {
            encryptedPk: string
            address: string
            fromBlock: number
          }
        }
    switch (dto.method) {
      case 'bank-transfer': {
        const result = await this.adapter.initOnramp({
          amount: dto.amount!,
          asset: 'bsc:usdc',
          beneficiary: {
            holder_type: 'INDIVIDUAL',
            holder_name: `Baggit Innov`,
            wallet_address: dto.orgAddresses.evm!,
          },
          callback_url: this.adapter.makePSPCallbackUrl(invoiceId),
          reference: invoiceId, // Could want pure UUID
          country: dto.country!,
          reason: 'REMITTANCES',
          channel: 'BANK',
          currency: dto.currency,
          exact_output: true,
          developer_fee: this.adapter.fee.rate,
          developer_recipient: this.adapter.fee.address,
        })
        details = { method: 'bank-transfer', deposit: result.deposit }
        break
      }
      case 'crypto': {
        const account = await this.getCryptoPaymentRequirements()
        details = { method: 'crypto', deposit: account }
      }

      default: {
        throw new Error('Method not recognised!')
      }
    }

    const transaction = await this.transactionRepository.create({
      settledForId: invoiceId,
      entityId: orgId,
      entityType: 'org',
      asset: {
        amount: dto.amount!,
        rate: 0,
        ...(details.method === 'bank-transfer'
          ? {
              in: {
                name: 'Nigerian Naira',
                symbol: dto.currency,
                country: dto.country!,
              },
              out: {
                token: '',
                symbol: dto.currency,
                tokenAddress: ``,
              },
            }
          : {
              in: {
                token: '',
                symbol: dto.currency,
                tokenAddress: ``,
              },
            }),
      },
      medium: {
        id: details.method === 'bank-transfer' ? this.adapter.id : 'internal',
        baseAction: 'collection',
        ...(details.method === 'bank-transfer'
          ? { fee: details.deposit.amount - (dto.amount || 0) } // build fee
          : {
              network: 'bsc',
              chainId: getChain(this.cryptoAdapterConfig.environment, 'bsc').id,
              fee: 0, //  calcualte fee for smart account payment
            }),
      },
      metadata: {
        callbackUrl: ``,
        ...details.deposit,
      },
    })
    return { transaction, details }
  }

  private async getCryptoPaymentRequirements(
    passphrase?: string,
    encryptedPk?: string,
    address?: Address,
  ) {
    const chain = getChain(this.cryptoAdapterConfig.environment, 'bsc')
    // TODO: Rework function — and create unti test for
    return await generateAccount(
      this.cryptoAdapterConfig.zeroDevRPC,
      chain,
      this.cryptoAdapterConfig.encryptionKey,
      passphrase,
      encryptedPk,
      address,
    )
  }
}
