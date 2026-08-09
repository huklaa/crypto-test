# Logging

Log enough context to trace a failed workflow without leaking secrets. Useful fields include network, action name, contract address, transaction hash, and a short error category.

Never log private keys, seed phrases, access tokens, signed raw transactions, or full environment dumps. Keep production logs concise and structured so incidents can be investigated safely.
