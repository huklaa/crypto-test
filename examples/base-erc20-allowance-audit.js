#!/usr/bin/env node

/**
 * Base ERC-20 allowance audit example.
 *
 * Reads an ERC-20 allowance directly from Base JSON-RPC without third-party
 * dependencies. This is useful for checking how much a spender contract is
 * allowed to transfer from a wallet before interacting with a dapp.
 *
 * Usage:
 *   BASE_RPC_URL=https://mainnet.base.org \
 *   TOKEN_ADDRESS=0x... \
 *   OWNER_ADDRESS=0x... \
 *   SPENDER_ADDRESS=0x... \
 *   node examples/base-erc20-allowance-audit.js
 */

import { pathToFileURL } from 'node:url';

const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const SPENDER_ADDRESS = process.env.SPENDER_ADDRESS;
const BASE_MAINNET_CHAIN_ID = 8453n;

export function assertAddress(name, value) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value || '')) {
    throw new Error(`${name} must be a valid 20-byte EVM address`);
  }
}

export function padAddress(address) {
  return address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

export function buildAllowanceCalldata(ownerAddress, spenderAddress) {
  assertAddress('OWNER_ADDRESS', ownerAddress);
  assertAddress('SPENDER_ADDRESS', spenderAddress);
  return `0xdd62ed3e${padAddress(ownerAddress)}${padAddress(spenderAddress)}`;
}

export function parseUint256Word(result) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(result || '')) {
    throw new Error('Unexpected allowance() response from token contract');
  }

  return BigInt(result);
}

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC HTTP ${response.status}: ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.error) {
    throw new Error(`RPC error ${payload.error.code}: ${payload.error.message}`);
  }

  return payload.result;
}

async function main() {
  assertAddress('TOKEN_ADDRESS', TOKEN_ADDRESS);
  assertAddress('OWNER_ADDRESS', OWNER_ADDRESS);
  assertAddress('SPENDER_ADDRESS', SPENDER_ADDRESS);

  const chainIdResult = await rpc('eth_chainId');
  if (!/^0x[a-fA-F0-9]+$/.test(chainIdResult || '')) {
    throw new Error('Unexpected eth_chainId response');
  }

  const chainId = BigInt(chainIdResult);
  if (chainId !== BASE_MAINNET_CHAIN_ID) {
    throw new Error(`Expected Base mainnet chain ID 8453, received ${chainId}`);
  }

  const data = buildAllowanceCalldata(OWNER_ADDRESS, SPENDER_ADDRESS);
  const result = await rpc('eth_call', [
    {
      to: TOKEN_ADDRESS,
      data,
    },
    'latest',
  ]);

  const allowance = parseUint256Word(result);

  console.log('Base ERC-20 allowance audit');
  console.log(`Token:   ${TOKEN_ADDRESS}`);
  console.log(`Owner:   ${OWNER_ADDRESS}`);
  console.log(`Spender: ${SPENDER_ADDRESS}`);
  console.log(`Raw allowance: ${allowance.toString()}`);

  if (allowance === 0n) {
    console.log('Status: no allowance granted');
  } else if (allowance === (2n ** 256n - 1n)) {
    console.log('Status: unlimited allowance detected');
  } else {
    console.log('Status: finite non-zero allowance detected');
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Allowance audit failed: ${error.message}`);
    process.exitCode = 1;
  });
}
