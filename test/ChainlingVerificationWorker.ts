import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { pkceChallenge, seal, unseal } from "../worker/src/crypto.js";

describe("Chainling verification worker helpers", function () {
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
