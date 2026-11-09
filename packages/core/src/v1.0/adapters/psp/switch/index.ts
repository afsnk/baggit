/**
 * Switch PSP adapter, integrate http endpoints, handle/return errors, retries, timeouts with better-result
 * implement BasePSPAdapter
 */

import { betterFetch } from "@better-fetch/fetch";
import { SwitchBanklistDto, SwitchBanklistResponse, SwitchLookupBankDto, SwitchLookupBankResponse, SwitchOfframpInitDto, SwitchOfframpInitResponse, SwitchOnrampInitDto, SwitchOnrampInitResponse, SwitchRateDto, SwitchStatusDto, SwitchStatusResponse } from "./entities";
import { PSPAdapter } from "../base.adapter";


class SwitchAdapter extends PSPAdapter {
	constructor(private baseUrl: string, private apiKey: string) { super() }

	id: string = 'switch';

	async lookup(dto: SwitchLookupBankDto) {
		const { data: lookupInstitute, error } = await betterFetch<SwitchLookupBankResponse>(`${this.baseUrl}/institution/lookup`, {
      method: "post",
			body: JSON.stringify({
				country: dto.country || "NG",
			  beneficiary: {
			    account_number: dto.accountNumber,
			    bank_code: dto.bankCode
			  }
      }),
      headers: {
        "x-service-key": this.apiKey,
        "content-type": "application/json"
      },
    });

		if (error) {
			console.error(`Failed to get account name`, { error })
			throw error
		}

		return lookupInstitute.data
	}

	async initOfframp(dto: SwitchOfframpInitDto) {
		const { data: payoutResponse, error } = await betterFetch<SwitchOfframpInitResponse>(`${this.baseUrl}/offramp/initiate`, {
      method: "post",
			body: JSON.stringify(dto),
      headers: {
        "x-service-key": this.apiKey,
        "content-type": "application/json"
      },
		});

		if (error) {
			// TODO: use evlogger for error capture in adapters
			console.error(`Failed to initiate payout`, { error })
			throw error;
		}

		return payoutResponse.data
	}

	async initOnramp(dto: SwitchOnrampInitDto) {
		const { data: onrampInitResponse, error } = await betterFetch<SwitchOnrampInitResponse>(`${this.baseUrl}/onramp/initiate`, {
      method: "post",
      body: JSON.stringify(dto),
      headers: {
        "x-service-key": this.apiKey,
        "content-type": "application/json"
      },
    });

    if (error) {
      console.error(`Failed to initiate off-ramp request`, {
        error
      })
      throw error;
    }

    return onrampInitResponse.data;
	}

	async status(dto: SwitchStatusDto) {
		const { data: statusResponse, error } = await betterFetch<SwitchStatusResponse>(`${this.baseUrl}/status`, {
      method: "get",
      query: {
        reference: dto.reference,
      },
      headers: {
        "x-service-key": this.apiKey,
        "content-type": "application/json"
      },
    });

    if (error) {
      console.error(`Failed to existing payment details request`, {
        error
      })
      throw error;
    }

    return statusResponse.data;
	}

	async rate(dto: SwitchRateDto) {
		const { data: rateData, error} = await betterFetch<{
      success: boolean
      message: string
      timestamp: string
      data: {
        rate: number
      }
    }>(`${this.baseUrl}/${dto.direction}/rate`, {
      headers: {
        "x-service-key": this.apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        asset: dto.asset,
        country: dto.country,
        currency: dto.currency
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


	async bankList(dto: SwitchBanklistDto) {
		const { data: bankList, error } = await betterFetch<SwitchBanklistResponse>(`${this.baseUrl}/institution`, {
			method: "get",
			query: {
				country: dto.country || "NG"
			},
      headers: {
        "x-service-key": this.apiKey,
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

}


export {SwitchAdapter}
