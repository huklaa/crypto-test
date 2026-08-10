# Base ERC-20 Allowance Risk Policy

This policy complements the read-only allowance audit example by turning a raw ERC-20 `allowance(owner, spender)` value into an explicit review decision before a dapp interaction.

## Decision states

- `NONE` — allowance is zero. No existing token transfer permission is present for the spender.
- `FINITE` — allowance is non-zero and below `uint256.max`. Surface the raw allowance and require the caller to decide whether it is appropriate for the intended interaction.
- `UNLIMITED` — allowance equals `uint256.max`. Flag it prominently because the spender has effectively unbounded ERC-20 transfer permission until the approval is changed.
- `UNKNOWN` — the RPC call fails, returns malformed data, or the chain cannot be verified. Fail closed; do not infer that an approval is safe or absent.

## Required checks

1. Verify the RPC chain ID is Base before interpreting the result.
2. Validate token, owner, and spender as 20-byte EVM addresses.
3. Use `eth_call` only; this audit must never request a private key or submit a transaction.
4. Keep the spender address visible in output so an allowance cannot be reviewed without knowing who can use it.
5. Treat malformed or missing RPC responses as `UNKNOWN`, not zero.
6. Never automatically revoke, reduce, or replace an approval from an audit result.

## Why this matters

Allowance checks are useful only when their uncertainty is explicit. A failed RPC request must not look like a zero approval, and an unlimited approval should not be presented as an ordinary non-zero value. These states make the existing Base allowance example easier to integrate into transaction previews, agent policy checks, and security tooling without introducing any write action.
