# Base ERC-20 Allowance Alert Regression Evidence Retention Contract

This document defines deterministic retention and disposal rules for synthetic regression evidence after offline verification. It extends the evidence verifier without introducing network, wallet, or authorization dependencies.

## Scope

Retention applies only to artifacts admitted by the evidence bundle and verifier contracts. Evidence containing real wallet identifiers, credentials, signatures, user transaction hashes, RPC secrets, or unrelated host metadata is prohibited rather than retained.

## Retention classes

Every verified bundle is assigned exactly one class:

- `EPHEMERAL_PASS` — verified evidence for a passing suite; retain only for the current CI job or explicitly configured short diagnostic window.
- `DIAGNOSTIC_FAIL` — verified evidence for a failing suite; retain the minimum synthetic artifacts needed to reproduce the failure.
- `DIAGNOSTIC_INCOMPLETE` — incomplete evidence; retain only the manifest and privacy-safe diagnostics needed to explain what is missing.
- `REJECTED` — invalid or policy-violating evidence; do not promote into normal retained evidence.

A retention class never changes the underlying suite or verification outcome.

## Deterministic decision order

1. Confirm the verifier terminal outcome.
2. Reject evidence-policy violations from normal retention.
3. Read the immutable suite status.
4. Assign the matching retention class.
5. Apply minimization before any retention copy is produced.
6. Record the retained artifact names and digests.
7. Apply the configured expiry policy.
8. Emit one disposal record when the retention window ends.

Retention duration is configuration, not evidence identity. Changing a duration must not alter fixture, report, or bundle digests.

## Minimization rules

Retained evidence MUST exclude:

- private keys, seed phrases, signatures, session secrets, authorization headers, and RPC credentials;
- real wallet addresses, balances, or transaction hashes derived from user activity;
- raw provider payloads containing account identifiers;
- host usernames, IP addresses, absolute workspace paths, and unrelated environment variables;
- duplicate artifacts already represented by a canonical digest.

For a failing suite, retain only artifacts required to reproduce the failing fixture plus the manifest, report, and stable diagnostics. A passing suite should not accumulate long-lived fixture output by default.

## Disposal record

Disposal may emit a privacy-safe record containing:

```text
bundle_schema_version
suite_id
suite_status
verification_outcome
retention_class
retained_artifact_digests[]
disposal_reason
```

The record must not contain artifact payloads, wallet identifiers, credentials, or user activity data.

## Stable disposal reasons

- `PASS_WINDOW_EXPIRED`
- `FAIL_DIAGNOSTIC_WINDOW_EXPIRED`
- `INCOMPLETE_WINDOW_EXPIRED`
- `POLICY_REJECTED`
- `SUPERSEDED_SYNTHETIC_EVIDENCE`

Reason codes are sorted deterministically when more than one applies.

## Offline CI boundary

Retention and disposal logic must operate on local synthetic evidence only. It must not fetch mutable remote content, call RPC endpoints, query wallets, request signatures, upload evidence, purchase storage, or request fresh authorization.

If the configured environment cannot provide an approved local retention location, the safe result is no retained payload plus a privacy-safe diagnostic. The workflow must not authorize a new external storage service automatically.

## Safety invariant

Evidence retention is administrative and read-only with respect to wallets and chains. It must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, request wallet signatures, submit or broadcast transactions, purchase assets or services, or request fresh authorization. Retention expiry must never trigger wallet remediation.
