import {
  encodeAbiParameters,
  getAddress,
  isAddress,
  keccak256,
  recoverMessageAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { pkceChallenge, randomToken, seal, unseal } from "./crypto.js";

const X_API = "https://api.x.com/2";
const AUTH_COOKIE = "chainling_x_auth";
const FLOW_COOKIE = "chainling_x_flow";
const COOKIE_OPTIONS = "Path=/; HttpOnly; Secure; SameSite=Lax";
const AUTH_TTL_SECONDS = 60 * 60;
const FLOW_TTL_SECONDS = 10 * 60;
const PERMIT_TTL_SECONDS = 15 * 60;

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function cookieValue(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
  return null;
}

function setCookie(name, value, maxAge) {
  return `${name}=${value}; ${COOKIE_OPTIONS}; Max-Age=${maxAge}`;
}

function clearCookie(name) {
  return `${name}=; ${COOKIE_OPTIONS}; Max-Age=0`;
}

function corsHeaders(request, env) {
  const origin = request.headers.get("origin");
  if (origin !== env.SITE_ORIGIN) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    vary: "Origin",
  };
}

function assertSiteOrigin(request, env) {
  if (request.headers.get("origin") !== env.SITE_ORIGIN) throw new Response("Forbidden", { status: 403 });
}

function assertConfiguration(env) {
  const required = ["X_CLIENT_ID", "X_CLIENT_SECRET", "SESSION_SECRET"];
  for (const key of required) if (!env[key]) throw new Error(`${key} is not configured.`);
}

function verificationMessage(wallet, nonce) {
  return [
    "Chainling free mint verification",
    `Wallet: ${getAddress(wallet)}`,
    `Nonce: ${nonce}`,
    "This signature does not authorize a blockchain transaction.",
  ].join("\n");
}

