# Chainling X verifier

Cloudflare Worker used by the verified Aqua Kingfisher free mint. It keeps X
OAuth tokens server-side (inside an encrypted, HTTP-only session cookie), checks
the three campaign tasks, binds one X account to one wallet in D1, and issues a
15-minute wallet-specific mint permit.

## Required Cloudflare resources

- Custom Worker domain: `auth.chainling.xyz`
- D1 database bound as `DB`
- Apply `migrations/0001_verified_claims.sql`

## Public configuration

Set the values in `wrangler.toml` after the campaign post and verified contract
are live:

- `X_CAMPAIGN_TWEET_ID`
- `MINT_CONTRACT_ADDRESS`
- D1 `database_id`

## Secrets

Configure these as Worker secrets, never as repository variables:

- `X_CLIENT_ID`
- `X_CLIENT_SECRET`
- `SESSION_SECRET` (at least 32 random characters)
- `MINT_SIGNER_PRIVATE_KEY` (a dedicated hot signer; never the owner/Ledger key)

The signer address derived from `MINT_SIGNER_PRIVATE_KEY` must be supplied to
the verified mint contract constructor. The X app callback URL must be exactly
`https://auth.chainling.xyz/auth/callback` and the website URL must be
`https://chainling.xyz`.
