import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_GAS_PRICE_ORACLE,
  calculateBaseExecutionFee,
  calculateBaseOperatorFee,
  calculateBaseReceiptExecutionFee,
  calculateBaseReceiptTransactionFee,
  calculateBaseTransactionFee,
} from "../src/base-fees.js";

test("calculates Base L2 execution fee from receipt gas fields", () => {
  assert.equal(
    calculateBaseExecutionFee({ gasUsed: "0x5208", effectiveGasPrice: "0x3b9aca00" }),
    21_000_000_000_000n,
  );
});

test("calculates the Isthmus operator fee using the 1e6-scaled formula", () => {
  assert.equal(
    calculateBaseOperatorFee({
      gasUsed: 21_000n,
      operatorFeeScalar: 1_000_000n,
      operatorFeeConstant: 500n,
      hardfork: "isthmus",
    }),
    21_500n,
  );
});

test("calculates the Jovian operator fee using the updated 100x scalar formula", () => {
  assert.equal(
    calculateBaseOperatorFee({
      gasUsed: 21_000n,
      operatorFeeScalar: 7n,
      operatorFeeConstant: 500n,
      hardfork: "jovian",
    }),
    14_700_500n,
  );
});

test("does not charge operator fees to deposit transactions", () => {
  assert.equal(
    calculateBaseOperatorFee({
      gasUsed: 1_000_000n,
      operatorFeeScalar: 999n,
      operatorFeeConstant: 123n,
      isDeposit: true,
    }),
    0n,
  );
});

test("combines execution, L1 security, and operator fees without losing bigint precision", () => {
  assert.deepEqual(
    calculateBaseTransactionFee({
      gasUsed: 21_000n,
      effectiveGasPrice: 1_000_000_000n,
      l1Fee: "2500000000000",
      operatorFee: "14700500",
    }),
    {
      executionFeeWei: 21_000_000_000_000n,
      l1FeeWei: 2_500_000_000_000n,
      operatorFeeWei: 14_700_500n,
      totalFeeWei: 23_500_014_700_500n,
    },
  );
});

test("reads execution fee directly from a Base transaction receipt shape", () => {
  const receipt = { gasUsed: "0x186a0", effectiveGasPrice: "0x5f5e100" };
  assert.equal(calculateBaseReceiptExecutionFee(receipt), 10_000_000_000_000n);
});

test("calculates a complete Base fee breakdown directly from receipt fields", () => {
  assert.deepEqual(
    calculateBaseReceiptTransactionFee({
      gasUsed: "0x5208",
      effectiveGasPrice: "0x3b9aca00",
      l1Fee: "0x246139ca800",
      operatorFee: "14700500",
    }),
    {
      executionFeeWei: 21_000_000_000_000n,
      l1FeeWei: 2_500_000_000_000n,
      operatorFeeWei: 14_700_500n,
      totalFeeWei: 23_500_014_700_500n,
    },
  );
});

test("defaults optional receipt L1 and operator fees to zero", () => {
  assert.deepEqual(
    calculateBaseReceiptTransactionFee({ gasUsed: 21_000n, effectiveGasPrice: 1_000_000_000n }),
    {
      executionFeeWei: 21_000_000_000_000n,
      l1FeeWei: 0n,
      operatorFeeWei: 0n,
      totalFeeWei: 21_000_000_000_000n,
    },
  );
});

test("rejects invalid fee and operator-fe inputs", () => {
  assert.throws(() => calculateBaseReceiptExecutionFee({ gasUsed: "0x5208" }), /must include/);
  assert.throws(() => calculateBaseReceiptTransactionFee({ gasUsed: "0x5208" }), /must include/);
  assert.throws(() => calculateBaseExecutionFee({ gasUsed: -1n, effectiveGasPrice: 1n }), /non-negative/);
  assert.throws(() => calculateBaseExecutionFee({ gasUsed: "21k", effectiveGasPrice: 1n }), /must be/);
  assert.throws(() => calculateBaseExecutionFee({ gasUsed: Number.MAX_SAFE_INTEGER + 1, effectiveGasPrice: 1 }), /must be/);
  assert.throws(
    () => calculateBaseOperatorFee({ gasUsed: 1n, operatorFeeScalar: 1n, hardfork: "azul" }),
    /hardfork/,
  );
  assert.throws(
    () => calculateBaseOperatorFee({ gasUsed: 1n, operatorFeeScalar: 1n, isDeposit: "yes" }),
    /isDeposit/,
  );
});

test("exports the canonical Base GasPriceOracle predeploy address", () => {
  assert.equal(BASE_GAS_PRICE_ORACLE, "0x420000000000000000000000000000000000000F");
});
