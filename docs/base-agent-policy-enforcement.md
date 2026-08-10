# Base Agent Policy Enforcement Checklist

A compact guardrail checklist for Base-oriented agents before any state-changing action.

## Preflight policy

- Default to read-only or dry-run mode unless an explicit execution mode is configured.
- Verify the expected chain ID before preparing a state-changing request.
- Reject unknown networks and never silently fall back to Base mainnet.
- Treat missing, malformed, or ambiguous policy configuration as `BLOCKED`.
- Keep secrets, private keys, session tokens, and raw authorization material out of logs.

## Action policy

- Classify each requested action as `READ_ONLY`, `SIMULATION`, `STATE_CHANGE`, or `PAYMENT`.
- Require an explicit allow rule for every `STATE_CHANGE` or `PAYMENT` action.
- Enforce configured asset, contract, method, and value limits before submission.
- Deny actions that exceed policy rather than automatically reducing or rewriting them.
- Preserve ERC-8021 builder attribution only when it is explicitly configured and validated.

## Runtime policy

- Bind the policy decision to a correlation/idempotency key so retries cannot bypass the original decision.
- Re-evaluate policy if network, destination, calldata, asset, amount, or execution mode changes.
- Route `TIMEOUT` and `UNKNOWN` results through reconciliation; never interpret them as permission to resubmit.
- Open the circuit breaker after repeated policy, RPC, or network-integrity failures.

## Audit result

Record a machine-readable decision without secrets:

- `ALLOW` — policy checks passed for the exact prepared action.
- `DENY` — an explicit policy rule rejected the action.
- `BLOCKED` — required context or configuration is missing/ambiguous.
- `REVIEW_REQUIRED` — execution requires a user-only authorization or approval step.

Each record should include the policy version, network, action class, correlation key, decision reason, and timestamp.

## Safe test cases

CI/testnet tests should verify that:

1. Wrong chain IDs are denied.
2. Missing policy configuration fails closed.
3. A retry cannot change a previous denial into an allow.
4. Modified calldata forces policy re-evaluation.
5. Payment/state-change requests are blocked in dry-run mode.
6. Logs contain no secrets or authorization material.

This checklist is documentation-only and does not authorize mainnet, paid, or on-chain execution.