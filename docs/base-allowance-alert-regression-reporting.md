# Base ERC-20 Allowance Alert Regression Reporting Contract

This document defines the reporting layer for the synthetic regression execution contract. It keeps CI output comparable, privacy-safe, and read-only.

## Goal

Turn deterministic fixture results into a compact report that can answer three questions without inferring undocumented wallet state:

1. Did every required regression case execute?
2. Which invariant failed first?
3. Is the result actionable as a code regression, fixture error, or insufficient evidence?

## Report envelope

A report contains:

- `schema_version`
- `suite_id`
- `generated_at`: deterministic CI timestamp supplied by the runner
- `fixture_count`
- `pass_count`
- `fail_count`
- `fixture_error_count`
- `coverage_complete`: boolean
- `suite_status`: `PASS`, `FAIL`, or `INCOMPLETE`
- `results`: ordered result records from the execution contract

Counts must be derived from emitted result records rather than supplied independently.

## Coverage rule

`coverage_complete` is true only when every case declared by the regression catalog appears exactly once in the report. Missing or duplicated case IDs make the suite `INCOMPLETE`, even if all reported cases pass.

An incomplete suite must never be represented as a passing suite.

## Suite status

Status is derived deterministically:

- `INCOMPLETE` when catalog coverage is missing, duplicated, or cannot be proven.
- `FAIL` when coverage is complete and at least one result is `FAIL` or `FIXTURE_ERROR`.
- `PASS` only when coverage is complete and every result is `PASS`.

No percentage threshold can override these rules.

## Failure summary

For each non-passing case, report only:

- `case_id`
- execution `status`
- first observable mismatch
- `actual_reason_code`
- expected reason code
- whether state changed
- dedupe effect

Do not guess a root cause that was not established by the fixture and execution evidence.

## Stable ordering

Results are sorted by catalog case ID. Failure summaries use the same order. This prevents nondeterministic CI diffs from execution scheduling.

## Privacy and data minimization

Reports use synthetic fixture identifiers. Do not emit real wallet addresses, signatures, transaction hashes, RPC credentials, access tokens, or raw provider payloads. Diagnostic notes should contain only the smallest information needed to reproduce the synthetic mismatch.

## CI exit contract

A future runner may map suite status to process exit codes:

- `PASS` -> success
- `FAIL` -> failure
- `INCOMPLETE` -> failure

The reporting layer itself does not call external services and does not retry network operations.

## Safety invariant

Reporting is read-only. It must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, request wallet signatures, submit or broadcast transactions, purchase assets, or request fresh authorization. A report describes synthetic regression evidence only; it cannot trigger remediation against a wallet.