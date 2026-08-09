# CI checks

Keep continuous integration focused on deterministic checks that can run without wallet secrets: formatting, linting, unit tests, contract compilation, and static validation.

Separate any network-dependent tests from the default CI path or mock their provider responses. This keeps pull requests reliable even when a public RPC endpoint is slow or unavailable.
