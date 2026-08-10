# Base Agent Recovery Checklist

A small operational checklist for recovering safely from failed or interrupted agent runs on Base-oriented tooling.

## Recovery principles

- Default to read-only inspection after an unexpected failure.
- Never retry a transaction automatically after an ambiguous RPC response.
- Verify chain ID and configured network before any retry path is considered.
- Treat Base Sepolia as the default environment for transaction-like tests.
- Require an explicit operator decision before any mainnet-capable path can be enabled.
- Keep x402/payment paths disabled during recovery unless a test fixture explicitly requires them.

## Idempotency

Recovery logic should distinguish between:

1. an action that was never submitted;
2. an action that was submitted but has an unknown result;
3. an action that has a confirmed result.

Only the first category is safe to retry automatically in a local or testnet fixture. Unknown results must stop and be inspected rather than replayed.

## Evidence to capture

For each interrupted run, retain non-secret diagnostic data where available:

- timestamp;
- configured network and chain ID;
- operation name;
- dry-run/read-only state;
- normalized error class;
- whether a request was submitted;
- whether a result was confirmed.

Never log private keys, seed phrases, session tokens, signatures, or full authorization headers.

## Attribution continuity

If ERC-8021-style builder attribution is being tested, recovery must preserve the intended attribution metadata rather than silently dropping or replacing it. A recovered dry-run should report whether attribution data is present and valid.

## CI checks

Recovery tests should cover:

- duplicate-retry prevention;
- ambiguous-result halt behavior;
- wrong-network rejection;
- secret redaction;
- deterministic dry-run output;
- explicit failure when payment functionality is unexpectedly enabled.

## Scope

This document is preparation only. It does not authorize mainnet transactions, payments, wallet signatures, purchases, or new external permissions.
