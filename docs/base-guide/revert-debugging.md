# Revert debugging

When a contract call reverts, capture the method name, arguments, caller address, and network before changing code. Reproduce the failing call with the same state when possible.

Decode custom errors when ABI information is available. Clear error messages and small reproducible inputs are more useful than retrying the same transaction with a larger gas limit.
