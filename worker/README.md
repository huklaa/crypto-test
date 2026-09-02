# Chainling X verifier

Worker used by the verified Aqua Kingfisher free mint. It encrypts short-lived X
OAuth state and sessions, checks the three campaign tasks, and issues a
15-minute wallet-specific mint permit. The contract itself enforces one claim
per X account hash and one claim per wallet.

## Public configuration

Set the values in `wrangler.toml` after the campaign post and verified contract
are live:

- `X_CAMPAIGN_TWEET_ID`
- `MINT_CONTRACT_ADDRESS`

## Secrets

Configure these as Worker secrets, never as repository variables:

- `X_CLIENT_ID`
- `X_CLIENT_SECRET`
- `SESSION_SECRET` (at least 32 random characters)
- `MINT_SIGNER_PRIVATE_KEY` (a dedicated hot signer; never the owner/Ledger key)

The signer address derived from `MINT_SIGNER_PRIVATE_KEY` must be supplied to
the verified mint contract constructor. Register the deployed service's
`/auth/callback` URL in the X developer app and use `https://chainling.xyz` as
the website URL.
