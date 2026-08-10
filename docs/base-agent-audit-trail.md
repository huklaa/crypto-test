# Base Agent Audit Trail Checklist

A practical checklist for making Base agent workflows reviewable without performing mainnet or paid actions.

## Goal

Every agent decision should leave enough structured evidence to explain what was attempted, why it was allowed, and what result was observed.

## Required audit fields

- `timestamp`
- `network` and expected `chainId`
- `mode` (`read-only`, `dry-run`, `testnet`)
- `actionType`
- sanitized target identifier
- policy decision (`ALLOW`, `DENY`, `REVIEW`)
- idempotency key when applicable
- request/operation correlation ID
- result state (`CONFIRMED`, `REVERTED`, `PENDING`, `NOT_FOUND`, `UNKNOWN`, `RATE_LIMITED`, `TIMEOUT`)
- reconciliation status
- builder-attribution status when ERC-8021 metadata is relevant

## Safety rules

1. Never write private keys, seed phrases, auth tokens, cookies, signatures, or raw secrets to logs.
2. Redact wallet/user identifiers when full values are not required for debugging.
3. Record policy denials as first-class events rather than silently dropping them.
4. An `UNKNOWN` or `TIMEOUT` result must link to reconciliation state; it must not trigger an automatic rebroadcast.
5. Rate-limit and circuit-breaker transitions should be visible in the audit trail.
6. Mainnet execution remains disabled for this checklist and examples.
7. x402 examples must remain non-paying/dry-run unless explicitly authorized in a separate workflow.

## Minimal event example

```json
{
  "network": "base-sepolia",
  "mode": "dry-run",
  "actionType": "simulate",
  "policy": "ALLOW",
  "result": "CONFIRMED",
  "reconciliation": "NOT_REQUIRED",
  "builderAttribution": "CHECKED"
}
```

## Verification

- Confirm logs contain no secrets.
- Confirm every retry shares a correlation/idempotency reference.
- Confirm timeout/unknown states can be reconciled from read-only data.
- Confirm circuit-breaker state changes are traceable.
- Confirm attribution metadata can be checked without broadcasting a transaction.

This checklist complements the repository's observability, timeout, idempotency, recovery, reconciliation, rate-limit, circuit-breaker, verification, and builder-attribution guidance.
