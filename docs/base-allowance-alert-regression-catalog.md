# Base ERC-20 Allowance Alert Regression Catalog

This document turns post-incident findings into deterministic, read-only regression cases for the Base allowance alert pipeline.

## Purpose

Every reproducible incident should leave behind a compact fixture that proves the failure cannot silently return. The catalog covers data validation, ordering, deduplication, classification, observability, and recovery behavior.

## Required fixture fields

Each regression fixture records:

- `case_id`: stable identifier
- `root_cause`: one documented post-incident category
- `chain_id`: expected Base chain context
- `schema_version`: producer schema version
- `previous_verified_state`: last trusted allowance state
- `input_event`: synthetic alert/event input
- `expected_consumer_result`: accept, suppress, warn, or block
- `expected_health_state`: `HEALTHY`, `DEGRADED`, or `BLOCKED`
- `expected_reason_code`: deterministic reason

Fixtures must contain synthetic addresses and values only. Never store private keys, signatures, seed phrases, authorization secrets, or production wallet identifiers.

## Minimum regression cases

### REG-001 — unavailable source

Given an RPC/data-source failure, the consumer must preserve the last verified allowance state and emit a data warning. It must not reinterpret missing data as `NONE`.

### REG-002 — stale observation

Given an observation outside the accepted freshness window, the consumer must reject it as stale and must not overwrite a newer verified state.

### REG-003 — unsupported schema

Given an unknown schema version, processing must fail closed with a schema mismatch result. No allowance classification may be inferred from unrecognized fields.

### REG-004 — chain mismatch

Given an event whose chain ID differs from the configured Base chain context, processing must block that event and preserve existing verified state.

### REG-005 — out-of-order event

Given a valid event older than the current verified event, the consumer must reject the older event deterministically.

### REG-006 — duplicate event

Given the same deterministic dedupe key twice, the second event must be suppressed without changing counters that represent unique transitions.

### REG-007 — policy boundary

Given a transition from `FINITE` to `UNLIMITED`, classification must match the documented high-risk policy. Given RPC uncertainty instead, classification must remain `DATA_WARNING` rather than a fabricated risk conclusion.

### REG-008 — recovery

After a `BLOCKED` or `DEGRADED` condition, health may return to `HEALTHY` only after fresh, schema-valid, chain-valid evidence is accepted. Recovery must not be inferred from elapsed time alone.

## Acceptance rules

A regression case passes only when the consumer result, reason code, health state, ordering behavior, and deduplication behavior all match the fixture. Partial matches fail the case.

When behavior intentionally changes, update the policy documentation and add a new fixture showing both the previous expectation and the new expectation. Do not silently rewrite historical incident evidence.

## Safety invariant

Regression execution is analysis-only and synthetic. Tests must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, request signatures, submit transactions, or broadcast wallet operations. Any remediation requiring an on-chain action remains outside this workflow and under explicit user control.
