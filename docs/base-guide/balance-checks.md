# Balance checks

Read balances immediately before actions that depend on them instead of relying on values cached when the application started. Wallet balances and token balances can change between screens or transactions.

When reporting an insufficient balance, distinguish the native asset needed for fees from the token being transferred so the error points to the actual missing resource.
