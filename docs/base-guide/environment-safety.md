# Environment safety

Never commit wallet secrets, seed phrases, private keys, API tokens, or production RPC credentials. Keep a sanitized `.env.example` that documents variable names without real values.

Before pushing changes, review staged files for accidental secrets and prefer separate wallets and credentials for development. Rotate any credential immediately if it was exposed in Git history or logs.
