import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertAddress,
  buildIsApprovedForAllCalldata,
  parseBooleanWord,
} from '../examples/base-nft-operator-audit.js';

const OWNER = '0x1111111111111111111111111111111111111111';
const OPERATOR = '0x2222222222222222222222222222222222222222';

test('accepts valid EVM addresses and rejects malformed values', () => {
  assert.doesNotThrow(() => assertAddress('OWNER_ADDRESS', OWNER));
  assert.throws(
    () => assertAddress('OWNER_ADDRESS', '0x1234'),
    /valid 20-byte EVM address/,
  );
});

test('encodes isApprovedForAll calldata deterministically', () => {
  const data = buildIsApprovedForAllCalldata(OWNER, OPERATOR);

  assert.equal(data.slice(0, 10), '0xe985e9c5');
  assert.equal(data.length, 138);
  assert.equal(data.slice(10, 74), OWNER.slice(2).padStart(64, '0'));
  assert.equal(data.slice(74), OPERATOR.slice(2).padStart(64, '0'));
});

test('decodes canonical boolean ABI words', () => {
  assert.equal(parseBooleanWord(`0x${'0'.repeat(64)}`), false);
  assert.equal(parseBooleanWord(`0x${'0'.repeat(63)}1`), true);
});

test('rejects malformed or non-boolean ABI responses', () => {
  assert.throws(
    () => parseBooleanWord('0x01'),
    /Unexpected isApprovedForAll\(\) response/,
  );
  assert.throws(
    () => parseBooleanWord(`0x${'0'.repeat(63)}2`),
    /non-boolean approval value/,
  );
});
