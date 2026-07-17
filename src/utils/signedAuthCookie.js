/** Signed HttpOnly session cookie — Edge + Node (Web Crypto). */

export const AUTH_SESSION_COOKIE = "vcl_session";
/** Legacy forgeable cookies — clear on login/logout. */
export const LEGACY_AUTH_COOKIE = "vcl_auth";
export const LEGACY_ROLE_COOKIE = "vcl_role";

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.AUTH_COOKIE_SECRET?.trim();
  if (secret) return secret;
  // Fail closed in production — middleware rejects missing secret.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return null;
  }
  // ponytail: local-only fallback; set AUTH_COOKIE_SECRET in .env.local for shared devices.
  return "dev-only-vcl-auth-cookie-secret";
}

function bytesToBase64Url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (str.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function textToBytes(text) {
  return new TextEncoder().encode(text);
}

async function hmacSign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    textToBytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, textToBytes(message));
  return bytesToBase64Url(new Uint8Array(sig));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * @param {{ role: string, exp: number }} payload — exp = unix seconds
 * @returns {Promise<string | null>}
 */
export async function signAuthPayload(payload) {
  const secret = getSecret();
  if (!secret || !payload?.role || !payload?.exp) return null;

  const body = bytesToBase64Url(textToBytes(JSON.stringify({ role: payload.role, exp: payload.exp })));
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

/**
 * @param {string | undefined | null} value
 * @returns {Promise<{ role: string, exp: number } | null>}
 */
export async function verifyAuthCookie(value) {
  if (!value || typeof value !== "string") return null;

  const secret = getSecret();
  if (!secret) return null;

  const dot = value.indexOf(".");
  if (dot <= 0) return null;

  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (!body || !sig) return null;

  const expected = await hmacSign(secret, body);
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(body));
    const payload = JSON.parse(json);
    if (!payload?.role || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 <= Date.now()) return null;
    return { role: String(payload.role), exp: payload.exp };
  } catch {
    return null;
  }
}

export function authCookieOptions(maxAge = COOKIE_MAX_AGE_SEC) {
  const secure =
    process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function clearAuthCookieOptions() {
  return { ...authCookieOptions(0), maxAge: 0 };
}

/** @param {string | Date | number | null | undefined} expiresAt */
export function expiresAtToUnix(expiresAt) {
  if (expiresAt == null) return Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SEC;
  const ms = typeof expiresAt === "number" ? expiresAt : new Date(expiresAt).getTime();
  if (!Number.isFinite(ms)) return Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SEC;
  return Math.floor(ms / 1000);
}
