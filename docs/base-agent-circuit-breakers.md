# Base Agent Circuit Breaker Checklist

A defensive checklist for Base-oriented agents that complements the existing safety, verification, recovery, idempotency, observability, and rate-limit notes.

## Goal

Stop automated execution safely when upstream conditions are unreliable or repeated failures indicate that continuing could create duplicate, unintended, or unverifiable actions.

## Safe defaults

- Default to read-only or dry-run behavior.
- Treat Base Sepolia as the execution environment for development checks.
- Never silently fall back to Base mainnet.
- Keep paid actions and automatic x402 payments disabled unless explicitly enabled by a human.

## Trip conditions

Open the circuit when any configured threshold is reached:

- repeated RPC/network failures;
- repeated `UNKNOWN` transaction outcomes;
- chain ID or expected-network mismatch;
- malformed or unverifiable provider responses;
- sustained rate limiting after bounded backoff;
- attribution/builder-code validation failure where attribution is required;
- a duplicate/idempotency conflict that cannot be resolved safely.

## States

Use explicit machine-readable states:

- `CLOSED`: normal read-only/dry-run operations may proceed;
- `OPEN`: execution is blocked and no transaction should be submitted;
- `HALF_OPEN`: allow only a bounded health/read verification probe, never a paid or mainnet action.

## Recovery rules

1. Record the trip reason and timestamp without secrets.
2. Do not retry an ambiguous transaction merely because the circuit later recovers.
3. Verify network identity and provider health independently.
4. Reconcile any `UNKNOWN` operation before permitting a related action.
5. Require consecutive healthy probes before returning to `CLOSED`.
6. Reset retry counters only after verified recovery.

## Observability

Emit structured fields such as:

```json
{
  "component": "base-agent",
  "circuit": "OPEN",
  "reason": "RPC_UNHEALTHY",
  "network": "base-sepolia",
  "action": "BLOCKED"
}
```

Never log private keys, seed phrases, raw authorization tokens, or full sensitive request payloads.

## CI / test cases

Test that the circuit opens for repeated failures, rejects writes while open, permits only safe probes in half-open mode, and returns to closed only after verified recovery. Include a regression test proving that an `UNKNOWN` operation is not automatically resubmitted after recovery.

## Relationship to existing safeguards

Circuit breakers are the outer stop mechanism. Rate limits control request pacing, idempotency prevents duplicate intent, recovery reconciles uncertain outcomes, verification checks assumptions, and observability records what happened. These layers should fail closed together.
