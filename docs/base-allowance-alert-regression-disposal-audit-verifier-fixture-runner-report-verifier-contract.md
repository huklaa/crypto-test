# Base ERC-20 Allowance Alert Regression Disposal Audit Verifier Fixture Runner Report Verifier Contract

This document defines a deterministic offline verifier for the disposal-audit fixture runner report. It validates that a report is canonical, internally consistent, privacy-minimized, and reproducible without contacting wallets, chains, providers, or remote storage.

## Verifier inputs

The verifier accepts only the normalized local report, the declared stable verifier reason-code set, and supported schema/policy identifiers. Network-derived, wallet-derived, timestamped, or environment-derived values are invalid inputs.

## Required checks

The verifier MUST check that:

1. `schema_version` and `policy_version` are supported.
2. `fixture_count`, `matched_fixture_count`, `stable_reason_code_count`, and `covered_reason_code_count` use canonical non-negative decimal encoding.
3. `matched_fixture_count <= fixture_count`.
4. `covered_reason_code_count <= stable_reason_code_count`.
5. `missing_reason_codes` contains unique stable reason codes in canonical lexical order.
6. `covered_reason_code_count + len(missing_reason_codes) == stable_reason_code_count`.
7. `result_digest` matches the digest recomputed over the normalized report fields excluding the digest itself.
8. no forbidden privacy-boundary fields are present.

## Outcome verification

- `REPORT_VERIFIED` requires all structural, count, coverage, privacy, and digest checks to pass.
- `REPORT_INVALID` applies to malformed fields, impossible counts, duplicate/unknown reason codes, non-canonical ordering, forbidden data, or digest mismatch.
- `REPORT_INCOMPLETE` applies when the report is structurally deterministic but required supported schema/policy metadata or declared stable reason-code metadata is unavailable locally.

`REPORT_INCOMPLETE` must never be promoted to `REPORT_VERIFIED`.

## Determinism requirements

Verification must not depend on timestamps, randomness, absolute paths, locale, host state, usernames, process identifiers, or environment defaults. Byte-identical normalized inputs and verifier metadata must produce the same outcome and stable reason code.

## Privacy boundary

The verifier MUST reject reports containing fixture payloads, deleted evidence, wallet addresses, transaction hashes, balances, provider responses, credentials, hostnames, IP addresses, usernames, remote-storage identifiers, or free-form diagnostic text.

## Offline boundary

Verification must not call RPC endpoints, inspect wallets, fetch URLs, query remote storage, request signatures, submit transactions, make purchases, or request fresh authorization.

## Review invariant

A verified report is diagnostic evidence only. It cannot authorize or trigger `approve`, `permit`, `transfer`, `transferFrom`, revocation, signing, broadcasting, purchasing, credential use, or any other on-chain or paid action.
