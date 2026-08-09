import test from "node:test";
import assert from "node:assert/strict";
import { parseEther, parseUnits } from "viem";
import { createBasePortfolioReader } from "../demo/lib/baseClient.js";

const address = "0x0000000000000000000000000000000000000001";

test("Base reader verifies chain and block status", async () => {
  const reader = createBasePortfolioReader({
    getChainId: async () => 8453,
    getBlockNumber: async () => 24_000_000n
  });
  assert.deepEqual(await reader.getNetworkStatus(), { chainId: 8453, blockNumber: 24_000_000n });
});

test("Base reader combines native and ERC-20 balances", async () => {
  const reader = createBasePortfolioReader({
    getBalance: async () => parseEther("1.5"),
    readContract: async () => parseUnits("250", 6)
  });
  const holdings = await reader.readPortfolio(address, [{
    symbol: "USDC", name: "USD Coin", address, decimals: 6, defaultPrice: 1
  }]);
  assert.equal(holdings[0].amount, 1.5);
  assert.equal(holdings[1].amount, 250);
});

test("Base reader rejects invalid addresses and wrong chains", async () => {
  const reader = createBasePortfolioReader({ getChainId: async () => 1, getBlockNumber: async () => 1n });
  await assert.rejects(() => reader.getNetworkStatus(), /Expected Base mainnet/);
  await assert.rejects(() => reader.readPortfolio("not-an-address"), /valid EVM/);
});
