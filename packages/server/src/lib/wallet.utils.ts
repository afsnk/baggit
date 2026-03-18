import type { Address, Chain, Log } from "viem";

import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_3 } from "@zerodev/sdk/constants";
import { createPublicClient, extractChain, http, parseAbi, parseAbiItem, parseEventLogs } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia, bsc, bscTestnet } from "viem/chains";

import env from "@/env";

import { Cypher } from "./cypher.utils";

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
    pk: Cypher.encrypt(privateKey, env.ENC_KEY).encrypted,
    address: account.address,
    fromBlock: Number(await publicClient.getBlockNumber()),
  };
}

export async function runTransaction(privateKey: `0x${string}`, chain: Chain, contractAddress: Address, data: `0x${string}`[]): Promise<any> {
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
    calls: data?.map((d: `0x${string}`) => ({
      to: contractAddress,
      value: 0n,
      data: d,
    })),
  }).catch((error) => {
    console.log("Error runnning transaction", { error });
    throw error;
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt;
}

const CHUNK_SIZE = 500n;
const INITIAL_RANGE = 1000n;
const MAX_EXPAND_RANGE = 100_000n;
const EXPAND_STEP = 500n;

export async function refactoredGetLogs(
  chain: Chain,
  fromBlock: number,
  toAddress: Address,
  contractAddress: Address,
) {
  const transferEventAbi = parseAbiItem([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  const publicClient = createPublicClient({
    transport: http(),
    chain,
  });

  console.log("Params to check on", { toAddress, contractAddress, fromBlock });

  const latestBlock = BigInt(await publicClient.getBlockNumber());
  const startBlock = BigInt(fromBlock);

  // ── Helper: fetch all logs in [start, end] in 500-block chunks ────────────
  async function fetchLogsInRange(
    rangeStart: bigint,
    rangeEnd: bigint,
  ): Promise<Log[]> {
    const effectiveEnd = rangeEnd < latestBlock ? rangeEnd : latestBlock;
    if (rangeStart > effectiveEnd)
      return [];

    const allLogs: Log[] = [];
    let cursor = rangeStart;

    while (cursor <= effectiveEnd) {
      const chunkEnd
        = cursor + CHUNK_SIZE - 1n < effectiveEnd
          ? cursor + CHUNK_SIZE - 1n
          : effectiveEnd;

      console.log(`Fetching logs chunk [${cursor} → ${chunkEnd}]`);

      const chunkLogs = await publicClient.getLogs({
        address: contractAddress,
        event: transferEventAbi,
        args: { to: toAddress },
        fromBlock: cursor,
        toBlock: chunkEnd,
        strict: true,
      });

      allLogs.push(...chunkLogs);
      cursor = chunkEnd + 1n;
    }

    return allLogs;
  }

  // ── Helper: decode & find the relevant Transfer log ───────────────────────
  function findTransferLog(rawLogs: Log[]) {
    const decoded = parseEventLogs({
      abi: [transferEventAbi],
      logs: rawLogs,
    });

    console.log(
      "Decoded logs",
      JSON.stringify(
        decoded,
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
      ),
    );

    const match = decoded.find(
      log => log.eventName === "Transfer" && log.args.to === toAddress,
    );

    return { hasTransferEvent: Boolean(match), decodedLog: match };
  }

  // ── Step 1: Scan the initial fromBlock → fromBlock + 1000 range ───────────
  const initialEnd = startBlock + INITIAL_RANGE - 1n;
  console.log(`Initial scan [${startBlock} → ${initialEnd}]`);

  const initialLogs = await fetchLogsInRange(startBlock, initialEnd);
  const initialResult = findTransferLog(initialLogs);

  if (initialResult.hasTransferEvent) {
    console.log("Transfer found in initial range ✓");
    return initialResult;
  }

  // ── Step 2: Confirm on-chain balance ──────────────────────────────────────
  const balance = await publicClient.readContract({
    address: contractAddress,
    abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
    functionName: "balanceOf",
    args: [toAddress],
  });

  console.log(`Balance of ${toAddress}: ${balance}`);

  if (balance === 0n) {
    console.log("No balance and no logs found.");
    return { hasTransferEvent: false, decodedLog: undefined };
  }

  // ── Step 3: Balance confirmed — expand search forward in 500-block steps ──
  console.log(
    "Balance confirmed but no Transfer log yet — expanding forward search…",
  );

  let scanCursor = initialEnd + 1n;
  let totalExpanded = 0n;

  while (totalExpanded < MAX_EXPAND_RANGE) {
    if (scanCursor > latestBlock) {
      console.warn("Reached latest block — no Transfer log found.");
      break;
    }

    const chunkEnd = scanCursor + EXPAND_STEP - 1n;
    console.log(`Expanding scan [${scanCursor} → ${chunkEnd}]`);

    const expandedLogs = await fetchLogsInRange(scanCursor, chunkEnd);
    const expandedResult = findTransferLog(expandedLogs);

    if (expandedResult.hasTransferEvent) {
      console.log(`Transfer found in expanded range [${scanCursor} → ${chunkEnd}] ✓`);
      return { hasTransferEvent: true, decodedLog: expandedResult.decodedLog };
    }

    scanCursor = chunkEnd + 1n;
    totalExpanded += EXPAND_STEP;
  }

  // Balance exists but log not found within MAX_EXPAND_RANGE
  console.warn(
    "Could not locate Transfer log after full forward expansion; returning balance-confirmed flag.",
  );
  return { hasTransferEvent: true, decodedLog: undefined };
}
