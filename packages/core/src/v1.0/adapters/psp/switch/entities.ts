
export type SwitchOfframpInitDto = {
	usdAmount: number;
	country: string,
	asset: string,
	beneficiary: {
		holder_type: "INDIVIDUAL";
		holder_name: string;
		account_number: string;
		bank_code: string;
	},
	currency: string,
	sender_name: string;
	callback_url: string;
	reference: string;
	reason: "REMITTANCE";
	developer_fee: number
	developer_recipient: string;
	/**
	 * @param static — Static address for continous offramp
	 */
	static: boolean;
}

export type SwitchOfframpInitResponse = {
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
  }


export type SwitchOnrampInitResponse = {
    success: boolean;
    message: string;
    timestamp: string;
    data: {
      [key: string]: any;
			deposit: {
				amount: number;
				bank_name: string;
        bank_code: string;
        account_name: string;
				account_number: string;
				note: Array<string>;
      }
    }
  }

  export type SwitchOnrampInitDto = {
		amount: number;
		asset: string;
		beneficiary: {
			holder_type: "INDIVIDUAL";
			holder_name: string;
			wallet_address: string;
		};
		callback_url: string;
		reference: string;
		country: string;
		reason: "REMITTANCES";
		channel: 'BANK';
		currency: string;
		exact_output: boolean;
		developer_fee: number;
		developer_recipient: string;
	}


	export type SwitchStatusResponse = {
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
	}

export type SwitchStatusDto = {
	reference: string;
	}

export type SwitchRateDto = {
	direction: "offramp" | "onramp";
	asset: string;
	country: string;
	currency: string;
}

export type SwitchLookupBankResponse = {
    success: boolean;
    message: string;
    timestamp: string;
    data: {
				bank_code: string;
				account_number: string;
				account_name: string;
    }
  }

export type SwitchLookupBankDto = {
		country: string;
		accountNumber: string;
		bankCode: string;
  }


export type SwitchBanklistDto = {
	country: string;
  }

  export type SwitchBanklistResponse = {
      success: boolean;
      message: string;
      timestamp: string;
			data: Array<{
				country: string;
				code: string;
				name: string;
      }>
    }
