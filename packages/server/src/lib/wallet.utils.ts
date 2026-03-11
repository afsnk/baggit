import type { Address, Chain } from "viem";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_3 } from "@zerodev/sdk/constants";
import { createPublicClient, extractChain, http, parseAbiItem, parseEventLogs } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia, bsc, bscTestnet } from "viem/chains";

import env from "@/env";

export const TOKEN_ADDRESSES = {
  [baseSepolia.id]: {
    usdc: { address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", decimal: 6 },
    usdt: { address: "0x323e78f944A9a1FcF3a10efcC5319DBb0bB6e673", decimal: 6 },
    cngn: { address: "0x929A08903C22440182646Bb450a67178Be402f7f", decimal: 6 },
  },
  [base.id]: {
    usdc: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimal: 6 },
    usdt: { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimal: 6 },
    cngn: { address: "0x46C85152bFe9f96829aA94755D9f915F9B10EF5F", decimal: 6 },
  },
  [bsc.id]: {
    usdc: {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      decimal: 18,
    },
    usdt: {
      address: "0x55d398326f99059ff775485246999027b3197955",
      decimal: 18,
    },
    cngn: { address: "0xa8AEA66B361a8d53e8865c62D142167Af28Af058", decimal: 6 },
  },
  [bscTestnet.id]: {
    usdc: {
      address: "0x64544969ed7EBf5f083679233325356EbE738930",
      decimal: 18,
    },
    usdt: {
      address: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
      decimal: 18,
    },
    cngn: { address: "0x20354A3Ad3B67836ab9c6D7D82cF5e5Ddfe104dD", decimal: 6 },
  },
};

export function getChain(network: "base" | "bsc") {
  const isProd = env.NODE_ENV === "production";
  let id = 8453;
  if (isProd && network === "base") {
    id = 8453;
  }
  else if (isProd && network === "bsc") {
    id = 56;
  }
  else if (!isProd && network === "base") {
    id = 84532;
  }
  else if (!isProd && network === "bsc") {
    id = 97;
  }
  return extractChain({
    chains: [base, baseSepolia, bsc, bscTestnet],
    id: id as any,
  });
}

const entryPoint = getEntryPoint("0.7");
const kernelVersion = KERNEL_V3_3;
export async function generateAccount(chain: Chain): Promise<{ pk: string; address: string; fromBlock: number }> {
  // Construct a signer
  const privateKey = generatePrivateKey();
  const signer = privateKeyToAccount(privateKey);
  const rpc = `${env.ZERODEV_RPC}/${chain.id}`;

  // Construct a public client
  const publicClient = createPublicClient({
    // Use your own RPC provider in production (e.g. Infura/Alchemy).
    transport: http(rpc),
    chain,
  });

  // Construct a validator
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  // Construct a Kernel account
  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion,
  });

  const zerodevPaymaster = createZeroDevPaymasterClient({
    chain,
    transport: http(rpc),
  });

  // Construct a Kernel account client
  const kernelClient = createKernelAccountClient({
    account,
    chain,
    bundlerTransport: http(rpc),
    // Required - the public client
    client: publicClient,
    paymaster: {
      getPaymasterData(userOperation) {
        return zerodevPaymaster.sponsorUserOperation({ userOperation });
      },
    },
  });

  const accountAddress = kernelClient.account.address;
  console.log("My account:", accountAddress);

  return {
    pk: privateKey,
    address: account.address,
    fromBlock: Number(await publicClient.getBlockNumber()),
  };
}

export async function runTransaction(privateKey: `0x${string}`, chain: Chain, contractAddress: Address, data?: `0x${string}`): Promise<any> {
  // Construct a signer
  // const privateKey = generatePrivateKey();
  const signer = privateKeyToAccount(privateKey);
  const rpc = `${env.ZERODEV_RPC}/${chain.id}`;

  // Construct a public client
  const publicClient = createPublicClient({
    // Use your own RPC provider in production (e.g. Infura/Alchemy).
    transport: http(rpc),
    chain,
  });

  // Construct a validator
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion,
  });

  // Construct a Kernel account
  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
    kernelVersion,
  });

  const zerodevPaymaster = createZeroDevPaymasterClient({
    chain,
    transport: http(rpc),
  });

  // Construct a Kernel account client
  const kernelClient = createKernelAccountClient({
    account,
    chain,
    bundlerTransport: http(rpc),
    // Required - the public client
    client: publicClient,
    paymaster: {
      getPaymasterData(userOperation) {
        return zerodevPaymaster.sponsorUserOperation({ userOperation });
      },
    },
  });

  const hash = await kernelClient.sendTransaction({
    chain,
    data: data ?? "0x",
    value: 0n,
    to: contractAddress,
  }).catch((error) => {
    console.log("Error runnning transaction", { error });
    throw error;
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt;
}

export async function getLogs(chain: Chain, fromBlock: number, toAddress: Address, contractAddress: Address) {
  const rpc = ``;
  const transferEventAbi = parseAbiItem([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  const publicClient = createPublicClient({
    // Use your own RPC provider in production (e.g. Infura/Alchemy).
    transport: http(rpc),
    chain,
  });

  console.log(`params to check on`, {
    toAddress,
    contractAddress,
    fromBlock,
  });

  const latestBlock = Number(await publicClient.getBlockNumber());

  const logs = await publicClient.getLogs({
    address: contractAddress,
    event: transferEventAbi,
    args: {
      to: toAddress,
    },
    fromBlock: BigInt(fromBlock),
    toBlock: BigInt(latestBlock > fromBlock + 1000 ? fromBlock + 1000 : latestBlock),
    strict: true,
  });

  const decodedLogs = parseEventLogs({
    abi: [transferEventAbi],
    logs,
  });

  const hasTransferEvent = decodedLogs.some(log => log.eventName === "Transfer" && log.args.to === toAddress);
  const decodedLog = decodedLogs.find(log => log.eventName === "Transfer" && log.args.to === toAddress);
  console.log("Has transfer event", hasTransferEvent);
  console.log("Decoded logs", decodedLogs);
  return { hasTransferEvent, decodedLog };
}
