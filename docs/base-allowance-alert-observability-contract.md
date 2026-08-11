# Base ERC-20 Allowance Alert Observability Contract

A read-only observability contract for the allowance alert consumer pipeline. It defines what operators may measure without turning monitoring into wallet automation.

## Safety boundary

- Observability must never call `approve`, `permit`, `transfer`, revoke, signing, or transaction broadcast.
- Base classification is valid only when `chain_id == 8453`.
- Metrics describe consumer behavior; they do not authorize remediation.
- `DATA_WARNING` and `BLOCKED` remain distinct from verified allowance risk.
- Unknown schema versions fail closed and are counted explicitly.

## Required counters

- `allowance_alert_events_total{class}` — validated events by `INFO`, `HIGH`, `RESOLVED`, `DATA_WARNING`, or `BLOCKED`.
- `allowance_alert_duplicates_total` — events suppressed by `dedupe_key`.
- `allowance_alert_schema_rejections_total` — unsupported or malformed schema versions.
- `allowance_alert_chain_mismatch_total` — events rejected because chain ID is not Base mainnet `8453`.
- `allowance_alert_ordering_rejections_total` — stale events that must not overwrite newer verified state.
- `allowance_alert_observation_failures_total` — RPC/data observation failures kept separate from risk transitions.

## Required gauges

- `allowance_alert_last_verified_timestamp` — timestamp of the newest verified allowance observation.
- `allowance_alert_consumer_lag_seconds` — non-negative lag between validated observation and consumer processing.

Gauges must not expose wallet addresses as high-cardinality labels. Raw addresses, secrets, signatures, authentication tokens, and seed phrases must never appear in metric labels.

## Health rules

A consumer is `HEALTHY` only when it can validate schema, chain ID, ordering, and deduplication. It is `DEGRADED` when observation failures or processing lag prevent fresh conclusions. It is `BLOCKED` when schema or chain validation fails.

Health state must never be interpreted as permission to modify an allowance.

## Correlation

Logs may include `dedupe_key`, `schema_version`, `chain_id`, `observed_at`, alert class, and stable reason code. Correlation data must be sufficient to explain why an event was accepted, suppressed, or rejected without storing private signing material.

## Completion criterion

The observability adapter is conformant when every test-matrix vector produces deterministic counters/health state, duplicate delivery does not inflate verified transitions, and no metric, log, or health rule can invoke a wallet action.