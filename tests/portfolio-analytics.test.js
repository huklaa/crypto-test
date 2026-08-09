import test from "node:test";
import assert from "node:assert/strict";
import { analyzePortfolio } from "../demo/lib/portfolioAnalytics.js";

test("demo analytics calculates value, allocation, P/L, and rebalance", () => {
  const result = analyzePortfolio([
    { symbol: "ETH", amount: 1, price: 3000, costBasis: 2500, targetAllocation: 50 },
    { symbol: "USDC", amount: 1000, price: 1, costBasis: 1000, targetAllocation: 50 }
  ]);
  assert.equal(result.total, 4000);
  assert.equal(result.holdings[0].allocation, 75);
  assert.deepEqual(result.holdings[0].profitLoss, { amount: 500, percentage: 20 });
  assert.equal(result.holdings[0].rebalance, -1000);
});
