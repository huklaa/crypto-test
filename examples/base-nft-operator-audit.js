#!/usr/bin/env node

/**
 * Base NFT operator approval audit example.
 *
 * Reads the ERC-721 / ERC-1155 isApprovedForAll(owner, operator) flag directly
 * from Base JSON-RPC. Blanket operator approvals are powerful because they can
 * allow an operator to transfer every token in a collection owned by a wallet.
 *
 * Usage:
 *   BASE_RPC_URL=https://mainnet.base.org \
 *   NFT_ADDRESS=0x... \
 *   OWNER_ADDRESS=0x... \
 *   OPERATOR_ADDRESS=0x... \
 *   node examples/base-nft-operator-audit.js
 */

import { pathToFileURL } from 'node:url';

const RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const NFT_ADDRESS = process.env.NFT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const OPERATOR_ADDRESS = process.env.OPERATOR_ADDRESS;
const BASE_MAINNET_CHAIN_ID = 8453n;

export function assertAddress(name, value) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value || '')) {
    throw new Error(`${name} must be a valid 20-byte EVM address`);
  }
}

export function padAddress(address) {
  return address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

export function buildIsApprovedForAllCalldata(ownerAddress, operatorAddress) {
  assertAddress('OWNER_ADDRESS', ownerAddress);
  assertAddress('OPERATOR_ADDRESS', operatorAddress);
  return `0xe985e9c5${padAddress(ownerAddress)}${padAddress(operatorAddress)}`;
}

export function parseBooleanWord(result) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(result || '')) {
    throw new Error('Unexpected isApprovedForAll() response from NFT contract');
  }

  const rawValue = BigInt(result);
  if (rawValue !== 0n && rawValue !== 1n) {
    throw new Error('NFT contract returned a non-boolean approval value');
  }

  return rawValue === 1n;
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
  assertAddress('NFT_ADDRESS', NFT_ADDRESS);
  assertAddress('OWNER_ADDRESS', OWNER_ADDRESS);
  assertAddress('OPERATOR_ADDRESS', OPERATOR_ADDRESS);

  const chainIdResult = await rpc('eth_chainId');
  if (!/^0x[a-fA-F0-9]+$/.test(chainIdResult || '')) {
    throw new Error('Unexpected eth_chainId response');
  }

  const chainId = BigInt(chainIdResult);
  if (chainId !== BASE_MAINNET_CHAIN_ID) {
    throw new Error(`Expected Base mainnet chain ID 8453, received ${chainId}`);
  }

  const data = buildIsApprovedForAllCalldata(OWNER_ADDRESS, OPERATOR_ADDRESS);
  const result = await rpc('eth_call', [
    {
      to: NFT_ADDRESS,
      data,
    },
    'latest',
  ]);

  const approved = parseBooleanWord(result);

  console.log('Base NFT operator approval audit');
  console.log(`Collection: ${NFT_ADDRESS}`);
  console.log(`Owner:      ${OWNER_ADDRESS}`);
  console.log(`Operator:   ${OPERATOR_ADDRESS}`);
  console.log(`Approved for all: ${approved ? 'yes' : 'no'}`);

  if (approved) {
    console.log('Status: blanket operator approval is active; review whether it is still needed');
  } else {
    console.log('Status: no blanket operator approval for this collection/operator pair');
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`NFT operator audit failed: ${error.message}`);
    process.exitCode = 1;
  });
}
