# Base ERC-20 Allowance Alert Regression Evidence Verifier Contract

This document defines the read-only verifier for the synthetic regression evidence bundle. It turns the bundle contract into a deterministic review procedure suitable for CI without contacting wallets, RPC providers, or external storage.

## Verification order

A verifier MUST evaluate a bundle in this order:

1. Parse the manifest using the declared `bundle_schema_version`.
2. Require exactly one instance of every required artifact.
3. Reject undeclared executable or secret-bearing artifact types.
4. Normalize paths and reject path traversal, absolute paths, and duplicate normalized paths.
5. Recompute every artifact digest from bytes after the contract-defined normalization rules.
6. Recompute `fixture_set_digest` and `report_digest`.
7. Check that catalog, execution, and reporting revisions are present and internally consistent.
8. Confirm that the suite status is one of `PASS`, `FAIL`, or `INCOMPLETE`.
9. Apply evidence-minimization checks.
10. Emit one terminal verification outcome.

No later step may repair a failure discovered by an earlier step.

## Terminal outcomes

The verifier emits exactly one of:

- `VERIFIED` — all required evidence exists, schemas are supported, and all digests match.
- `INVALID` — evidence conflicts with the manifest, violates schema/integrity rules, or contains a prohibited artifact.
- `INCOMPLETE` — required evidence is missing, duplicated, or cannot be proven.

`VERIFIED` describes evidence integrity only. It does not change the regression suite result. In particular, a verified bundle whose suite status is `FAIL` remains a failed suite, and an `INCOMPLETE` suite can never be upgraded to `PASS`.

## Deterministic diagnostics

Diagnostics use stable reason codes so CI output can be compared across runs:

- `UNSUPPORTED_BUNDLE_SCHEMA`
- `MISSING_REQUIRED_ARTIFACT`
- `DUPLICATE_REQUIRED_ARTIFACT`
- `UNDECLARED_ARTIFACT`
- `UNSAFE_ARTIFACT_PATH`
- `DIGEST_MISMATCH`
- `REVISION_MISMATCH`
- `INVALID_SUITE_STATUS`
- `EVIDENCE_POLICY_VIOLATION`

Diagnostics are sorted by reason code and normalized artifact path. Timestamps and host-specific metadata must not influence ordering or identity.

## Evidence-minimization checks

The verifier rejects evidence that declares or embeds material outside the synthetic test boundary, including:

- private keys, seed phrases, signatures, session secrets, or authorization headers;
- RPC credentials;
- real wallet addresses or balances;
- transaction hashes derived from user activity;
- raw provider payloads containing account identifiers;
- host usernames, IP addresses, or unrelated environment variables.

A verifier should inspect structured fields where possible. It must not claim exhaustive secret detection from heuristic text scanning alone.

## Offline CI boundary

Verification must be possible from the bundle bytes and pinned contract revisions alone. The verifier must not:

- call an RPC endpoint;
- query a wallet or browser extension;
- fetch mutable remote content;
- request a signature or authorization;
- upload evidence as part of verification.

If a referenced revision is not packaged or otherwise immutably available to the CI job, the result is `INCOMPLETE`, not a network fetch.

## Suggested machine-readable record

Each run may emit:

```text
bundle_schema_version
suite_id
suite_status
verification_outcome
verified_artifact_count
reason_codes[]
fixture_set_digest
report_digest
```

The record must exclude wallet identifiers, credentials, and host-specific personal metadata.

## Safety invariant

Evidence verification is read-only and offline. It must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, request wallet signatures, submit or broadcast transactions, purchase assets, or request fresh authorization. No verifier result may trigger wallet remediation.