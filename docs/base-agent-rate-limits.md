# Base Agent Rate-Limit & Backoff Checklist

A small operational checklist for safe Base-oriented agent tooling. The goal is predictable behavior under RPC/API throttling without turning transient failures into duplicate or unsafe actions.

## Defaults

- Treat HTTP 429 and explicit provider throttling as transient, not as transaction failure.
- Use bounded exponential backoff with jitter for read-only requests.
- Respect `Retry-After` when the provider supplies it.
- Cap retry attempts and return a structured `RATE_LIMITED` result after the cap.
- Never bypass a provider limit by silently switching to an unapproved endpoint.

## Transaction safety

- Do not automatically rebuild or resubmit a transaction merely because an RPC request timed out or was throttled.
- Before any retry, reconcile the prior attempt using its idempotency key and known transaction state.
- Keep `UNKNOWN`, `RATE_LIMITED`, `FAILED`, and `CONFIRMED` as distinct states.
- Preserve ERC-8021 attribution data when a safe retry is explicitly permitted.

## Observability

Log only non-secret operational fields:

- network / chain ID
- request class (`read`, `simulate`, `submit-disabled`)
- attempt number
- backoff duration
- provider response class
- idempotency key or redacted correlation ID
- final structured state

Never log private keys, seed phrases, raw authorization headers, or wallet secrets.

## Test cases

1. A read-only request receives 429, waits, then succeeds.
2. Repeated 429 responses stop at the configured retry cap.
3. `Retry-After` is honored when present.
4. A throttled transaction-status lookup does not trigger transaction resubmission.
5. An ambiguous prior submission remains `UNKNOWN` until reconciled.
6. Dry-run and Base Sepolia paths can exercise the policy without spending funds.

## Scope

This checklist is intentionally testnet/read-only oriented. It does not authorize mainnet transactions, payments, wallet signatures, purchases, or automatic x402 spending.