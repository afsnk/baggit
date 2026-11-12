
interface BasePSPAdapter {
	id: string;
	rate(dto: { country: string; currency?: string; direction: "offramp" | "onramp" | string; }): Promise<any>;
	status(dto: { reference: string; }): Promise<any>;
	lookup(dto: { bankCode: string; accountNumber: string; }): Promise<any>;
	bankList(dto: { country: string; }): Promise<any>;
}


export abstract class PSPAdapterBase implements BasePSPAdapter {
	abstract id: string;
	abstract rate(dto: { country: string; currency?: string; direction: "offramp" | "onramp" | string; }): Promise<any>;
	abstract status(dto: { reference: string; }): Promise<any>;
	abstract lookup(dto: { bankCode: string; accountNumber: string; }): Promise<any>;
	abstract bankList(dto: { country: string; }): Promise<any>;

	// TODO: implement shared helper logger for psp
}

export type PSPAdapter<T extends BasePSPAdapter = BasePSPAdapter> = PSPAdapterBase & T;

export const PSPAdapter = PSPAdapterBase;
