# Base ERC-20 Allowance Alerting Checklist

A read-only alerting layer for allowance monitoring on Base. It turns verified allowance state transitions into actionable signals without signing, approving, revoking, or broadcasting transactions.

## Safety boundary

- Read-only RPC calls only.
- Verify Base chain ID (`8453`) before classifying results.
- Never call `approve`, `permit`, `transfer`, or revoke flows.
- Never request a wallet signature.
- Treat RPC failure, malformed return data, and chain mismatch as `UNKNOWN`.
- Do not overwrite the last verified allowance state with `UNKNOWN`.

## Alert classes

| Transition / condition | Alert | Rationale |
| --- | --- | --- |
| `NONE -> FINITE` | `INFO` | A new bounded approval appeared. |
| `NONE -> UNLIMITED` | `HIGH` | A new effectively unlimited approval appeared. |
| `FINITE -> UNLIMITED` | `HIGH` | Existing bounded approval expanded materially. |
| `UNLIMITED -> FINITE` | `INFO` | Exposure was reduced. |
| `FINITE/UNLIMITED -> NONE` | `RESOLVED` | Approval was removed. |
| verified state -> `UNKNOWN` | `DATA_WARNING` | Observation failed; risk state is not inferred. |
| chain ID != `8453` | `BLOCKED` | Observation is not trusted as Base data. |

## Alert payload

Each alert should record only the minimum audit context:

- observation timestamp;
- chain ID;
- token address;
- owner address or a privacy-preserving identifier;
- spender address;
- previous verified class;
- current verified class;
- raw allowance value when safely available;
- RPC source label;
- reason code.

Do not log private keys, seed phrases, signatures, auth tokens, or unrelated wallet data.

## Deduplication

- Use a deterministic key such as `chain:token:owner:spender:previous:current`.
- Do not repeatedly alert while the verified state remains unchanged.
- A later verified transition may create a new alert.
- `UNKNOWN` observations must not create false `RESOLVED` events.

## Fail-closed behavior

If the chain, token response, owner/spender input, or RPC result cannot be verified, emit only a data-quality warning and stop classification for that observation. Never recommend or execute an onchain action automatically.

## Test cases

1. `0 -> 1000`: emits one `INFO` alert.
2. `0 -> max uint256`: emits one `HIGH` alert.
3. `1000 -> max uint256`: emits one `HIGH` alert.
4. repeated max uint256 observation: emits no duplicate transition alert.
5. max uint256 -> `0`: emits `RESOLVED`.
6. RPC timeout after a verified unlimited state: keeps the verified state and emits `DATA_WARNING` only.
7. chain ID mismatch: emits `BLOCKED` and performs no allowance classification.

This checklist extends `base-allowance-audit.md`, `base-allowance-risk-policy.md`, and `base-allowance-monitoring.md` while preserving a strictly read-only workflow.
