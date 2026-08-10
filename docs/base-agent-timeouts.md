# Base Agent Timeout & Deadline Checklist

A small safety checklist for agent-style tooling that reads from Base or prepares transactions without silently hanging or escalating risk.

## Scope

- Default to read-only operations and Base Sepolia for transaction-oriented development.
- Never fall back to Base mainnet automatically.
- Never convert a timeout into an automatic transaction retry.

## Deadline rules

- Give every RPC/HTTP request an explicit finite timeout.
- Keep a separate overall operation deadline so chained retries cannot run forever.
- Treat `TIMEOUT` as distinct from `FAILED` and `NOT_FOUND`.
- Preserve the original request/operation identifier when a timeout occurs.
- Record endpoint class, chain ID, elapsed time and safe error category; never log secrets.

## Transaction ambiguity

A timeout after submission can mean the request was accepted but the response was lost. Therefore:

1. Do not blindly resubmit.
2. Move the operation to `UNKNOWN` when submission state cannot be proven.
3. Reconcile using transaction hash or a deterministic operation/idempotency key when available.
4. Resume only after the previous operation is known to be absent or terminal.
5. Keep the circuit breaker open if repeated timeouts make reconciliation unreliable.

## Backoff interaction

- A timeout may enter bounded backoff, but it must not bypass idempotency checks.
- Respect the global deadline even when individual retries remain.
- Stop retrying when the deadline expires.
- Do not switch providers or networks in a way that changes transaction semantics without explicit configuration.

## Dry-run / CI checks

Test that:

- a stalled RPC exits within the configured deadline;
- timeout output is machine-readable;
- a simulated post-submit timeout does not create a duplicate send;
- repeated timeouts trip the circuit breaker;
- logs contain no private keys, signatures, auth headers or seed material;
- test configuration cannot silently select Base mainnet.

## Builder attribution

When ERC-8021/Builder Code attribution is supported by a transaction-building path, timeout/recovery handling must preserve that attribution metadata. Recovery must not rebuild an otherwise identical action without the expected builder attribution.

## Safe default

When the system cannot determine whether an action completed, prefer `UNKNOWN` + reconciliation over retry. A missed action is recoverable; an unintended duplicate onchain action may not be.
