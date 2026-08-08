import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateDcaInvestment,
  calculatePortfolioTotal,
  calculateProfitLoss
} from "../src/index.js";

test("calculateProfitLoss returns amount and percentage", () => {
  assert.deepEqual(calculateProfitLoss(800, 1_000), { amount: 200, percentage: 25 });
});

test("calculateProfitLoss handles a zero cost basis", () => {
  assert.deepEqual(calculateProfitLoss(0, 50), { amount: 50, percentage: 0 });
});

test("calculateDcaInvestment returns invested capital and units", () => {
  assert.deepEqual(calculateDcaInvestment(100, 12, 600), { invested: 1_200, units: 2 });
});

test("calculateDcaInvestment validates period count", () => {
  assert.throws(() => calculateDcaInvestment(100, 1.5, 600), RangeError);
});

test("calculatePortfolioTotal aggregates holdings", () => {
  assert.equal(calculatePortfolioTotal([
    { amount: 0.5, price: 60_000 },
    { amount: 2, price: 3_000 }
  ]), 36_000);
});
