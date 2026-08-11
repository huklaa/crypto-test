import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertAddress,
  buildAllowanceCalldata,
  parseUint256Word,
} from '../examples/base-erc20-allowance-audit.js';

const OWNER = '0x1111111111111111111111111111111111111111';
const SPENDER = '0x2222222222222222222222222222222222222222';

test('accepts valid EVM addresses and rejects malformed values', () => {
  assert.doesNotThrow(() => assertAddress('OWNER_ADDRESS', OWNER));
  assert.throws(
    () => assertAddress('OWNER_ADDRESS', '0x1234'),
    /valid 20-byte EVM address/,
  );
});

test('encodes allowance calldata deterministically', () => {
  const data = buildAllowanceCalldata(OWNER, SPENDER);

  assert.equal(data.slice(0, 10), '0xdd62ed3e');
  assert.equal(data.length, 138);
  assert.equal(data.slice(10, 74), OWNER.slice(2).padStart(64, '0'));
  assert.equal(data.slice(74), SPENDER.slice(2).padStart(64, '0'));
});

test('decodes uint256 allowance words including max uint256', () => {
  assert.equal(parseUint256Word(`0x${'0'.repeat(64)}`), 0n);
  assert.equal(parseUint256Word(`0x${'0'.repeat(63)}1`), 1n);
  assert.equal(parseUint256Word(`0x${'f'.repeat(64)}`), 2n ** 256n - 1n);
});

test('rejects malformed allowance responses', () => {
  assert.throws(
    () => parseUint256Word('0x01'),
    /Unexpected allowance\(\) response/,
  );
  assert.throws(
    () => parseUint256Word(`0x${'g'.repeat(64)}`),
    /Unexpected allowance\(\) response/,
  );
});
