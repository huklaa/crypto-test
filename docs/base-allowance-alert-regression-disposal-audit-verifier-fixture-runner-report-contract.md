# Base ERC-20 Allowance Alert Regression Disposal Audit Verifier Fixture Runner Report Contract

This document defines the deterministic local report emitted by the disposal-audit verifier fixture runner. It makes suite results reviewable in CI without copying fixture payloads or contacting wallets, chains, providers, or remote storage.

## Report inputs

The report accepts only the normalized local runner result, the declared stable verifier reason-code set, and supported schema/policy identifiers. No network-derived or wallet-derived values are valid inputs.

## Canonical fields

A normalized report contains only:

1. `schema_version`
2. `policy_version`
3. `suite_outcome`
4. `fixture_count`
5. `matched_fixture_count`
6. `stable_reason_code_count`
7. `covered_reason_code_count`
8. `missing_reason_codes` in canonical lexical order
9. `result_digest` over the normalized report fields excluding the digest itself

## Outcome rules

- `FIXTURE_SUITE_VERIFIED` requires every fixture expectation to match and complete stable reason-code coverage.
- `FIXTURE_SUITE_INVALID` requires at least one malformed, duplicate, non-deterministic, or mismatching fixture result.
- `FIXTURE_SUITE_INCOMPLETE` applies when deterministic execution succeeds but required local metadata or stable reason-code coverage is incomplete.

`FIXTURE_SUITE_INCOMPLETE` must never be rewritten as verified.

## Determinism requirements

- Integer counts use canonical decimal encoding.
- Missing reason codes are unique and lexically sorted.
- No timestamps, random identifiers, absolute paths, locale-dependent values, or environment defaults are permitted.
- Byte-identical normalized runner results and metadata must produce byte-identical reports and digests.

## Privacy boundary

The report MUST NOT contain fixture payloads, deleted evidence, wallet addresses, transaction hashes, balances, provider responses, credentials, hostnames, IP addresses, usernames, remote-storage identifiers, or free-form diagnostic text.

## Offline boundary

Report generation must not call RPC endpoints, inspect wallets, fetch URLs, query remote storage, request signatures, submit transactions, make purchases, or request fresh authorization. Network access is unnecessary.

## Review invariant

The report is diagnostic evidence only. It cannot authorize or trigger `approve`, `permit`, `transfer`, `transferFrom`, revocation, signing, broadcasting, purchasing, credential use, or any other on-chain or paid action.