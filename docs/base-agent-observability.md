# Base Agent Observability Checklist

A practical, no-mainnet checklist for making agent workflows easier to inspect, debug, and attribute before any transaction is broadcast.

## Goals

- Keep agent runs auditable with structured local logs.
- Separate read-only simulation from transaction submission.
- Record chain, environment, action type, and result without storing secrets.
- Make failed preflight checks explicit and machine-readable.
- Preserve builder-attribution metadata in test fixtures where applicable.

## Suggested event shape

```json
{
  "network": "base-sepolia",
  "mode": "dry-run",
  "action": "read-or-simulate",
  "status": "ok",
  "txBroadcast": false
}
```

## Safety rules

1. Never log private keys, seed phrases, session tokens, or authorization headers.
2. Default to `dry-run` and `txBroadcast: false`.
3. Treat missing network configuration as a hard failure.
4. Require an explicit separate step before any future transaction-broadcast capability is enabled.
5. Keep payment-capable flows disabled in local examples unless a test-only mock is used.

## CI / review checks

- Validate structured output against a small schema.
- Fail tests if secrets appear in fixtures or snapshots.
- Confirm examples use Base Sepolia or local simulation only.
- Confirm no example silently falls back to Base mainnet.
- Document expected failure states so agents can stop safely instead of guessing.

This document is intentionally limited to development and test workflows. It does not authorize wallet signatures, payments, mainnet transactions, or autonomous spending.
