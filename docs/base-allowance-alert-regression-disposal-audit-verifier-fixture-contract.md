# Base ERC-20 Allowance Alert Regression Disposal Audit Verifier Fixture Contract

This document defines deterministic local fixtures for the disposal-audit verifier. The fixture set proves verifier outcomes and reason-code behavior without recovering deleted evidence or contacting wallets, chains, providers, or remote storage.

## Scope

Fixtures contain synthetic canonical audit metadata only. Each fixture declares one expected terminal verifier outcome and an ordered list of expected reason codes.

## Required fixture classes

1. `valid_minimal_audit` — canonical record; expects `AUDIT_VERIFIED`.
2. `unsupported_schema` — unsupported schema version; expects `AUDIT_INVALID` with `AUDIT_SCHEMA_UNSUPPORTED`.
3. `unsupported_policy` — unsupported policy version; expects `AUDIT_INVALID` with `AUDIT_POLICY_UNSUPPORTED`.
4. `missing_required_field` — canonical field omitted; expects `AUDIT_INVALID` with `AUDIT_FIELD_MISSING`.
5. `unknown_field` — unexpected field present; expects `AUDIT_INVALID` with `AUDIT_FIELD_UNKNOWN`.
6. `prohibited_payload_field` — payload-bearing field present; expects `AUDIT_INVALID` with `AUDIT_PROHIBITED_FIELD_PRESENT`.
7. `invalid_terminal_outcome` — invalid disposal outcome; expects `AUDIT_INVALID` with `AUDIT_TERMINAL_OUTCOME_INVALID`.
8. `invalid_manifest_digest` — malformed retention-manifest digest; expects `AUDIT_INVALID` with `AUDIT_MANIFEST_DIGEST_INVALID`.
9. `invalid_disposal_digest` — malformed disposal-record digest; expects `AUDIT_INVALID` with `AUDIT_DISPOSAL_DIGEST_INVALID`.
10. `duplicate_reason_code` — duplicate reason code; expects `AUDIT_INVALID` with `AUDIT_REASON_CODE_DUPLICATE`.
11. `unsorted_reason_codes` — non-lexical reason-code ordering; expects `AUDIT_INVALID` with `AUDIT_REASON_CODE_UNSORTED`.
12. `audit_digest_mismatch` — canonical digest differs from expected digest; expects `AUDIT_INVALID` with `AUDIT_DIGEST_MISMATCH`.
13. `missing_expected_metadata` — required local schema/policy expectation absent; expects `AUDIT_INCOMPLETE` with `AUDIT_EXPECTED_METADATA_MISSING`.

## Determinism requirements

- Fixture names are stable and unique.
- Object keys use one canonical ordering before digest calculation.
- Expected reason codes are unique and lexically sorted unless the fixture intentionally tests ordering or duplication failure.
- Repeated execution over byte-identical fixtures must produce byte-equivalent verifier output.
- A fixture may not depend on wall-clock time, network state, account state, environment-specific absolute paths, or random values.

## Privacy boundary

Fixtures MUST use synthetic placeholders and MUST NOT contain real wallet addresses, transaction hashes, provider responses, credentials, hostnames, IP addresses, usernames, deleted evidence payloads, external-storage identifiers, or free-form diagnostics capable of carrying them.

## Offline CI boundary

Fixture generation and execution are local-only. They must not call RPC endpoints, query wallets, fetch URLs, inspect remote storage, upload evidence, request signatures, submit transactions, make purchases, or request fresh authorization.

## Completion rule

The fixture suite is complete only when every stable verifier reason code has either a positive-path assertion or an explicit negative fixture. Missing fixture coverage must be reported as incomplete coverage, never silently treated as a passing verifier suite.

## Safety invariant

Fixtures are test data only. No fixture result may trigger `approve`, `permit`, `transfer`, `transferFrom`, revocation, signing, broadcasting, purchasing, credential use, or any other on-chain or paid remediation action.
