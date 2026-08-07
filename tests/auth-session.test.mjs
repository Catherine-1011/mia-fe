import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

globalThis.atob = (value) => Buffer.from(value, "base64").toString("binary");
const require = createRequire(import.meta.url);
const authSession = require("../lib/authSession.js");

function token(payload) {
  const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(payload)}.sig`;
}

function storage(values) {
  return { getItem: (key) => values[key] ?? null };
}

test("AuthContext initialization prefers alpa_token when it is the only valid current session", () => {
  const alpa = token({ userId: "customer_1", role: "CUSTOMER", exp: 200 });
  const tokens = authSession.getStoredAuthTokens(storage({ alpa_token: alpa }));
  assert.deepEqual(tokens.map((t) => t.source), ["alpa_token"]);
  assert.equal(authSession.isJwtExpired(alpa, 100), false);
});

test("legacy seller token exposes sellerId and role without trusting localStorage user", () => {
  const seller = token({ sellerId: "seller_1", role: "SELLER", exp: 200 });
  const payload = authSession.decodeJwtPayload(seller);
  assert.equal(payload.sellerId, "seller_1");
  assert.equal(payload.role, "SELLER");
  assert.equal(authSession.isJwtExpired(seller, 100), false);
});

test("stale alpa_token plus valid sellerToken keeps sellerToken as fallback candidate", () => {
  const stale = token({ userId: "old_user", role: "SELLER", exp: 50 });
  const seller = token({ sellerId: "seller_1", role: "SELLER", exp: 200 });
  const candidates = authSession
    .getStoredAuthTokens(storage({ alpa_token: stale, sellerToken: seller }))
    .filter(({ token }) => !authSession.isJwtExpired(token, 100));
  assert.deepEqual(candidates.map((t) => t.source), ["sellerToken"]);
});

test("expired token is rejected for customer, seller, and checkout auth state", () => {
  const expired = token({ userId: "user_1", role: "CUSTOMER", exp: 10 });
  assert.equal(authSession.isJwtExpired(expired, 100), true);
});

test("guest checkout remains unauthenticated when no token keys exist", () => {
  assert.deepEqual(authSession.getStoredAuthTokens(storage({})), []);
});

test("logout compatibility keys remain present in AuthContext", () => {
  const authContext = fs.readFileSync(new URL("../context/AuthContext.tsx", import.meta.url), "utf8");
  assert.match(authContext, /localStorage\.removeItem\("user"\)/);
  assert.match(authContext, /localStorage\.removeItem\("alpa_token"\)/);
  assert.match(authContext, /localStorage\.removeItem\("sellerToken"\)/);
});
