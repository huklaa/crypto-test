CREATE TABLE IF NOT EXISTS verified_claims (
  x_user_id TEXT PRIMARY KEY,
  x_username TEXT NOT NULL,
  wallet TEXT NOT NULL UNIQUE,
  verified_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS verified_claims_wallet_idx
  ON verified_claims(wallet);
