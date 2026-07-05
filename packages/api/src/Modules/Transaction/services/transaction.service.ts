import env from "@/Core/Config/env";
import { TTransaction } from "@/Core/DB/schema/transaction";
import { Cypher } from "@/Core/Lib/wallet/cypher.utils";
import { getChain, refactoredGetLogs, runTransaction, TOKEN_ADDRESSES } from "@/Core/Lib/wallet/wallet.utils";
import { Address, Chain, encodeFunctionData, formatUnits, Hex, parseAbi, parseUnits } from "viem";



class Transaction {
  constructor() { }

  async confirmTransferIn(transaction: TTransaction & {payment: any}) {
    const chain = getChain(transaction.network);
    const token = TOKEN_ADDRESSES[chain.id][`${transaction.asset}`];
    const { hasTransferEvent, decodedLog } = await refactoredGetLogs(chain, transaction.metadata?.fromBlock, transaction.metadata.address!, token.address as Address);

    const amountSent = Number(formatUnits((decodedLog?.args.value ?? 0n), token.decimal));

    const amountInUSD = this.convertToUSD(transaction.payment?.amount)

    // Confirm amount send
    const amountMatch = amountSent >= amountInUSD;

    return {
      hasTransferEvent,
      amountSent,
      amountMatch,
      decodedLog
    }
  }

  async collectFeeAndPayout(pk: string, transaction: TTransaction, amountSent: number) {
    const chain = getChain(transaction.network);
    const token = TOKEN_ADDRESSES[chain.id][`${transaction.asset}`];

    return await runTransaction(
      Cypher.decrypt(pk, env.ENC_KEY) as Hex,
      chain,
      token.address as Address,
      [
        encodeFunctionData({
          abi: parseAbi([
            "function transfer(address to, uint256 amount) external returns (bool)",
          ]),
          functionName: "transfer",
          args: [
            `0x3a91a76d654e24021eec78472d06c5d8846b6dee`, // Send to mercahnt
            parseUnits((amountSent - (amountSent * 0.05)).toString(), token.decimal),
          ],
        }),
        encodeFunctionData({
          abi: parseAbi([
            "function transfer(address to, uint256 amount) external returns (bool)",
          ]),
          functionName: "transfer",
          args: [
            env.FEE_COLLECTION_ADDRESS as Address, // collect fee
            parseUnits((amountSent * 0.05).toString(), token.decimal),
          ],
        }),
      ],
    ).then((receipt) => {
      console.log(`Reciept of payout transaction`, { receipt });
      return receipt;
    }).catch(error => console.log(`Error sweeping funds`, { error }));
  }

  private convertToUSD(nairaAmount: number) {
    const rate = 1400
    return (nairaAmount/rate)
  }

  private convertToNGN(usdAmount: number) {
    const rate = 1400;
    return (usdAmount*rate)
  }
}


export default new Transaction()
