# Base Builder Codes and ERC-8021

The current Base Portfolio Reader is read-only. It performs `eth_chainId`, `eth_blockNumber`, `eth_getBalance`, and ERC-20 `balanceOf` calls, but it never creates, signs, or submits a transaction. ERC-8021 attribution is therefore intentionally **not included**: Builder Codes attribute transactions, so adding a suffix to read-only RPC calls would have no useful effect.

If the application later introduces an explicit onchain action, register the app on [Base.dev](https://base.dev), obtain its Builder Code, and add the resulting data suffix only to transaction calldata. With a compatible viem wallet client, pass the suffix through the wallet's `dataSuffix` capability when sending calls. Keep the feature optional, display the complete transaction for user review, and require an explicit wallet confirmation before signing.

Do not append Builder Code data to arbitrary messages, RPC reads, or offchain analytics requests. Revisit the current [Base Builder Codes documentation](https://docs.base.org/apps/builder-codes/builder-codes) before implementing, because wallet capability support and registration requirements can evolve.
