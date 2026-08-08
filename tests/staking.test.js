import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCompoundedStaking,
  calculateStakingReward
} from "../src/index.js";

test("calculateStakingReward prorates annual yield", () => {
  assert.equal(calculateStakingReward(1_000, 10, 365), 100);
  assert.equal(calculateStakingReward(1_000, 10, 182.5), 50);
});

test("calculateStakingReward rejects negative periods", () => {
  assert.throws(() => calculateStakingReward(1_000, 10, -1), RangeError);
});

test("calculateCompoundedStaking compounds rewards", () => {
  assert.ok(Math.abs(calculateCompoundedStaking(1_000, 12, 12, 1) - 1_126.8250301319697) < 1e-9);
});
