# Dependency updates

Update Web3 and build dependencies deliberately rather than in large unrelated batches. Read changelogs for provider, signer, ABI, and transaction behavior changes before upgrading.

After an update, rebuild contracts, run tests, and exercise a representative RPC read and signed transaction flow in a safe environment. Commit lockfile changes together with the dependency change.
