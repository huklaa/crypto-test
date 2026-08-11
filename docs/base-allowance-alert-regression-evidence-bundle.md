# Base ERC-20 Allowance Alert Regression Evidence Bundle Contract

This document defines the evidence artifact produced after the synthetic regression reporting stage. The bundle is designed for reproducible CI review without exposing wallet data or enabling remediation actions.

## Goal

Preserve enough deterministic evidence to answer:

1. Which catalog and execution/reporting contract versions produced the result?
2. Can another CI run reproduce the same synthetic outcome?
3. Is every included artifact safe to retain and share in a code-review context?

## Bundle manifest

Each bundle contains a manifest with:

- `bundle_schema_version`
- `suite_id`
- `catalog_revision`
- `execution_contract_revision`
- `reporting_contract_revision`
- `fixture_set_digest`
- `report_digest`
- `suite_status`: `PASS`, `FAIL`, or `INCOMPLETE`
- ordered `artifact_digests`

Digests identify synthetic inputs and outputs; they must not be derived from private wallet material.

## Required artifacts

A complete bundle includes exactly one of each:

- regression catalog snapshot or immutable revision reference
- synthetic fixture-set manifest
- execution result records
- regression report
- minimal runner metadata needed for reproducibility

Missing, duplicated, or unverifiable required artifacts make bundle status `INCOMPLETE` regardless of the regression report status.

## Deterministic integrity

Artifact paths are sorted lexicographically before digesting. Manifest serialization uses stable field ordering and normalized line endings. Timestamps are metadata only and must not affect fixture or report identity.

A verifier must reject a bundle when a declared digest does not match its artifact. It must not repair or silently replace evidence.

## Evidence minimization

The bundle must not contain:

- real wallet addresses or balances
- signatures, private keys, seed phrases, or session secrets
- transaction hashes from user activity
- RPC credentials or authorization headers
- raw provider payloads that can contain account identifiers

Synthetic addresses may be used only when clearly marked as fixtures and generated deterministically from non-secret test constants.

## Retention boundary

Evidence exists to reproduce code behavior, not to profile a wallet. Runner metadata should therefore be limited to software/runtime versions and deterministic test configuration. Hostnames, usernames, IP addresses, and unrelated environment variables are excluded.

## Verification outcome

Bundle verification returns one of:

- `VERIFIED`: every required artifact exists and all declared digests match.
- `INVALID`: at least one artifact conflicts with its declared digest or schema.
- `INCOMPLETE`: required evidence is absent, duplicated, or cannot be proven.

Verification never upgrades an `INCOMPLETE` regression suite to `PASS`.

## CI use

A future CI job may retain the evidence bundle as a build artifact for failed or incomplete synthetic suites. Retention/upload policy is configured outside this contract; this document does not call external storage or network services.

## Safety invariant

Evidence generation and verification are read-only. They must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, request wallet signatures, submit or broadcast transactions, purchase assets, or request fresh authorization. No evidence outcome can trigger wallet remediation.