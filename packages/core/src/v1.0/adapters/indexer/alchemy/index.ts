import { betterFetch } from "@better-fetch/fetch";


class Alchemy {
	constructor(private baseUrl: string, private apiKey: string) { }

	private alchemyWhId = { base: `wh_vusk0aa2uexyd1ue`, bsc: `wh_50uj9s18mt3g7nao` };

	async addAddressToAlchemy(address: `0x${string}`, chain: "bsc" | "base") {
    console.log(`Alchemy token`, {token: this.apiKey})

    const { data, error } = await betterFetch<{}>(`${this.baseUrl}/api/update-webhook-addresses`, {
      method: "patch",
      headers: {
        'X-Alchemy-Token': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        webhook_id: this.alchemyWhId[chain],
        addresses_to_add: [address],
        addresses_to_remove: [`0xdc338f02185f09086985aFc26264B3AC47CDb406`], // Why?
      })
    })

    if (error) {
      console.log(`Failed to add address to alchemy webhook`, {error, whid: this.alchemyWhId[chain], address})
      throw error
    }

    return data;
	}
}
