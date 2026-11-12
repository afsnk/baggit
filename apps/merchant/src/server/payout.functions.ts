import { payout } from '#/lib/payout'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

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
				country: "NG"
			});

			return {
				accountNumber: result.account_number,
				bankCode: result.bank_code,
				accountName: result.account_name,
			}
    } catch (error: any) {
      console.log(`Failed to get account name`, { error })
      throw error
    }
  })

export const getBanks = createServerFn({ method: 'GET' }).handler(async () => {
  try {
		const banks = await payout.adapter.bankList({ country: "NG" });
    return banks
  } catch (error: any) {
    console.log(`Failed to get banks`, { error })
    throw error
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
  .handler(async () => {
    try {
			// TODO: Create payout request from merchant wallet
    } catch (error: any) {
      console.log(`Failed to create payout`, { error })
      throw error
    }
  })
