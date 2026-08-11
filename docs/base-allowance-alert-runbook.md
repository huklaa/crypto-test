# Base ERC-20 Allowance Alert Incident Runbook

A read-only incident-response runbook for the allowance alert pipeline. It converts SLO health states into deterministic investigation steps without authorizing wallet actions.

## Safety boundary

- This runbook must never call `approve`, `permit`, `transfer`, revoke, signing, or transaction broadcast.
- Do not request seed phrases, private keys, auth tokens, or fresh wallet authorization.
- Only observations validated with `chain_id == 8453` may be treated as Base observations.
- `DATA_WARNING`, `DEGRADED`, and `BLOCKED` describe pipeline/data quality; they are not verified token-risk conclusions.

## Triage order

1. Validate schema version and required fields.
2. Validate Base chain ID (`8453`).
3. Check event ordering and timestamp monotonicity.
4. Check the deterministic `dedupe_key` for duplicate delivery.
5. Check observation/RPC status and consumer lag telemetry.
6. Recompute the health mapping from the SLO using only validated telemetry.

Stop at the first failed trust boundary. Do not infer a wallet state from incomplete data.

## HEALTHY

- Record the validated classification and reason code.
- Confirm duplicate suppression and ordering invariants remain satisfied.
- No remediation is authorized by a healthy state.

## DEGRADED

Use when freshness or trustworthy observation is unavailable.

- Preserve the last verified state; do not overwrite it with unknown data.
- Record whether the cause is RPC/observation failure, missing lag telemetry, or processing delay.
- Create a human-review item using only non-sensitive correlation fields.
- Re-evaluate only after fresh validated telemetry arrives.

## BLOCKED

Use when schema or chain validation fails.

- Reject the event from verified-risk accounting.
- Record schema version, chain ID, timestamp, class/reason code when safely available.
- Do not retry by weakening validation rules.
- Require a compatible schema or correctly scoped Base observation before re-entry.

## Duplicate or stale delivery

- Duplicate: suppress using `dedupe_key`; never increment verified-transition counts twice.
- Stale/out-of-order: reject the state overwrite and preserve the newer verified observation.
- Track the delivery problem separately from allowance-risk classification.

## Privacy checklist

Human-review records may contain only non-sensitive correlation fields such as `dedupe_key`, schema version, chain ID, timestamp, class, and reason code. Wallet addresses, secrets, signatures, seed phrases, private keys, and auth tokens must not be copied into metric labels or incident notes.

## Exit criteria

An incident may leave `DEGRADED` or `BLOCKED` only when the failing trust boundary is restored and fresh telemetry passes schema, chain, ordering, deduplication, and freshness checks. Recovery changes diagnostic state only; it never authorizes a wallet transaction.
