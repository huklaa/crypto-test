# Base ERC-20 Allowance Alert Regression Disposal Audit Verifier Fixture Runner Contract

This document defines the deterministic local runner for the disposal-audit verifier fixture contract. It turns the fixture catalog into a reproducible CI check without contacting wallets, chains, providers, or remote storage.

## Runner inputs

The runner accepts only a local fixture directory, a supported verifier schema/policy pair, and an optional local output path. Fixture discovery is lexical and stable.

## Execution order

1. Enumerate fixture files in lexical path order.
2. Reject duplicate fixture identifiers before execution.
3. Parse each fixture without environment-dependent defaults.
4. Invoke the offline disposal-audit verifier exactly once per fixture.
5. Compare terminal outcome and ordered reason codes with the fixture expectation.
6. Record a minimal synthetic result containing fixture id, expected outcome, actual outcome, and stable reason-code comparison.
7. Compute coverage over the stable verifier reason-code set.

## Terminal runner outcomes

- `FIXTURE_SUITE_VERIFIED` — every fixture matches and every stable verifier reason code is covered.
- `FIXTURE_SUITE_INVALID` — at least one fixture is malformed, duplicated, non-deterministic, or produces an unexpected verifier result.
- `FIXTURE_SUITE_INCOMPLETE` — fixtures execute deterministically but stable reason-code coverage is incomplete or required local verifier metadata is unavailable.

`INCOMPLETE` must never be promoted to success.

## Determinism requirements

- No wall-clock timestamps, random identifiers, network-derived values, absolute host paths, locale-sensitive sorting, or mutable environment defaults.
- Repeated runs over byte-identical fixtures and verifier metadata must produce byte-equivalent normalized results.
- Reason-code comparison is exact and ordered.
- Coverage is computed from the declared stable verifier reason-code set, not inferred from observed failures.

## Minimal output boundary

Runner output MUST NOT include fixture payload copies, deleted evidence, wallet addresses, transaction hashes, provider responses, credentials, hostnames, IP addresses, usernames, remote-storage identifiers, or free-form diagnostics capable of carrying them.

## Offline CI boundary

The runner must not call RPC endpoints, query wallets, fetch URLs, inspect remote storage, upload evidence, request signatures, submit transactions, make purchases, or request fresh authorization. Network access is not required for a passing run.

## Failure behavior

A malformed fixture, duplicate identifier, expectation mismatch, non-deterministic normalized result, or unexpected reason code produces `FIXTURE_SUITE_INVALID`. Missing fixture coverage or unavailable local expected metadata produces `FIXTURE_SUITE_INCOMPLETE`.

## Safety invariant

Runner results are diagnostic only. No result may trigger `approve`, `permit`, `transfer`, `transferFrom`, revocation, signing, broadcasting, purchasing, credential use, or any other on-chain or paid remediation action.
