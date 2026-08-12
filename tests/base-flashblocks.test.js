import test from "node:test";
import assert from "node:assert/strict";

import {
  BASE_FLASHBLOCK_ENDPOINTS,
  assertTransactionHash,
  createBaseTransactionStatusRequest,
  getBaseFlashblocksEndpoint,
  isBaseTransactionKnown,
  parseBaseTransactionStatusResponse,
} from "../src/base-flashblocks.js";

const TX_HASH = `0x${"ab".repeat(32)}`;

test("returns official Base Flashblocks endpoints", () => {
  assert.equal(getBaseFlashblocksEndpoint(), BASE_FLASHBLOCK_ENDPOINTS.mainnet.http);
  assert.equal(
    getBaseFlashblocksEndpoint({ network: "sepolia", transport: "websocket" }),
    "wss://sepolia-preconf.base.org",
  );
});

test("rejects unsupported Flashblocks endpoint options", () => {
  assert.throws(() => getBaseFlashblocksEndpoint({ network: "devnet" }), /network/);
  assert.throws(() => getBaseFlashblocksEndpoint({ transport: "ipc" }), /transport/);
});

test("validates 32-byte transaction hashes", () => {
  assert.equal(assertTransactionHash(TX_HASH), TX_HASH);
  assert.throws(() => assertTransactionHash("0x1234"), /32-byte/);
  assert.throws(() => assertTransactionHash(`0x${"zz".repeat(32)}`), /32-byte/);
});

test("builds base_transactionStatus JSON-RPC requests", () => {
  assert.deepEqual(createBaseTransactionStatusRequest(TX_HASH, "status-1"), {
    jsonrpc: "2.0",
    method: "base_transactionStatus",
    params: [TX_HASH],
    id: "status-1",
  });
  assert.throws(() => createBaseTransactionStatusRequest(TX_HASH, -1), /JSON-RPC id/);
});

test("parses Known and Unknown transaction status responses", () => {
  assert.equal(parseBaseTransactionStatusResponse({ result: { status: "Known" } }), "Known");
  assert.equal(parseBaseTransactionStatusResponse({ result: { status: "Unknown" } }), "Unknown");
  assert.equal(isBaseTransactionKnown({ result: { status: "Known" } }), true);
  assert.equal(isBaseTransactionKnown({ result: { status: "Unknown" } }), false);
});

test("rejects malformed or errored transaction status responses", () => {
  assert.throws(() => parseBaseTransactionStatusResponse(null), /response must be an object/);
  assert.throws(() => parseBaseTransactionStatusResponse({ result: null }), /object result/);
  assert.throws(() => parseBaseTransactionStatusResponse({ result: { status: "Pending" } }), /Known.*Unknown/);
  assert.throws(
    () => parseBaseTransactionStatusResponse({ error: { message: "method unavailable" } }),
    /method unavailable/,
  );
});
