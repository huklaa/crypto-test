# Base ERC-20 Allowance Alert Post-Incident Review

This document defines a deterministic, read-only post-incident review process for the Base allowance alert pipeline.

## Scope

Use this review after an alerting incident has been stabilized with the incident runbook. The review covers detection, classification, consumer behavior, observability, and recovery evidence. It never performs or recommends an automatic wallet mutation.

## Evidence to preserve

- incident start and stabilization timestamps
- affected chain ID and schema version
- alert reason codes and severity transitions
- dedupe and ordering decisions
- RPC/data-source health at detection time
- consumer health state (`HEALTHY`, `DEGRADED`, or `BLOCKED`)
- relevant counters and freshness observations

Do not store private keys, signatures, seed phrases, raw authorization secrets, or wallet addresses as metric labels.

## Review questions

1. Was the first signal based on verified data or a `DATA_WARNING`?
2. Did any missing or stale telemetry get mistaken for a safe allowance state?
3. Were duplicate and out-of-order events handled deterministically?
4. Did an unsupported schema or chain ID fail closed?
5. Was the incident state observable without requiring a wallet action?
6. Did recovery preserve the last verified state until fresh evidence arrived?

## Root-cause categories

Classify the primary cause as one of:

- `SOURCE_UNAVAILABLE` — RPC or upstream data could not be verified.
- `STALE_DATA` — observations exceeded the accepted freshness window.
- `SCHEMA_MISMATCH` — producer and consumer schema versions were incompatible.
- `CHAIN_MISMATCH` — an event targeted an unexpected chain ID.
- `ORDERING_ERROR` — an older event arrived after a newer verified state.
- `DEDUPLICATION_ERROR` — a duplicate was emitted or a legitimate transition was suppressed.
- `POLICY_ERROR` — deterministic classification did not match the documented policy.
- `UNKNOWN` — evidence is insufficient; do not infer a cause.

## Corrective-action rules

Every corrective action must be testable and linked to a concrete failure mode. Prefer changes to validation, fixtures, documentation, or observability before changing classification policy. A policy change requires an explicit test vector demonstrating the old and new behavior.

## Closure criteria

An incident can be closed only when:

- the root cause is supported by preserved evidence or remains explicitly `UNKNOWN`;
- a regression test exists for reproducible failures;
- monitoring can distinguish the failure from a legitimate allowance transition;
- no unresolved `BLOCKED` condition is hidden by a healthy status;
- documentation reflects any changed invariant.

## Safety invariant

Post-incident review is analysis only. It must never call `approve`, `permit`, `transfer`, `transferFrom`, revoke permissions, sign messages, submit transactions, or broadcast wallet operations. Any remediation requiring an on-chain action remains a separate user-controlled workflow.