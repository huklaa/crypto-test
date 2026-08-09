# Chain ID checks

Before sending a transaction, confirm that the connected provider reports the expected chain ID. This protects scripts from running against the wrong network when wallets or RPC endpoints are switched.

Fail early on a mismatch and print both the expected and detected IDs. Keep this validation close to provider initialization so every command benefits from the same safeguard.
