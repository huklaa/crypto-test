import test from "node:test";
import assert from "node:assert/strict";

import {
  ERC8021_MARKER_HEX,
  appendDataSuffix,
  applyDataSuffixToTransaction,
  applyDataSuffixToUserOperation,
  assertErc8021DataSuffix,
  buildDataSuffixCapability,
  hasErc8021Marker,
  supportsDataSuffixCapability,
} from "../src/base-attribution.js";

const SAMPLE_SUFFIX = `0x076261736561707000${ERC8021_MARKER_HEX}`;

test("appends a byte-aligned suffix without changing existing calldata", () => {
  assert.equal(appendDataSuffix("0x1234", "0xabcd"), "0x1234abcd");
});

test("applies a suffix to an EOA transaction immutably", () => {
  const transaction = { to: "0x0000000000000000000000000000000000000001", value: 1n };
  const result = applyDataSuffixToTransaction(transaction, SAMPLE_SUFFIX);

  assert.equal(transaction.data, undefined);
  assert.equal(result.data, SAMPLE_SUFFIX);
  assert.equal(result.to, transaction.to);
});

test("appends a suffix to UserOperation callData, not transaction-level data", () => {
  const userOperation = { callData: "0xdeadbeef", sender: "0xabc" };
  const result = applyDataSuffixToUserOperation(userOperation, SAMPLE_SUFFIX);

  assert.equal(result.callData, `0xdeadbeef${SAMPLE_SUFFIX.slice(2)}`);
  assert.equal(userOperation.callData, "0xdeadbeef");
});

test("builds the ERC-5792 dataSuffix capability shape used by Base wallets", () => {
  assert.deepEqual(buildDataSuffixCapability(SAMPLE_SUFFIX), {
    dataSuffix: {
      value: SAMPLE_SUFFIX,
      optional: false,
    },
  });

  assert.equal(buildDataSuffixCapability(SAMPLE_SUFFIX, { optional: true }).dataSuffix.optional, true);
  assert.throws(() => buildDataSuffixCapability("0x1234"), /missing the ERC-8021 marker/);
  assert.throws(() => buildDataSuffixCapability(SAMPLE_SUFFIX, { optional: "yes" }), /optional must be a boolean/);
});

test("detects Base dataSuffix support from wallet_getCapabilities responses", () => {
  assert.equal(
    supportsDataSuffixCapability({
      "0x2105": {
        dataSuffix: { supported: true },
      },
    }),
    true,
  );

  assert.equal(
    supportsDataSuffixCapability({
      "0x2105": {
        dataSuffix: { supported: false },
      },
    }),
    false,
  );
  assert.equal(supportsDataSuffixCapability({}), false);
  assert.throws(() => supportsDataSuffixCapability(null), /capabilities must be an object/);
  assert.throws(() => supportsDataSuffixCapability({}, "8453"), /0x-prefixed hexadecimal chain id/);
});

test("recognizes the 16-byte ERC-8021 marker used by Base attribution", () => {
  assert.equal(hasErc8021Marker(SAMPLE_SUFFIX), true);
  assert.equal(hasErc8021Marker("0x8021"), false);
  assert.equal(assertErc8021DataSuffix(SAMPLE_SUFFIX), SAMPLE_SUFFIX);
  assert.throws(() => assertErc8021DataSuffix("0x1234"), /missing the ERC-8021 marker/);
});

test("rejects malformed, odd-length, and missing calldata values", () => {
  assert.throws(() => appendDataSuffix("0x0", "0xab"), /byte-aligned/);
  assert.throws(() => appendDataSuffix("0x", "abcd"), /0x-prefixed/);
  assert.throws(() => applyDataSuffixToUserOperation({}, SAMPLE_SUFFIX), /include callData/);
});
