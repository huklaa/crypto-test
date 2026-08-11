import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_CHAIN_IDS,
  assertBaseChainId,
  isBaseChainId,
  normalizeRpcChainId,
  validateBaseEthChainIdResponse,
} from "../src/base.js";

test("normalizes decimal and hexadecimal Base chain ids", () => {
  assert.equal(normalizeRpcChainId("8453"), BASE_CHAIN_IDS.mainnet);
  assert.equal(normalizeRpcChainId("0x2105"), BASE_CHAIN_IDS.mainnet);
  assert.equal(normalizeRpcChainId("0x14a34"), BASE_CHAIN_IDS.sepolia);
});

test("identifies only supported Base networks", () => {
  assert.equal(isBaseChainId(8453), true);
  assert.equal(isBaseChainId(84532), true);
  assert.equal(isBaseChainId(1), false);
});

test("rejects malformed or unsafe chain ids", () => {
  assert.throws(() => normalizeRpcChainId("0xzz"), TypeError);
  assert.throws(() => normalizeRpcChainId(-1), TypeError);
  assert.throws(() => normalizeRpcChainId("9007199254740992"), RangeError);
});

test("enforces an expected Base network", () => {
  assert.equal(assertBaseChainId("0x2105", { network: "mainnet" }), 8453);
  assert.throws(
    () => assertBaseChainId("0x14a34", { network: "mainnet" }),
    /unexpected Base chain id/,
  );
  assert.throws(() => assertBaseChainId(1), /unsupported Base chain id/);
});

test("validates eth_chainId JSON-RPC envelopes", () => {
  assert.equal(
    validateBaseEthChainIdResponse({ jsonrpc: "2.0", id: 1, result: "0x2105" }),
    8453,
  );
  assert.throws(
    () => validateBaseEthChainIdResponse({ jsonrpc: "2.0", id: 1, error: { code: -1 } }),
    /contains an error/,
  );
  assert.throws(() => validateBaseEthChainIdResponse({ jsonrpc: "2.0", id: 1 }), /missing result/);
});
