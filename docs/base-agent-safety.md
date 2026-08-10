# Base Agent Safety Guardrails

A practical checklist for keeping agent-facing Base integrations safe during development.

## Default development mode

- Prefer Base Sepolia and read-only RPC calls while iterating.
- Keep transaction broadcasting disabled by default.
- Require an explicit execution flag before any state-changing action.
- Never embed private keys, seed phrases, API secrets, or wallet credentials in source code.

## Spending and permissions

- Treat wallet permissions as least-privilege capabilities.
- Define explicit spend limits and allowed actions for agent wallets.
- Validate chain ID, recipient, token, amount, and calldata before presenting a transaction.
- Surface a human-readable transaction summary before any signing step.

## x402 / paid services

- Detect payment-required responses without automatically paying them.
- Expose price, asset, network, and destination before payment.
- Keep automatic payment disabled in examples and tests unless a dedicated sandbox is used.

## Observability

- Produce structured logs for requested actions and validation failures.
- Never log secrets or complete authentication material.
- Make dry-run output deterministic enough for CI assertions.

## Builder attribution

- Keep ERC-8021 builder attribution support modular and opt-in.
- Validate attribution metadata before transaction construction.
- Test attribution encoding without broadcasting a mainnet transaction.

## CI checks

- Run tests without wallet secrets.
- Verify dry-run paths cannot broadcast transactions.
- Fail tests when unsupported chain IDs or malformed addresses are supplied.

This document is intentionally implementation-neutral so individual tools in this repository can adopt the guardrails without requiring mainnet activity or paid services.
