# Base Agent Idempotency Checklist

A small safety checklist for repeatable agent workflows on Base without accidental duplicate actions.

## Default operating mode

- Prefer read-only checks and Base Sepolia during development.
- Treat mainnet transaction broadcasting as disabled by default.
- Never infer permission to sign, pay, purchase, bridge, swap, or submit an onchain transaction.
- Keep network and chain ID explicit in every execution context.

## Idempotency rules

1. Assign a deterministic operation key to every planned state-changing action.
2. Record the operation key before any broadcast-capable stage.
3. Reject duplicate operation keys unless an explicit recovery procedure proves the previous attempt did not execute.
4. Treat RPC timeouts and unknown receipts as `UNKNOWN`, not `FAILED`.
5. Never automatically retry an `UNKNOWN` state-changing operation.
6. Separate simulation/dry-run output from broadcast-capable output.
7. Make retries bounded and observable for read-only RPC calls.

## Safe result states

Machine-readable workflows should distinguish:

- `PLANNED`
- `SIMULATED`
- `BLOCKED`
- `UNKNOWN`
- `CONFIRMED`
- `FAILED`

`UNKNOWN` requires receipt/state verification before another attempt is allowed.

## Attribution continuity

When Builder Code / ERC-8021 attribution is used, keep attribution metadata attached to the same logical operation key through simulation, verification, and reporting. Do not silently add or replace attribution at a later stage.

## Logging

Log only non-secret metadata needed to diagnose execution: network, chain ID, operation key, mode, result state, and sanitized error category. Never log private keys, seed phrases, signatures, auth tokens, or full sensitive payloads.

## CI checks

- Duplicate operation keys are rejected.
- Unknown outcomes cannot enter an automatic retry path.
- Mainnet broadcasting remains opt-in and disabled in tests.
- Dry-run output is clearly distinguishable from executed output.
- Secrets are redacted from logs and fixtures.

This checklist is intentionally conservative: a safe no-op is preferable to an ambiguous duplicate onchain action.
