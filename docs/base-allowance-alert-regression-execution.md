# Base ERC-20 Allowance Alert Regression Execution Contract

This document defines how the synthetic regression catalog is executed and reported without wallet writes or production side effects.

## Goal

Turn the regression catalog into a deterministic execution contract so a future test runner can produce comparable results across changes without weakening the read-only safety boundary.

## Input contract

A runner consumes one fixture at a time with these required fields:

- `case_id`
- `root_cause`
- `chain_id`
- `schema_version`
- `previous_verified_state`
- `input_event`
- `expected_consumer_result`
- `expected_health_state`
- `expected_reason_code`

Missing required fields are a fixture error and must fail closed before consumer evaluation.

## Deterministic execution order

For each fixture:

1. Validate fixture shape and synthetic-only data policy.
2. Validate schema version.
3. Validate configured Base chain context.
4. Evaluate freshness and event ordering.
5. Evaluate the deterministic dedupe key.
6. Apply documented allowance classification policy.
7. Derive consumer result and health state.
8. Compare every expected field with the actual result.
9. Emit a compact result record.

A failed earlier validation must not be bypassed by later classification logic.

## Result record

Each execution returns:

- `case_id`
- `status`: `PASS`, `FAIL`, or `FIXTURE_ERROR`
- `actual_consumer_result`
- `actual_health_state`
- `actual_reason_code`
- `state_changed`: boolean
- `dedupe_effect`: accepted or suppressed
- `notes`: short deterministic diagnostic

A `PASS` requires all documented expectations to match. Partial matches are `FAIL`.

## State isolation

Every fixture starts from its declared `previous_verified_state`. Tests must not depend on execution order or mutate another fixture's state. Duplicate-event cases may use two events inside the same fixture, but their state remains local to that case.

## Failure reporting

Reports should identify the smallest observable mismatch rather than infer an undocumented root cause. Unknown or insufficient evidence remains explicit; it must not be converted into a guessed allowance state.

## CI suitability

The contract is designed for offline or mocked CI execution. A CI implementation should use synthetic addresses, deterministic timestamps, fixed chain IDs, and mocked data-source responses. Network access is not required to prove these invariants.

## Safety invariant

Regression execution is read-only and synthetic. A runner implementing this contract must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, request wallet signatures, submit transactions, broadcast operations, purchase assets, or request fresh authorization. Any such capability is outside the regression runner and requires explicit user-controlled handling.
