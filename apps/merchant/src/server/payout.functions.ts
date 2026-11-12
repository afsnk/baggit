import { payout } from '#/lib/payout'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

/**
 * Surface a friendly message to the client while logging the full error server-side.
 * Raw errors from the adapter (network/HTTP stack traces, etc.) should never be
 * serialized to the browser as-is.
 */
function toClientError(error: unknown, fallbackMessage: string): Error {
  console.error(`[server-fn] ${fallbackMessage}`, error)
  const message =
    error instanceof Error && error.message
      ? error.message
      : fallbackMessage
  return new Error(message)
}

export const lookupBank = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      bankCode: z.string(),
      accountNumber: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const result = await payout.adapter.lookup({
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        country: 'NG',
      })

      return {
        accountNumber: result.account_number,
        bankCode: result.bank_code,
        accountName: result.account_name,
      }
    } catch (error) {
      throw toClientError(error, 'Could not look up this bank account. Please double-check the bank and account number and try again.')
    }
  })

export const getBanks = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const banks = await payout.adapter.bankList({ country: 'NG' })
    return banks
  } catch (error) {
    throw toClientError(error, 'Could not load the list of banks. Please try again.')
  }
})

export const createPayout = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      accountNumber: z.string(),
      accountName: z.string(),
      bankCode: z.string(),
      amount: z.number(),
      reference: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      // TODO: Create payout request from merchant wallet
      console.log(`[server-fn] createPayout called`, data)
      throw new Error('Payout requests are not available yet. Please try again later.')
    } catch (error) {
      throw toClientError(error, 'Could not create the payout request. Please try again.')
    }
  })
