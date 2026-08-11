# Base ERC-20 Allowance Alert SLO

A read-only service-level objective for the allowance alert pipeline. It turns the observability contract into measurable reliability expectations without authorizing wallet actions.

## Safety boundary

- SLO evaluation must never call `approve`, `permit`, `transfer`, revoke, signing, or transaction broadcast.
- Only validated Base observations with `chain_id == 8453` may contribute to verified-risk freshness.
- `DATA_WARNING` and `BLOCKED` are availability/data-quality states, not verified allowance-risk conclusions.
- Missing or malformed telemetry fails closed and must not be interpreted as a healthy pipeline.

## Objectives

For a rolling observation window:

- **Validation coverage:** 100% of consumed events are checked for schema version and chain ID before classification.
- **Deduplication correctness:** duplicate delivery must not increase the count of verified risk transitions.
- **Ordering correctness:** stale observations must never overwrite newer verified state.
- **Freshness:** `allowance_alert_consumer_lag_seconds` is measured for every validated event; missing lag data makes freshness `UNKNOWN`.
- **Privacy:** zero wallet addresses, secrets, signatures, auth tokens, or seed phrases may appear in metric labels.

No numeric latency target is invented here; operators must derive a target from measured baseline data before enforcing one.

## Error-budget events

The following consume reliability budget because they prevent a fresh, trustworthy conclusion:

- schema rejection,
- Base chain mismatch,
- ordering rejection caused by pipeline delivery,
- observation/RPC failure,
- missing required telemetry.

Duplicate events that are correctly suppressed are tracked but do not consume the verified-transition budget.

## Health mapping

- `HEALTHY`: required validation succeeds and freshness is measurable.
- `DEGRADED`: observation failures, missing freshness data, or processing lag prevent a fresh conclusion.
- `BLOCKED`: schema or chain validation fails.

A health state is diagnostic only and can never authorize remediation.

## Review rule

An SLO breach may create a human-review item containing only non-sensitive correlation fields (`dedupe_key`, schema version, chain ID, timestamp, class, reason code). It must not create or submit a transaction.

## Completion criterion

The SLO is conformant when every observability/test-matrix failure maps deterministically to health and budget accounting, no duplicate inflates verified transitions, missing telemetry fails closed, and no SLO path can trigger a wallet action.