async function readSession(request, env, cookieName) {
  const token = cookieValue(request, cookieName);
  if (!token) return null;
  try {
    const session = await unseal(token, env.SESSION_SECRET);
    if (!session?.expiresAt || session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

async function xRequest(path, accessToken) {
  const response = await fetch(`${X_API}${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.detail || payload?.title || `X API request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function paginatedContains(path, accessToken, predicate, maxPages = 10) {
  let nextToken = null;
  for (let page = 0; page < maxPages; page += 1) {
    const separator = path.includes("?") ? "&" : "?";
    const pagePath = nextToken ? `${path}${separator}pagination_token=${encodeURIComponent(nextToken)}` : path;
    const payload = await xRequest(pagePath, accessToken);
    if ((payload.data || []).some(predicate)) return true;
    nextToken = payload.meta?.next_token;
    if (!nextToken) return false;
  }
  return false;
}

async function verifyTasks(session, env) {
  const target = await xRequest(`/users/by/username/${encodeURIComponent(env.X_TARGET_USERNAME)}`, session.accessToken);
  const targetId = target.data?.id;
  if (!targetId) throw new Error("The Chainling X account could not be resolved.");
  if (!/^\d{1,19}$/.test(env.X_CAMPAIGN_TWEET_ID || "")) throw new Error("X_CAMPAIGN_TWEET_ID is not configured.");

  const followed = await paginatedContains(
    `/users/${session.xUserId}/following?max_results=1000`,
    session.accessToken,
    user => user.id === targetId,
  );
  const liked = await paginatedContains(
    `/users/${session.xUserId}/liked_tweets?max_results=100`,
    session.accessToken,
    post => post.id === env.X_CAMPAIGN_TWEET_ID,
  );
  const reposted = await paginatedContains(
    `/users/${session.xUserId}/tweets?max_results=100&exclude=replies&tweet.fields=referenced_tweets`,
    session.accessToken,
    post => (post.referenced_tweets || []).some(reference => reference.type === "retweeted" && reference.id === env.X_CAMPAIGN_TWEET_ID),
  );
  return { followed, liked, reposted };
}

async function bindVerifiedIdentity(session, env) {
  const wallet = getAddress(session.wallet).toLowerCase();
  await env.DB.prepare(
    "INSERT OR IGNORE INTO verified_claims (x_user_id, x_username, wallet, verified_at) VALUES (?, ?, ?, ?)",
  ).bind(session.xUserId, session.xUsername, wallet, Date.now()).run();

  const byX = await env.DB.prepare("SELECT wallet FROM verified_claims WHERE x_user_id = ?")
    .bind(session.xUserId).first();
  if (byX?.wallet !== wallet) throw new Response("This X account is already linked to another wallet.", { status: 409 });
  const byWallet = await env.DB.prepare("SELECT x_user_id FROM verified_claims WHERE wallet = ?")
    .bind(wallet).first();
  if (byWallet?.x_user_id !== session.xUserId) throw new Response("This wallet is already linked to another X account.", { status: 409 });
}

async function issuePermit(session, env) {
  if (!isAddress(env.MINT_CONTRACT_ADDRESS || "")) throw new Error("MINT_CONTRACT_ADDRESS is not configured.");
  if (!/^0x[0-9a-fA-F]{64}$/.test(env.MINT_SIGNER_PRIVATE_KEY || "")) throw new Error("MINT_SIGNER_PRIVATE_KEY is not configured.");
  const wallet = getAddress(session.wallet);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + PERMIT_TTL_SECONDS);
  const permitHash = keccak256(encodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }, { type: "address" }, { type: "uint256" }],
    [getAddress(env.MINT_CONTRACT_ADDRESS), BigInt(env.CHAIN_ID), wallet, deadline],
  ));
  const signer = privateKeyToAccount(env.MINT_SIGNER_PRIVATE_KEY);
  const signature = await signer.signMessage({ message: { raw: permitHash } });
  return { contract: getAddress(env.MINT_CONTRACT_ADDRESS), deadline: deadline.toString(), signature };
}

async function startAuth(request, env) {
  assertSiteOrigin(request, env);
  assertConfiguration(env);
  const body = await request.json();
  if (!isAddress(body.wallet || "") || !/^[A-Za-z0-9_-]{24,128}$/.test(body.nonce || "") || !/^0x[0-9a-fA-F]{130}$/.test(body.signature || "")) {
    return json({ error: "Invalid wallet verification request." }, 400, corsHeaders(request, env));
  }
  const wallet = getAddress(body.wallet);
  const message = verificationMessage(wallet, body.nonce);
  const recovered = await recoverMessageAddress({ message, signature: body.signature });
  if (getAddress(recovered) !== wallet) return json({ error: "Wallet signature does not match." }, 401, corsHeaders(request, env));

  const state = randomToken();
  const verifier = randomToken(48);
  const challenge = await pkceChallenge(verifier);
  const flow = await seal({ state, verifier, wallet, expiresAt: Date.now() + FLOW_TTL_SECONDS * 1000 }, env.SESSION_SECRET);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.X_CLIENT_ID,
    redirect_uri: env.X_CALLBACK_URL,
    scope: "tweet.read users.read follows.read like.read",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return json(
    { authorizationUrl: `https://x.com/i/oauth2/authorize?${params}` },
    200,
    { ...corsHeaders(request, env), "set-cookie": setCookie(FLOW_COOKIE, flow, FLOW_TTL_SECONDS) },
  );
}

async function authCallback(request, env) {
  assertConfiguration(env);
  const url = new URL(request.url);
  const flow = await readSession(request, env, FLOW_COOKIE);
  if (!flow || url.searchParams.get("state") !== flow.state || !url.searchParams.get("code")) {
    return Response.redirect(`${env.SITE_ORIGIN}/?x=failed#free-mint`, 302);
  }

  const credentials = btoa(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`);
  const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${credentials}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: url.searchParams.get("code"),
      grant_type: "authorization_code",
      redirect_uri: env.X_CALLBACK_URL,
      code_verifier: flow.verifier,
    }),
  });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !token.access_token) return Response.redirect(`${env.SITE_ORIGIN}/?x=failed#free-mint`, 302);
  const me = await xRequest("/users/me", token.access_token);
  const session = await seal({
    wallet: flow.wallet,
    xUserId: me.data.id,
    xUsername: me.data.username,
    accessToken: token.access_token,
    expiresAt: Date.now() + Math.min(Number(token.expires_in || AUTH_TTL_SECONDS), AUTH_TTL_SECONDS) * 1000,
  }, env.SESSION_SECRET);
  const headers = new Headers({ location: `${env.SITE_ORIGIN}/?x=connected#free-mint` });
  headers.append("set-cookie", setCookie(AUTH_COOKIE, session, AUTH_TTL_SECONDS));
  headers.append("set-cookie", clearCookie(FLOW_COOKIE));
  return new Response(null, { status: 302, headers });
}

async function status(request, env) {
  const session = await readSession(request, env, AUTH_COOKIE);
  return json(session ? {
    connected: true,
    username: session.xUsername,
    wallet: session.wallet,
  } : { connected: false }, 200, corsHeaders(request, env));
}

async function verify(request, env) {
  assertSiteOrigin(request, env);
  const session = await readSession(request, env, AUTH_COOKIE);
  if (!session) return json({ error: "Connect your X account again." }, 401, corsHeaders(request, env));
  const tasks = await verifyTasks(session, env);
  if (!Object.values(tasks).every(Boolean)) return json({ verified: false, tasks }, 200, corsHeaders(request, env));
  await bindVerifiedIdentity(session, env);
  const permit = await issuePermit(session, env);
  return json({ verified: true, tasks, permit }, 200, corsHeaders(request, env));
}

async function route(request, env) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  if (request.method === "GET" && url.pathname === "/health") return json({ ok: true });
  if (request.method === "POST" && url.pathname === "/api/auth/start") return startAuth(request, env);
  if (request.method === "GET" && url.pathname === "/auth/callback") return authCallback(request, env);
  if (request.method === "GET" && url.pathname === "/api/status") return status(request, env);
  if (request.method === "POST" && url.pathname === "/api/verify") return verify(request, env);
  return json({ error: "Not found." }, 404, corsHeaders(request, env));
}

export default {
  async fetch(request, env) {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error(error);
      return json({ error: error?.message || "Verification service error." }, 500, corsHeaders(request, env));
    }
  },
};

export { verificationMessage };
