# Base Agent Verification Checklist

A practical verification layer for the project's Base agent tooling. The goal is to make automated actions inspectable and fail-safe before any transaction-capable mode is considered.

## Scope

- Default to read-only or dry-run execution.
- Use Base Sepolia for transaction-oriented development and testing.
- Never silently fall back to Base mainnet.
- Never request or expose private keys, seed phrases, or unrestricted wallet credentials.

## Preflight verification

Before an agent action is accepted, verify:

1. **Network** — expected chain ID and RPC environment are explicit.
2. **Mode** — `read-only`, `dry-run`, or `testnet` is visible in output.
3. **Intent** — requested operation is normalized into a machine-readable action.
4. **Policy** — action is checked against the project's safety guardrails.
5. **Inputs** — addresses, amounts, and required parameters are validated before execution.

## Result verification

Every operation should return enough structured data to independently inspect what happened:

```json
{
  "network": "base-sepolia",
  "mode": "dry-run",
  "action": "example-action",
  "allowed": true,
  "executed": false,
  "reason": "simulation-only"
}
```

For failed checks, return a non-zero exit status where appropriate and a stable error identifier instead of ambiguous prose-only output.

## Attribution readiness

When ERC-8021 Builder Code support is implemented, attribution should be verified as part of the generated transaction data before broadcast. A missing or malformed attribution field must not be silently ignored by transaction-capable tooling.

## Agent payment boundary

x402-compatible functionality may be detected and documented, but automated payment remains disabled by default. Tests should use mocks or test environments and clearly distinguish a payment requirement from a completed payment.

## CI checks

Recommended automated checks:

- confirm dry-run never broadcasts;
- reject unexpected chain IDs;
- reject missing required inputs;
- verify JSON output schema;
- scan logs for accidental secret material;
- test deterministic failure codes;
- keep mainnet transaction tests disabled.

## Definition of done

The verification layer is complete when a reviewer or another agent can determine the intended network, action, safety decision, execution status, and attribution state without relying on hidden context.