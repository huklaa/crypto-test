import test from "node:test";
import assert from "node:assert/strict";
import {
  assertPositiveNumber,
  isValidCurrencyCode,
  isValidSymbol,
  normalizeSymbol,
  validateCoin,
  validateHolding
} from "../src/index.js";

test("normalizeSymbol trims and uppercases symbols", () => {
  assert.equal(normalizeSymbol(" btc "), "BTC");
  assert.throws(() => normalizeSymbol(null), TypeError);
});

test("isValidSymbol enforces a compact ticker format", () => {
  assert.equal(isValidSymbol("eth"), true);
  assert.equal(isValidSymbol("bad symbol"), false);
});

test("assertPositiveNumber rejects zero and non-numbers", () => {
  assert.equal(assertPositiveNumber(2), 2);
  assert.throws(() => assertPositiveNumber(0), RangeError);
  assert.throws(() => assertPositiveNumber("2"), RangeError);
});

test("validateCoin normalizes a complete coin record", () => {
  assert.deepEqual(validateCoin({ name: " Bitcoin ", symbol: "btc", price: 60_000 }), {
    name: "Bitcoin",
    symbol: "BTC",
    price: 60_000
  });
});

test("validateHolding accepts zero balances and rejects negatives", () => {
  assert.equal(validateHolding({ symbol: "eth", amount: 0, price: 3_000 }).symbol, "ETH");
  assert.throws(() => validateHolding({ symbol: "ETH", amount: -1, price: 3_000 }), RangeError);
});

test("isValidCurrencyCode recognizes ISO currency identifiers", () => {
  assert.equal(isValidCurrencyCode("USD"), true);
  assert.equal(isValidCurrencyCode("US"), false);
});
