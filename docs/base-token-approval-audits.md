# Base token approval audits

This repository includes two read-only Base mainnet examples for checking permissions that dapps may hold over wallet assets. Both examples use `eth_call`; they do not connect a wallet, request a signature, submit a transaction, or revoke anything.

## ERC-20 allowance

`examples/base-erc20-allowance-audit.js` reads `allowance(owner, spender)` for one token/spender pair.

```bash
BASE_RPC_URL=https://mainnet.base.org \
TOKEN_ADDRESS=0x... \
OWNER_ADDRESS=0x... \
SPENDER_ADDRESS=0x... \
pnpm run example:base:erc20-allowance
```

The output distinguishes zero, finite non-zero, and max-uint256 allowances. A non-zero allowance is not automatically malicious; it should be compared with the dapp or contract the owner intended to authorize.

## ERC-721 / ERC-1155 blanket operator approval

`examples/base-nft-operator-audit.js` reads `isApprovedForAll(owner, operator)` for one NFT collection/operator pair. This flag is shared by ERC-721 and ERC-1155 and can authorize the operator to transfer every token from that collection held by the owner.

```bash
BASE_RPC_URL=https://mainnet.base.org \
NFT_ADDRESS=0x... \
OWNER_ADDRESS=0x... \
OPERATOR_ADDRESS=0x... \
pnpm run example:base:nft-approval
```

The script verifies that the RPC reports Base mainnet chain ID `8453` before reading the approval flag and rejects malformed or non-boolean contract responses.

## Scope and limitations

These examples answer narrowly scoped questions for addresses you already know. They do not discover every spender or operator that has ever been approved, identify whether a contract is trustworthy, or revoke permissions. Full historical discovery generally requires indexed event data or an explorer API in addition to current-state RPC reads.

Treat the output as a verification primitive: confirm contract addresses from trusted sources, investigate unexpected approvals, and use a reputable wallet or explorer if you decide to revoke them.
