import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateMarketCap,
  calculatePercentChange,
  calculateVolatility
} from "../src/index.js";

test("calculatePercentChange returns gains and losses", () => {
  assert.equal(calculatePercentChange(100, 125), 25);
  assert.equal(calculatePercentChange(200, 150), -25);
});

test("calculatePercentChange rejects a zero baseline", () => {
  assert.throws(() => calculatePercentChange(0, 10), RangeError);
});

test("calculateMarketCap multiplies price by circulating supply", () => {
  assert.equal(calculateMarketCap(2.5, 1_000_000), 2_500_000);
});

test("calculateMarketCap rejects negative inputs", () => {
  assert.throws(() => calculateMarketCap(-1, 100), RangeError);
});

test("calculateVolatility returns population standard deviation", () => {
  assert.ok(Math.abs(calculateVolatility([1, 2, 3]) - Math.sqrt(2 / 3)) < 1e-12);
});
