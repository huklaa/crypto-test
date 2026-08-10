# Base ERC-20 Allowance Alert Schema

A compact, machine-readable contract for the read-only allowance alerting workflow on Base. The schema keeps monitoring output deterministic and easy to test without signing or broadcasting transactions.

## Safety boundary

- Read-only observations only.
- Require Base chain ID `8453` before producing a risk classification.
- Never call `approve`, `permit`, `transfer`, revoke, or wallet-signing flows.
- RPC failures and malformed data produce `DATA_WARNING`, never a fabricated allowance state.
- `UNKNOWN` observations never overwrite the last verified state.

## Event shape

```json
{
  "schema_version": "1.0",
  "chain_id": 8453,
  "observed_at": "2026-01-01T00:00:00Z",
  "token": "0x...",
  "owner_ref": "wallet-hash-or-address",
  "spender": "0x...",
  "previous_class": "FINITE",
  "current_class": "UNLIMITED",
  "alert_class": "HIGH",
  "reason_code": "ALLOWANCE_EXPANDED_TO_UNLIMITED",
  "dedupe_key": "8453:token:owner:spender:FINITE:UNLIMITED",
  "rpc_source": "configured-read-only-rpc"
}
```

## Required enums

`previous_class` and `current_class`:

- `NONE`
- `FINITE`
- `UNLIMITED`
- `UNKNOWN`

`alert_class`:

- `INFO`
- `HIGH`
- `RESOLVED`
- `DATA_WARNING`
- `BLOCKED`

## Reason codes

- `NEW_FINITE_ALLOWANCE`
- `NEW_UNLIMITED_ALLOWANCE`
- `ALLOWANCE_EXPANDED_TO_UNLIMITED`
- `ALLOWANCE_REDUCED`
- `ALLOWANCE_REMOVED`
- `RPC_OBSERVATION_FAILED`
- `MALFORMED_RETURN_DATA`
- `CHAIN_ID_MISMATCH`

Reason codes are stable identifiers for tests and downstream tooling. Human-readable text should be derived from them rather than used as the identifier.

## Validation rules

1. `chain_id` must equal `8453`; otherwise emit `BLOCKED` with `CHAIN_ID_MISMATCH`.
2. `HIGH` is valid only for a verified transition to `UNLIMITED` from `NONE` or `FINITE`.
3. `RESOLVED` requires a verified transition from `FINITE` or `UNLIMITED` to `NONE`.
4. `DATA_WARNING` must not claim a new verified allowance class.
5. `dedupe_key` must be deterministic for the same verified transition.
6. Private keys, seed phrases, signatures, auth tokens, and unrelated wallet data must never appear in an event.

## Minimal test vectors

- `NONE -> FINITE` => `INFO / NEW_FINITE_ALLOWANCE`.
- `NONE -> UNLIMITED` => `HIGH / NEW_UNLIMITED_ALLOWANCE`.
- `FINITE -> UNLIMITED` => `HIGH / ALLOWANCE_EXPANDED_TO_UNLIMITED`.
- `UNLIMITED -> FINITE` => `INFO / ALLOWANCE_REDUCED`.
- `FINITE|UNLIMITED -> NONE` => `RESOLVED / ALLOWANCE_REMOVED`.
- RPC timeout => `DATA_WARNING / RPC_OBSERVATION_FAILED`; retain the last verified state.
- chain mismatch => `BLOCKED / CHAIN_ID_MISMATCH`; stop classification.

This schema extends `base-allowance-alerting.md` and keeps the allowance audit pipeline strictly read-only.