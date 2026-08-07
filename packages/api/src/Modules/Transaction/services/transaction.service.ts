import env from "@/Core/Config/env";
import type { TInvoice, TPayment } from "@/Core/DB/schema/payment";
import type { TTransaction } from "@/Core/DB/schema/transaction";
import { Cypher } from "@/Core/Lib/wallet/cypher.utils";
import { getBalance, getChain, runTransaction, TOKEN_ADDRESSES } from "@/Core/Lib/wallet/wallet.utils";
import { betterFetch } from "@better-fetch/fetch";
import { Address, encodeFunctionData, formatUnits, Hex, parseAbi, parseUnits } from "viem";



class Transaction {

  private alchemyWhId = {base: `wh_vusk0aa2uexyd1ue`, bsc: `wh_50uj9s18mt3g7nao`}

  constructor() { }

  // async confirmTransferIn(transaction: any & {payment: any}) {
  //   const chain = getChain(transaction.network);
  //   const token = TOKEN_ADDRESSES[chain.id][`${transaction.asset as string}`];
  //   const { hasTransferEvent, decodedLog } = await refactoredGetLogs(chain, transaction.metadata?.fromBlock!, transaction.metadata.address!, token.address as Address);

  //   const amountSent = Number(formatUnits((decodedLog?.args.value ?? 0n), token.decimal));

  //   const amountInUSD = this.convertToUSD(transaction.payment?.amount, 1395)

  //   // Confirm amount send
  //   const amountMatch = amountSent >= amountInUSD;

  //   return {
  //     hasTransferEvent,
  //     amountSent,
  //     amountMatch,
  //     decodedLog
  //   }
  // }

  async collectFeeAndPayout(pk: string, transaction: TTransaction, key: string, trxAddress: Address, merchantAddress: Address) {

    const chain = getChain(transaction.network);
    const asset = transaction.asset as "usdt" | "usdc" | "cngn";
    const token = TOKEN_ADDRESSES[chain.id][asset];
    const balance = await getBalance(transaction.network as "base" | "bsc", trxAddress, asset)

    if (balance > 0) {
      return await runTransaction(
        Cypher.decrypt(pk, key || env.ENC_KEY) as Hex,
        chain,
        token.address as Address,
        [
          encodeFunctionData({
            abi: parseAbi([
              "function transfer(address to, uint256 amount) external returns (bool)",
            ]),
            functionName: "transfer",
            args: [
              merchantAddress, // Send to mercahnt
              parseUnits(balance.toString(), token.decimal),
            ],
          }),
          // encodeFunctionData({
          //   abi: parseAbi([
          //     "function transfer(address to, uint256 amount) external returns (bool)",
          //   ]),
          //   functionName: "transfer",
          //   args: [
          //     env.FEE_COLLECTION_ADDRESS as Address, // collect fee
          //     parseUnits((amountSent * 0.05).toString(), token.decimal),
          //   ],
          // }),
        ],
      ).then((receipt) => {
        console.log(`Reciept of payout transaction`, { receipt });
        return receipt;
      }).catch(error => console.log(`Error sweeping funds`, { error }));
    } else {
      console.log(`Only non-zero balance can be swept...`)
    }
  }

  async addAddressToAlchemy(address: Address, chain: "bsc" | "base") {
    console.log(`Alchemy token`, {token: env.ALCHEMY_API_KEY})

    const { data, error } = await betterFetch<{}>(`${env.ALCHEMY_API_URL}/api/update-webhook-addresses`, {
      method: "patch",
      headers: {
        'X-Alchemy-Token': env.ALCHEMY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        webhook_id: this.alchemyWhId[chain],
        addresses_to_add: [address],
        addresses_to_remove: [`0xdc338f02185f09086985aFc26264B3AC47CDb406`],
      })
    })

    if (error) {
      console.log(`Failed to add address to alchemy webhook`, {error, whid: this.alchemyWhId[chain], address})
      throw error
    }

