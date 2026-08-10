# Base ERC-20 Allowance Monitoring Checklist

A read-only follow-up to the allowance audit and risk-policy examples. This checklist focuses on detecting meaningful allowance changes without signing or broadcasting transactions.

## Scope

- Base mainnet reads only (`chainId = 8453`)
- Use `eth_call` for `allowance(owner, spender)`
- Never request a signature or submit a transaction
- Treat RPC uncertainty as `UNKNOWN`, never as zero allowance

## Snapshot model

Record a minimal snapshot for each `(owner, token, spender)` tuple:

- `chainId`
- token address
- spender address
- observed allowance
- risk class: `NONE`, `FINITE`, `UNLIMITED`, or `UNKNOWN`
- block number used for the observation
- observation timestamp

Do not store private keys, seed phrases, signatures, or unrelated wallet data.

## Change detection

Compare the latest confirmed snapshot with the previous confirmed snapshot.

Flag these transitions for review:

- `NONE -> FINITE`
- `NONE -> UNLIMITED`
- `FINITE -> UNLIMITED`
- a material increase in a finite allowance
- spender address changes for an otherwise equivalent workflow

A decrease or revocation can be recorded as an informational event. `UNKNOWN` must not overwrite the last known confirmed state.

## RPC safety

1. Verify the RPC reports Base chain ID `8453` before reading state.
2. Pin the observation to a returned block number where practical.
3. On timeout, malformed response, rate limit, or chain mismatch, emit `UNKNOWN`.
4. Apply bounded retry/backoff rules from the agent rate-limit checklist.
5. Never infer an approval change from a failed read.

## Suggested output

```text
ALLOWANCE_CHANGE
chain=8453
risk_before=FINITE
risk_after=UNLIMITED
status=REVIEW_REQUIRED
```

The output is advisory only. It must not automatically revoke, approve, swap, bridge, or perform any other state-changing action.

## Privacy and logging

- Log only addresses and values required for the audit.
- Redact RPC credentials and API keys.
- Keep `UNKNOWN` observations distinguishable from confirmed state.
- Use correlation IDs when the check is part of a larger agent workflow.

## Non-goals

This checklist does not perform token approvals, revocations, wallet connections, paid API calls, mainnet writes, or fresh authorization.
