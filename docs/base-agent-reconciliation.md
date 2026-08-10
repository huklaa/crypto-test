# Base Agent Reconciliation Checklist

A safe reconciliation layer for Base-oriented agents after timeout, UNKNOWN, or interrupted RPC outcomes.

## Goals

- Never infer transaction success from a timeout alone.
- Resolve uncertain outcomes with read-only chain/RPC checks before any retry.
- Keep reconciliation separate from transaction submission.
- Preserve idempotency and builder attribution context across recovery.

## Reconciliation flow

1. Capture the original request ID, idempotency key, chain ID, intended action, and transaction hash if one was returned.
2. Mark ambiguous outcomes as `UNKNOWN`; do not convert them to failed/successful based only on transport errors.
3. Use read-only receipt/status lookups when a transaction hash exists.
4. If no hash exists, inspect locally recorded nonce/request metadata before considering another attempt.
5. Return one of: `CONFIRMED`, `REVERTED`, `PENDING`, `NOT_FOUND`, or `UNKNOWN`.
6. `NOT_FOUND` is not automatic permission to resubmit; require idempotency and nonce checks first.
7. Repeated unresolved outcomes should open the circuit breaker rather than create retry loops.

## Safety boundaries

- Default examples and tests to Base Sepolia or mocked providers.
- Reconciliation must never sign, broadcast, swap, bridge, purchase, or pay.
- Never silently fall back to Base mainnet.
- Do not log private keys, seed phrases, auth tokens, signatures, or sensitive wallet material.
- x402/payment flows remain read-only during reconciliation.

## Observability

Record structured fields where available:

- `request_id`
- `idempotency_key`
- `chain_id`
- `tx_hash`
- `reconciliation_state`
- `attempt_count`
- `last_checked_at`
- `builder_attribution_present`

## Test cases

- Timeout after hash returned -> receipt lookup resolves status without rebroadcast.
- Timeout before hash returned -> remains `UNKNOWN` until nonce/idempotency checks complete.
- Receipt pending -> no retry.
- Receipt reverted -> report `REVERTED`; no automatic replacement transaction.
- Wrong chain ID -> fail closed.
- Provider repeatedly unavailable -> circuit breaker opens.
- Duplicate request ID -> reuse reconciliation state instead of creating a new action.

## Builder attribution

When ERC-8021/Builder Code metadata is part of the original request context, preserve its presence/status in reconciliation records. Reconciliation itself should not manufacture or alter attribution metadata.
