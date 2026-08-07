"use strict";

function getStoredAuthTokens(storage) {
  const tokens = [];
  const alpaToken = storage.getItem("alpa_token");
  const sellerToken = storage.getItem("sellerToken");

  if (alpaToken) tokens.push({ source: "alpa_token", token: alpaToken });
  if (sellerToken && sellerToken !== alpaToken) tokens.push({ source: "sellerToken", token: sellerToken });

  return tokens;
}

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isJwtExpired(token, nowSeconds = Date.now() / 1000) {
  const payload = decodeJwtPayload(token);
  const exp = typeof payload?.exp === "number" ? payload.exp : null;
  return exp !== null && exp <= nowSeconds;
}

module.exports = { getStoredAuthTokens, decodeJwtPayload, isJwtExpired };
