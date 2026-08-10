# Base Agent Readiness

A lightweight, no-mainnet checklist for preparing this toolkit for agent-native Base workflows.

## Why this matters

Base's 2026 builder strategy highlights agent-native smart accounts, documentation, CLI/MCP access, and standards such as x402. This document tracks repository-level preparation without requiring wallet signatures, paid services, or onchain transactions.

## Repository checklist

- [x] Keep reusable crypto helpers dependency-light and deterministic.
- [x] Document Base-specific behavior separately from generic utilities.
- [ ] Expose stable machine-readable command outputs for automation clients.
- [ ] Add explicit input validation and predictable error objects for agent calls.
- [ ] Add dry-run examples that never broadcast transactions.
- [ ] Document environment variables without committing secrets.
- [ ] Add tests for malformed addresses, unsupported chains, and RPC failures.
- [ ] Evaluate x402 integration only in a local/test environment before any paid flow.
- [ ] Document attribution metadata for future ERC-8021-compatible flows.

## Safety boundary

Agent-oriented examples in this repository should default to read-only or dry-run behavior. Mainnet broadcasts, token approvals, purchases, paid API calls, and fresh wallet authorizations must remain explicit user actions.

## Next contribution

Implement a small JSON-output wrapper around one existing read-only utility, then cover success and failure responses with tests. This creates an agent-friendly interface without introducing onchain risk.
