import test from "node:test";
import assert from "node:assert/strict";
import { keccak256, stringToHex, zeroHash } from "viem";
import {
  createPortfolioSnapshot,
  createSnapshotRegistryReader
} from "../demo/lib/snapshotRegistry.js";

const account = "0x0000000000000000000000000000000000000001";
const registry = "0x0000000000000000000000000000000000000002";

test("portfolio snapshots are deterministic and sorted by symbol", () => {
  const first = createPortfolioSnapshot(account, [
    { symbol: "USDC", amount: 100, price: 1 },
    { symbol: "ETH", amount: 0.5, price: 3_000 },
    { symbol: "WETH", amount: 0, price: 3_000 }
  ]);
  const second = createPortfolioSnapshot(account, [
    { symbol: "ETH", amount: 0.5, price: 3_000 },
    { symbol: "USDC", amount: 100, price: 1 }
  ]);

  assert.equal(first.hash, second.hash);
  assert.equal(first.hash, keccak256(stringToHex(first.canonicalPayload)));
  assert.equal(first.assetCount, 2);
  assert.equal(first.totalValueCents, 160_000n);
  assert.deepEqual(first.payload.assets.map((asset) => asset.symbol), ["ETH", "USDC"]);
});

test("portfolio snapshots reject invalid or empty input", () => {
  assert.throws(() => createPortfolioSnapshot("invalid", []), /valid EVM/);
  assert.throws(() => createPortfolioSnapshot(account, [{ symbol: "ETH", amount: 0, price: 1 }]), /positive asset/);
  assert.throws(() => createPortfolioSnapshot(account, [{ symbol: "ETH", amount: -1, price: 1 }]), /positive asset/);
});

test("registry reader verifies Base Sepolia and maps contract state", async () => {
  const reader = createSnapshotRegistryReader({
    getChainId: async () => 84_532,
    getBlockNumber: async () => 30_000_000n,
    readContract: async ({ functionName }) => functionName === "snapshotCount"
      ? 3n
      : [zeroHash, 0n, 0, 0n]
  }, registry);

  assert.deepEqual(await reader.getNetworkStatus(), { chainId: 84_532, blockNumber: 30_000_000n });
  assert.deepEqual(await reader.getAccountSnapshot(account), {
    assetCount: 0,
    count: 3n,
    portfolioHash: zeroHash,
    recordedAt: 0,
    totalValueCents: 0n,
    hasSnapshot: false
  });
});

test("registry reader rejects missing deployment and wrong network", async () => {
  const missing = createSnapshotRegistryReader({ getChainId: async () => 84_532 }, "");
  await assert.rejects(() => missing.getAccountSnapshot(account), /not deployed/);

  const wrongNetwork = createSnapshotRegistryReader({
    getChainId: async () => 1,
    getBlockNumber: async () => 1n
  }, registry);
  await assert.rejects(() => wrongNetwork.getNetworkStatus(), /Expected Base Sepolia/);
});
