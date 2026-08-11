# Base ERC-20 Allowance Alert Regression Evidence Disposal Verifier

This document defines deterministic, offline verification of disposal records emitted by the regression evidence retention contract. It verifies that expiry removes retained synthetic payloads without turning cleanup into a network, wallet, storage-purchase, or authorization action.

## Scope

The verifier consumes only a local disposal record plus the canonical retention manifest. It does not inspect user wallets, chain state, remote storage, or mutable provider data.

## Terminal outcomes

Every verification ends in exactly one outcome:

- `DISPOSAL_VERIFIED` — the record is complete, canonical, privacy-safe, and consistent with the retention manifest.
- `DISPOSAL_INVALID` — one or more deterministic integrity or policy checks fail.
- `DISPOSAL_INCOMPLETE` — required local evidence is missing, so disposal cannot be proven.

Absence of evidence must never be interpreted as successful deletion.

## Deterministic verification order

1. Validate the disposal-record schema version.
2. Match `suite_id` and immutable suite status to the retention manifest.
3. Match the verification outcome and retention class.
4. Canonicalize and sort retained artifact digests.
5. Reject unknown, duplicate, malformed, or non-canonical digests.
6. Validate the disposal reason against the retention class.
7. Confirm that the record contains no prohibited payload fields or identifiers.
8. Confirm that no retained payload is represented as surviving beyond the configured local expiry boundary.
9. Emit one terminal outcome and sorted reason codes.

## Stable reason codes

- `DISPOSAL_SCHEMA_UNSUPPORTED`
- `SUITE_ID_MISMATCH`
- `SUITE_STATUS_MISMATCH`
- `VERIFICATION_OUTCOME_MISMATCH`
- `RETENTION_CLASS_MISMATCH`
- `ARTIFACT_DIGEST_MALFORMED`
- `ARTIFACT_DIGEST_DUPLICATE`
- `ARTIFACT_DIGEST_UNKNOWN`
- `DISPOSAL_REASON_INVALID`
- `PROHIBITED_FIELD_PRESENT`
- `EXPIRY_EVIDENCE_MISSING`
- `LOCAL_PAYLOAD_STILL_RETAINED`

When multiple reasons apply, output them in lexical order so identical inputs produce identical diagnostics.

## Privacy boundary

The disposal verifier MUST reject records containing private keys, seed phrases, signatures, authorization headers, RPC credentials, real wallet addresses, user transaction hashes, balances, host usernames, IP addresses, absolute workspace paths, or raw provider payloads.

A valid disposal record proves administrative cleanup of synthetic regression evidence only. It is not proof of deletion from any external service.

## Offline CI boundary

Verification must use local synthetic artifacts only. It must not call RPC endpoints, query wallets, fetch URLs, inspect external storage, upload evidence, request signatures, purchase storage, or request fresh authorization.

If local expiry evidence is unavailable, return `DISPOSAL_INCOMPLETE` with `EXPIRY_EVIDENCE_MISSING`; do not authorize or probe an external storage provider to obtain stronger proof.

## Safety invariant

Disposal verification is administrative and read-only with respect to wallets and chains. It must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, request wallet signatures, submit or broadcast transactions, purchase assets or services, or request fresh authorization. A failed disposal verification must never trigger wallet remediation.