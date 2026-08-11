# Base ERC-20 Allowance Alert Regression Evidence Disposal Audit Contract

This document defines the minimal, deterministic audit record produced after offline disposal verification. It closes the regression-evidence lifecycle without turning auditability into wallet, chain, remote-storage, purchase, or authorization activity.

## Scope

The audit contract consumes only the canonical local disposal-verification result and its retention-manifest digest. It records what was verified, not the deleted payload itself.

## Canonical audit fields

Each record contains only:

- `schema_version`
- `suite_id`
- `retention_manifest_digest`
- `disposal_record_digest`
- `verification_outcome`
- sorted `reason_codes`
- `policy_version`

No raw fixture, provider response, wallet identifier, transaction data, credential, hostname, absolute path, or external-storage identifier may be copied into the audit record.

## Deterministic emission rules

1. Validate the disposal-verification schema version.
2. Require exactly one terminal outcome: `DISPOSAL_VERIFIED`, `DISPOSAL_INVALID`, or `DISPOSAL_INCOMPLETE`.
3. Canonicalize all digests using the suite's declared digest format.
4. Sort and deduplicate reason codes lexically.
5. Reject unknown reason codes instead of preserving free-form diagnostics.
6. Bind the record to the immutable retention-manifest digest and disposal-record digest.
7. Emit the canonical audit record locally.

Identical canonical inputs must produce byte-equivalent audit content.

## Audit outcomes

- `AUDIT_RECORDED` — canonical local audit record emitted.
- `AUDIT_REJECTED` — integrity or policy validation failed.
- `AUDIT_INCOMPLETE` — required local verification evidence is unavailable.

An incomplete audit must never be promoted to recorded merely because the underlying payload is no longer present.

## Stable reason codes

- `AUDIT_SCHEMA_UNSUPPORTED`
- `TERMINAL_OUTCOME_MISSING`
- `TERMINAL_OUTCOME_AMBIGUOUS`
- `MANIFEST_DIGEST_MALFORMED`
- `DISPOSAL_DIGEST_MALFORMED`
- `REASON_CODE_UNKNOWN`
- `REASON_CODE_DUPLICATE`
- `PROHIBITED_AUDIT_FIELD_PRESENT`
- `LOCAL_VERIFICATION_EVIDENCE_MISSING`

## Privacy and minimization boundary

The audit record is metadata-only. It MUST NOT contain private keys, seed phrases, signatures, authorization headers, RPC credentials, real wallet addresses, user transaction hashes, balances, IP addresses, usernames, absolute workspace paths, raw provider payloads, or deleted evidence payloads.

Digests identify canonical synthetic artifacts for integrity checks; they must not be used as a pretext to retain the underlying expired payload.

## Offline CI boundary

Audit emission and validation use local synthetic metadata only. They must not call RPC endpoints, query wallets, fetch URLs, inspect or purchase external storage, upload evidence, request signatures, submit transactions, or request fresh authorization.

If required local verification evidence is missing, emit `AUDIT_INCOMPLETE` and stop.

## Safety invariant

The disposal audit is administrative and read-only with respect to wallets and chains. No audit outcome may trigger `approve`, `permit`, `transfer`, `transferFrom`, revocation, signing, broadcasting, purchasing, or any other on-chain or paid remediation action.
