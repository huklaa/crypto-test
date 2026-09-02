import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { privateKeyToAccount } from "viem/accounts";

import { pkceChallenge, seal, unseal } from "../worker/src/crypto.js";
import { verificationMessage } from "../worker/src/index.js";

describe("Chainling verification worker helpers", function () {
  it("builds a deterministic, non-transaction wallet verification message", function () {
    const account = privateKeyToAccount("0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    const message = verificationMessage(account.address, "abcdefghijklmnopqrstuvwx");
    assert.match(message, /Chainling free mint verification/);
    assert.match(message, new RegExp(account.address, "i"));
    assert.match(message, /does not authorize a blockchain transaction/);
  });

  it("creates the RFC 7636 SHA-256 PKCE challenge", async function () {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    assert.equal(await pkceChallenge(verifier), "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("encrypts and authenticates OAuth session state", async function () {
    const secret = "a-secure-test-secret-that-is-longer-than-thirty-two-characters";
    const token = await seal({ wallet: "0x1234", expiresAt: 123 }, secret);
    assert.deepEqual(await unseal(token, secret), { wallet: "0x1234", expiresAt: 123 });
    await assert.rejects(() => unseal(`${token.slice(0, -1)}A`, secret));
  });
});
