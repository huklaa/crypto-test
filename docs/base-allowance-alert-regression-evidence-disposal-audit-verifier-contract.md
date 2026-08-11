# Base ERC-20 Allowance Alert Regression Evidence Disposal Audit Verifier Contract

This document defines deterministic offline verification for the minimal disposal audit record. It verifies that auditability does not reintroduce evidence that the retention and disposal stages intentionally removed.

## Scope

The verifier consumes only a canonical local disposal-audit record plus the expected local policy/schema metadata. It does not recover deleted evidence or inspect wallets, chains, providers, or remote storage.

## Verification order

1. Validate `schema_version` and `policy_version` against the supported local versions.
2. Require exactly the canonical audit fields and reject prohibited or unknown payload-bearing fields.
3. Require one terminal disposal verification outcome.
4. Validate the retention-manifest and disposal-record digest syntax.
5. Require `reason_codes` to be known, unique, and lexically sorted.
6. Re-canonicalize the audit record and compare its digest with any locally supplied expected audit digest.
7. Emit exactly one verifier outcome.

Identical canonical inputs must produce byte-equivalent verifier output.

## Verifier outcomes

- `AUDIT_VERIFIED` — the record is canonical, internally consistent, and policy compliant.
- `AUDIT_INVALID` — the record is present but violates integrity, schema, or minimization rules.
- `AUDIT_INCOMPLETE` — required local metadata for verification is unavailable.

Missing metadata must never be treated as verification success.

## Stable reason codes

- `AUDIT_SCHEMA_UNSUPPORTED`
- `AUDIT_POLICY_UNSUPPORTED`
- `AUDIT_FIELD_MISSING`
- `AUDIT_FIELD_UNKNOWN`
- `AUDIT_PROHIBITED_FIELD_PRESENT`
- `AUDIT_TERMINAL_OUTCOME_INVALID`
- `AUDIT_MANIFEST_DIGEST_INVALID`
- `AUDIT_DISPOSAL_DIGEST_INVALID`
- `AUDIT_REASON_CODE_UNKNOWN`
- `AUDIT_REASON_CODE_DUPLICATE`
- `AUDIT_REASON_CODE_UNSORTED`
- `AUDIT_DIGEST_MISMATCH`
- `AUDIT_EXPECTED_METADATA_MISSING`

## Minimization checks

Verification MUST fail if the audit record contains raw fixtures, provider responses, wallet identifiers, transaction data, credentials, hostnames, IP addresses, usernames, absolute workspace paths, external-storage identifiers, deleted evidence payloads, or free-form diagnostic text capable of carrying those values.

Digests are integrity references only and must not be resolved into deleted payloads.

## Offline CI boundary

The verifier uses local synthetic metadata only. It must not call RPC endpoints, query wallets, fetch URLs, inspect remote storage, upload evidence, request signatures, submit transactions, make purchases, or request fresh authorization.

If expected local policy/schema metadata is missing, emit `AUDIT_INCOMPLETE` and stop.

## Safety invariant

Audit verification is administrative and read-only with respect to wallets and chains. No verifier result may trigger `approve`, `permit`, `transfer`, `transferFrom`, revocation, signing, broadcasting, purchasing, credential use, or any other on-chain or paid remediation action.