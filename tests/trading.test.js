import test from "node:test";
import assert from "node:assert/strict";
import {
  calculatePositionSize,
  calculateRiskReward,
  calculateSlippage
} from "../src/index.js";

test("calculatePositionSize respects account risk", () => {
  assert.equal(calculatePositionSize(10_000, 1, 100, 95), 20);
});

test("calculatePositionSize rejects a zero stop distance", () => {
  assert.throws(() => calculatePositionSize(10_000, 1, 100, 100), RangeError);
});

test("calculateSlippage returns signed percentage", () => {
  assert.equal(calculateSlippage(100, 101), 1);
  assert.equal(calculateSlippage(100, 99), -1);
});

test("calculateRiskReward compares reward with risk", () => {
  assert.equal(calculateRiskReward(100, 95, 115), 3);
});
