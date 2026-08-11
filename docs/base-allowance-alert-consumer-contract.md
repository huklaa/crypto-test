# Base ERC-20 Allowance Alert Consumer Contract

A downstream-consumer contract for the read-only Base allowance alert schema. It defines how dashboards, logs, and notification adapters should consume alert events without turning observation into wallet actions.

## Safety boundary

- Consume only validated events from `base-allowance-alert-schema.md`.
- Never trigger `approve`, `permit`, `transfer`, revoke, signing, or transaction broadcast from an alert.
- Treat `DATA_WARNING` and `BLOCKED` as non-actionable wallet states.
- Preserve the last verified allowance state when the current observation is unknown.
- Require Base chain ID `8453` before presenting a Base-specific risk conclusion.

## Consumer behavior

| Alert class | Consumer behavior |
| --- | --- |
| `INFO` | Record the verified transition and present neutral context. |
| `HIGH` | Surface the verified expansion prominently; do not auto-remediate. |
| `RESOLVED` | Mark the prior risk as resolved only after a verified transition to `NONE`. |
| `DATA_WARNING` | Report observation failure separately from allowance risk. |
| `BLOCKED` | Stop Base-specific classification and expose the validation reason. |

## Idempotency and ordering

1. Use `dedupe_key` to suppress duplicate delivery of the same verified transition.
2. Do not use arrival order as proof of observation order; compare `observed_at` where relevant.
3. A replayed event may refresh delivery metadata but must not create a new risk transition.
4. A warning event must not overwrite a later or earlier verified allowance class.
5. Consumers should retain `schema_version` so incompatible future versions can fail closed.

## Minimum display fields

- `chain_id`
- `observed_at`
- token reference
- spender
- previous and current verified class, when available
- `alert_class`
- `reason_code`

Wallet secrets, signatures, authentication tokens, seed phrases, and unrelated account data must never be requested or displayed.

## Acceptance vectors

- Replaying the same `FINITE -> UNLIMITED` event twice produces one visible risk transition.
- `RPC_OBSERVATION_FAILED` after a verified `FINITE` state leaves `FINITE` as the last verified state.
- `CHAIN_ID_MISMATCH` produces a blocked result and no Base risk classification.
- `UNLIMITED -> NONE` resolves the prior risk only when both states are verified.
- Unknown `schema_version` fails closed instead of guessing field semantics.

This contract keeps alert consumption deterministic, testable, and strictly read-only.