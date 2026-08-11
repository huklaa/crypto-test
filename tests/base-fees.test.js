import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_GAS_PRICE_ORACLE,
  calculateBaseExecutionFee,
  calculateBaseReceiptExecutionFee,
  calculateBaseTransactionFee,
} from "../src/base-fees.js";

test("calculates Base L2 execution fee from receipt gas fields", () => {
  assert.equal(
    calculateBaseExecutionFee({ gasUsed: "0x5208", effectiveGasPrice: "0x3b9aca00" }),
    21_000_000_000_000n,
  );
});

test("combines L2 execution and L1 security fee without losing bigint precision", () => {
  assert.deepEqual(
    calculateBaseTransactionFee({ gasUsed: 21_000n, effectiveGasPrice: 1_000_000_000n, l1Fee: "2500000000000" }),
    {
      executionFeeWei: 21_000_000_000_000n,
      l1FeeWei: 2_500_000_000_000n,
      totalFeeWei: 23_500_000_000_000n,
    },
  );
});

test("reads execution fee directly from a Base transaction receipt shape", () => {
  const receipt = { gasUsed: "0x186a0", effectiveGasPrice: "0x5f5e100" };
  assert.equal(calculateBaseReceiptExecutionFee(receipt), 10_000_000_000_000n);
});

test("rejects missing, negative, malformed, and unsafe numeric fee inputs", () => {
  assert.throws(() => calculateBaseReceiptExecutionFee({ gasUsed: "0x5208" }), /must include/);
  assert.throws(() => calculateBaseExecutionFee({ gasUsed: -1n, effectiveGasPrice: 1n }), /non-negative/);
  assert.throws(() => calculateBaseExecutionFee({ gasUsed: "21k", effectiveGasPrice: 1n }), /must be/);
  assert.throws(() => calculateBaseExecutionFee({ gasUsed: Number.MAX_SAFE_INTEGER + 1, effectiveGasPrice: 1 }), /must be/);
});

test("exports the canonical Base GasPriceOracle predeploy address", () => {
  assert.equal(BASE_GAS_PRICE_ORACLE, "0x420000000000000000000000000000000000000F");
});
