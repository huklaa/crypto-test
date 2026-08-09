import {
  createPublicClient,
  http,
  isAddress,
  keccak256,
  stringToHex,
  zeroHash
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  BASE_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_RPC_URL,
  SNAPSHOT_REGISTRY_ADDRESS
} from "./baseConfig.js";

export const SNAPSHOT_REGISTRY_ABI = [
  {
    type: "function",
    name: "latestSnapshots",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "portfolioHash", type: "bytes32" },
      { name: "totalValueCents", type: "uint128" },
      { name: "assetCount", type: "uint16" },
      { name: "recordedAt", type: "uint64" }
    ]
  },
  {
    type: "function",
    name: "snapshotCount",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "count", type: "uint256" }]
  },
  {
    type: "function",
    name: "version",
    stateMutability: "pure",
    inputs: [],
    outputs: [{ name: "", type: "string" }]
  }
];

function normalizeSnapshotNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new TypeError(`${label} must be a non-negative number`);
  return Number(number.toPrecision(15)).toString();
}

export function createPortfolioSnapshot(address, holdings) {
  if (!isAddress(address)) throw new TypeError("Enter a valid EVM wallet address");
  if (!Array.isArray(holdings)) throw new TypeError("Holdings must be an array");

  const assets = holdings
    .filter((holding) => Number(holding.amount) > 0)
    .map((holding) => ({
      symbol: String(holding.symbol).trim().toUpperCase(),
      amount: normalizeSnapshotNumber(holding.amount, "Amount"),
      priceUsd: normalizeSnapshotNumber(holding.price || 0, "Price")
    }))
    .sort((left, right) => left.symbol.localeCompare(right.symbol));

  if (assets.length === 0) throw new RangeError("At least one positive asset balance is required");

  const totalValueCentsNumber = Math.round(assets.reduce(
    (total, asset) => total + Number(asset.amount) * Number(asset.priceUsd),
    0
  ) * 100);
  if (!Number.isSafeInteger(totalValueCentsNumber)) throw new RangeError("Portfolio value exceeds safe snapshot limits");

  const payload = {
    version: 1,
    chainId: BASE_CHAIN_ID,
    account: address.toLowerCase(),
    assets
  };
  const canonicalPayload = JSON.stringify(payload);

  return {
    assetCount: assets.length,
    canonicalPayload,
    hash: keccak256(stringToHex(canonicalPayload)),
    payload,
    totalValueCents: BigInt(totalValueCentsNumber)
  };
}

export function createBaseSepoliaClient(rpcUrl = BASE_SEPOLIA_RPC_URL) {
  return createPublicClient({ chain: baseSepolia, transport: http(rpcUrl) });
}

export function createSnapshotRegistryReader(
  client = createBaseSepoliaClient(),
  contractAddress = SNAPSHOT_REGISTRY_ADDRESS
) {
  async function getNetworkStatus() {
    const [chainId, blockNumber] = await Promise.all([client.getChainId(), client.getBlockNumber()]);
    if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
      throw new Error(`Expected Base Sepolia (${BASE_SEPOLIA_CHAIN_ID}), received ${chainId}`);
    }
    return { blockNumber, chainId };
  }

  async function getAccountSnapshot(account) {
    if (!isAddress(contractAddress)) throw new Error("Snapshot registry is not deployed yet");
    if (!isAddress(account)) throw new TypeError("Enter a valid EVM wallet address");

    const [snapshot, count] = await Promise.all([
      client.readContract({
        address: contractAddress,
        abi: SNAPSHOT_REGISTRY_ABI,
        functionName: "latestSnapshots",
        args: [account]
      }),
      client.readContract({
        address: contractAddress,
        abi: SNAPSHOT_REGISTRY_ABI,
        functionName: "snapshotCount",
        args: [account]
      })
    ]);

    return {
      assetCount: Number(snapshot[2]),
      count,
      portfolioHash: snapshot[0],
      recordedAt: Number(snapshot[3]),
      totalValueCents: snapshot[1],
      hasSnapshot: snapshot[0] !== zeroHash
    };
  }

  return { contractAddress, getAccountSnapshot, getNetworkStatus };
}
