# Base Agent State Machine Checklist

A small operational checklist for making agent execution states explicit and safe on Base-oriented workflows.

## Goal

Avoid ambiguous execution paths by requiring every agent action to move through a finite, auditable state model. This complements the existing timeout, reconciliation, idempotency, circuit-breaker, and audit-trail guidance.

## Recommended states

- `CREATED` — request accepted but no network action attempted.
- `VALIDATING` — chain ID, inputs, policy, limits, and attribution are checked.
- `READY` — validation passed and the action is eligible for execution.
- `SUBMITTING` — a bounded submission attempt is in progress.
- `PENDING` — submission is known but final outcome is not yet confirmed.
- `CONFIRMED` — read-only verification confirms the expected result.
- `REVERTED` — receipt/status confirms failure.
- `UNKNOWN` — outcome cannot be established safely.
- `BLOCKED` — policy, network, authorization, circuit breaker, or safety rule prevents execution.

## Transition rules

1. Never transition directly from `CREATED` to `SUBMITTING`; validation is mandatory.
2. `UNKNOWN` must not automatically transition back to `SUBMITTING`.
3. Reconcile `PENDING` and `UNKNOWN` with read-only checks before any retry decision.
4. Require the same idempotency key across retries/reconciliation for one logical action.
5. A circuit-breaker `OPEN` state forces the action to `BLOCKED`.
6. A timeout during submission produces `UNKNOWN` unless a transaction identifier is already known; do not assume failure.
7. Terminal states (`CONFIRMED`, `REVERTED`, `BLOCKED`) must be immutable for the same attempt record.

## Safety metadata

Record for every transition:

- timestamp
- previous state and next state
- correlation/idempotency ID
- chain ID and execution mode
- reason code
- sanitized error class when applicable
- ERC-8021 attribution status when relevant

Never log private keys, seed phrases, signatures, authorization headers, or other secrets.

## Dry-run expectations

CI/tests should cover:

- valid happy-path transitions
- illegal transition rejection
- timeout to `UNKNOWN`
- `UNKNOWN` reconciliation without rebroadcast
- duplicate request handling
- circuit-breaker to `BLOCKED`
- wrong-network validation failure
- terminal-state immutability

Tests should use mocks, local fixtures, or Base Sepolia/read-only data. No mainnet transaction is required.

## Principle

An agent should always be able to answer: **what state is this action in, why is it there, and what transition is allowed next?** If it cannot answer those safely, stop rather than guess.
