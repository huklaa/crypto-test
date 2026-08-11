# Base ERC-20 Allowance Alert Consumer Test Matrix

A deterministic test matrix for consumers of the read-only Base allowance alert pipeline. It verifies that dashboards, logs, and notification adapters preserve the consumer contract without introducing wallet actions.

## Safety invariants

- Tests must never call `approve`, `permit`, `transfer`, revoke, signing, or transaction broadcast.
- Base-specific classification requires chain ID `8453`.
- `DATA_WARNING` and `BLOCKED` never mutate the last verified allowance class.
- Duplicate delivery never creates a second risk transition.
- Unknown schema versions fail closed.

## Core vectors

| Case | Input | Expected result |
| --- | --- | --- |
| A1 | verified `NONE -> FINITE` | one `INFO` transition |
| A2 | verified `FINITE -> UNLIMITED` | one `HIGH` transition |
| A3 | replay A2 with same `dedupe_key` | no second transition |
| A4 | verified `UNLIMITED -> NONE` | one `RESOLVED` transition |
| A5 | `RPC_OBSERVATION_FAILED` after verified `FINITE` | `DATA_WARNING`; retain `FINITE` |
| A6 | chain ID other than `8453` | `BLOCKED`; no Base risk classification |
| A7 | unsupported `schema_version` | fail closed; no inferred fields |
| A8 | older event arrives after a newer verified event | preserve verified ordering by `observed_at` |

## Assertions

For every vector assert that:

1. No wallet-action method is invoked.
2. The visible alert class matches the validated event.
3. The stored last-verified state changes only on a verified allowance transition.
4. Replays are idempotent by `dedupe_key`.
5. Observation failures remain distinguishable from allowance risk.
6. Secrets, signatures, authentication tokens, and seed phrases are absent from fixtures and output.

## Negative tests

- Missing `chain_id` must not default to Base.
- Missing or malformed `observed_at` must not be used to reorder verified history.
- Missing `dedupe_key` must not silently claim duplicate suppression.
- `DATA_WARNING` must not resolve or escalate an existing risk.
- `BLOCKED` must not be converted into `INFO` or `HIGH` by a presentation adapter.

## Completion criterion

A consumer is conformant only when all core and negative vectors pass while the read-only safety boundary remains intact.
