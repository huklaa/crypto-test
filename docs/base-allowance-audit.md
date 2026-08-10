# Base ERC-20 Allowance Audit

This repository includes a dependency-free example for checking an ERC-20 token allowance on Base before interacting with a dapp.

The script calls `allowance(owner, spender)` through `eth_call` and reports whether the allowance is zero, finite, or the maximum `uint256` value commonly used for unlimited approvals.

## Run

```bash
BASE_RPC_URL=https://mainnet.base.org \
TOKEN_ADDRESS=0x... \
OWNER_ADDRESS=0x... \
SPENDER_ADDRESS=0x... \
node examples/base-erc20-allowance-audit.js
```

The script is read-only. It never requests a private key, signs a message, submits a transaction, or changes an approval.

## Why this matters

Wallet users often grant token allowances to routers, exchanges, bridges, and other contracts. Checking the current allowance before a new interaction makes approval state explicit and helps developers present safer transaction previews.

The raw allowance is returned in the token's smallest unit. Token decimals are intentionally not fetched so the example stays dependency-free and makes no extra RPC calls.
