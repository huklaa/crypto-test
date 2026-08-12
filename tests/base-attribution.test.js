import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_ACCOUNT_CAPABILITY_NAMES,
  BASE_MAINNET_CHAIN_ID_HEX,
  ERC8021_MARKER_HEX,
  appendDataSuffix,
  applyDataSuffixToTransaction,
  applyDataSuffixToUserOperation,
  assertErc8021DataSuffix,
  buildDataSuffixCapability,
  getBaseCapabilitySummary,
  getChainCapabilities,
  hasErc8021Marker,
  supportsDataSuffixCapability,
  supportsWalletCapability,
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

test("normalizes chain IDs when reading wallet_getCapabilities responses", () => {
  const capabilities = {
    "0x02105": {
      atomic: { supported: true },
      dataSuffix: { supported: true },
    },
  };

  assert.deepEqual(getChainCapabilities(capabilities), capabilities["0x02105"]);
  assert.equal(supportsWalletCapability(capabilities, "atomic"), true);
  assert.equal(supportsWalletCapability(capabilities, "paymasterService"), false);
  assert.equal(supportsDataSuffixCapability(capabilities), true);
  assert.equal(getChainCapabilities(capabilities, "0x1"), null);
});

test("summarizes Base Account capabilities for progressive enhancement", () => {
  const capabilities = {
    [BASE_MAINNET_CHAIN_ID_HEX]: {
      atomic: { supported: true },
      paymasterService: { supported: true },
      flowControl: { supported: false },
      dataSuffix: { supported: true },
      gasLimitOverride: { supported: true },
    },
  };

  assert.deepEqual(getBaseCapabilitySummary(capabilities), {
    atomic: true,
    paymasterService: true,
    flowControl: false,
    datacallback: false,
    dataSuffix: true,
    gasLimitOverride: true,
  });
  assert.deepEqual(Object.keys(getBaseCapabilitySummary({})), [...BASE_ACCOUNT_CAPABILITY_NAMES]);
});

test("rejects malformed wallet capability inputs", () => {
  assert.throws(() => getChainCapabilities(null), /capabilities must be an object/);
  assert.throws(() => getChainCapabilities({}, "8453"), /0x-prefixed hexadecimal chain id/);
  assert.throws(() => supportsWalletCapability({}, ""), /non-empty string/);

  assert.equal(
    getChainCapabilities({ [BASE_MAINNET_CHAIN_ID_HEX]: [] }),
    null,
  );
  assert.equal(
    supportsWalletCapability({ malformed: { atomic: { supported: true } } }, "atomic"),
    false,
  );
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