    return data;
	}

	async getPayoutDetails(ngnAmount: number, options: {
		accountNumber: string;
		bankCode: string;
		accountName?: string;
		reference: string;
		callbackUrl: string;
		static?: boolean;
		senderName?: string;
	}) {
		const lookupResult = await this.getAccountName(options.accountNumber, options.bankCode)

		const { data: payoutResponse, error } = await betterFetch<{
      success: boolean;
      message: string;
      timestamp: string;
      data: {
      	status: string
        type: string
        reference: string
        beneficiary: string
        rate: number
        developer_fee: {
          amount: number
          amount_usd: number
          currency: string
          network: string
        },
        source: {
          amount: number
          amount_usd: number
          network: string
          currency: string
        },
        destination: {
          amount: number
          amount_usd: number
          network: string
          currency: string
        },
        deposit: {
          amount: number
          address: string
          asset: string
          note: Array<string>
        },
        meta: any
        created_at: string
        updated_at: string
      }
    }>(`${env.SWITCH_API_URL}/offramp/initiate`, {
      method: "post",
			body: JSON.stringify({
				amount: ngnAmount,
				country: "NG",
				asset: "bsc:usdc",
				beneficiary: {
					holder_type: "INDIVIDUAL",
					holder_name: options.accountName? options.accountName : lookupResult.account_name,
					account_number: options.accountNumber,
					bank_code: options.bankCode,
				},
				currency: "NGN",
				sender_name: options.senderName,
				callback_url: options.callbackUrl,
				reference: options.reference,
				reason: "REMITTANCE",
				developer_fee: 0.5,
				developer_recipient: env.FEE_COLLECTION_ADDRESS,
				static: options.static? options.static : false
      }),
      headers: {
        "x-service-key": env.SWITCH_API_KEY,
        "content-type": "application/json"
      },
		});

		if (error) {
			console.error(`Failed to initiate payout`, { error })
			throw error;
		}

		return payoutResponse.data
	}

	async getAccountName(accountNumber: string, bankCode: string) {
		const { data: lookupInstitute, error } = await betterFetch<{
      success: boolean;
      message: string;
      timestamp: string;
      data: {
				bank_code: string;
				account_number: string;
				account_name: string;
      }
    }>(`${env.SWITCH_API_URL}/institution/lookup`, {
      method: "post",
			body: JSON.stringify({
				country: "NG",
			  beneficiary: {
			    account_number: accountNumber,
			    bank_code: bankCode
			  }
      }),
      headers: {
        "x-service-key": env.SWITCH_API_KEY,
        "content-type": "application/json"
      },
    });

		if (error) {
			console.error(`Failed to get account name`, { error })
			throw error
		}

		return lookupInstitute.data
	}

	async getBankList() {
		const { data: bankList, error } = await betterFetch<{
      success: boolean;
      message: string;
      timestamp: string;
			data: Array<{
				country: string;
				code: string;
				name: string;
      }>
    }>(`${env.SWITCH_API_URL}/institution`, {
			method: "get",
			query: {
				country: "NG"
			},
      headers: {
        "x-service-key": env.SWITCH_API_KEY,
        "content-type": "application/json"
      },
		});

		if (error) {
			console.log(`Failed to get bank list`, {
        error
      })
      throw error;
		}

		return bankList.data
	}

  async getBankTransferDetails(usdAmount: number, reference: string, address: Address, paymentId: string) {
    console.log(`Params`, {usdAmount, reference, address, paymentId})
    const { data: offrampInitResponse, error } = await betterFetch<{
      success: boolean;
      message: string;
      timestamp: string;
      data: {
        [key: string]: any;
        deposit: {
          bank_name: string
          bank_code: string;
          account_name: string;
          account_number: string
          note: Array<string>
        }
      }
    }>(`${env.SWITCH_API_URL}/onramp/initiate`, {
      method: "post",
      body: JSON.stringify({
        amount: usdAmount,
        asset: "bsc:usdc",
        beneficiary: {
          holder_type: "INDIVIDUAL",
          holder_name: "John Doe",
          wallet_address: address
        },
        callback_url: `${env.API_URL}/v1/transaction/webhook/switch/${paymentId}`,
        reference,
        country: "NG",
        reason: "REMITTANCES",
        channel: 'BANK',
        currency: 'NGN',
        exact_output: true,
        developer_fee: 0.8,
        developer_recipient: env.FEE_COLLECTION_ADDRESS
      }),
      headers: {
        "x-service-key": env.SWITCH_API_KEY,
        "content-type": "application/json"
      },
    });

    if (error) {
      console.error(`Failed to initiate off-ramp request`, {
        error
      })
      throw error;
    }

    return offrampInitResponse.data;
  }

  async getExistingBankDetails(reference: string) {
    const { data: existingResponse, error } = await betterFetch<{
      success: boolean;
      message: string;
      timestamp: string;
      data: {
        [key: string]: any;
        deposit: {
          bank_name: string
          bank_code: string;
          account_name: string;
          account_number: string
          note: Array<string>
        }
      }
    }>(`${env.SWITCH_API_URL}/status`, {
      method: "get",
      query: {
        reference,
      },
      headers: {
        "x-service-key": env.SWITCH_API_KEY,
        "content-type": "application/json"
      },
    });

    if (error) {
      console.error(`Failed to existing payment details request`, {
        error
      })
      throw error;
    }

    return existingResponse.data;
  }

  async getSwitchRate() {
    const { data: rateData, error} = await betterFetch<{
      success: boolean
      message: string
      timestamp: string
      data: {
        rate: number
      }
    }>(`${env.SWITCH_API_URL}/onramp/rate`, {
      headers: {
        "x-service-key": env.SWITCH_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        asset: "base:usdc",
        country: "NG",
        currency: "NGN"
      })
    })

    if (error) {
      console.error(`Failed to initiate off-ramp request`, {
        error
      })
      throw error;
    }

    return rateData.data.rate;
  }

  validateAmountPaid(payment: TPayment & {invoice: TInvoice}, amountSent: number) {
    const isNaira = payment.currency === "ngn" || payment.currency === "cngn";
    const invoiceAmount = payment.invoice.amount
    if (isNaira) {
      // const nairaAmount = this.convertToNGN(amountSent, payment.rate!)
      return amountSent >= payment.amount;
    }

    return amountSent >= payment.amount;
  }

  convertToUSD(nairaAmount: number, rate: number) {
    // const rate = 1400
    return (nairaAmount/rate)
  }

  convertToNGN(usdAmount: number, rate: number) {
    // const rate = 1400;
    return (usdAmount*rate)
  }
}


export default new Transaction()
