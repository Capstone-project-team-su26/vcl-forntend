/**
 * Runnable check: signed auth cookie cannot be forged without secret.
 * Run: bun src/utils/signedAuthCookie.selfcheck.js
 */
import {
  signAuthPayload,
  verifyAuthCookie,
} from "./signedAuthCookie.js";

async function main() {
  process.env.AUTH_COOKIE_SECRET = "selfcheck-secret";
  process.env.NODE_ENV = "development";

  const exp = Math.floor(Date.now() / 1000) + 3600;
  const signed = await signAuthPayload({ role: "Admin", exp });
  if (!signed) throw new Error("sign failed");

  const ok = await verifyAuthCookie(signed);
  if (!ok || ok.role !== "Admin") throw new Error("verify failed");

  const forged = signed.replace(/\.[^.]+$/, ".AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  const bad = await verifyAuthCookie(forged);
  if (bad) throw new Error("forged cookie accepted");

  const legacy = await verifyAuthCookie("1");
  if (legacy) throw new Error("legacy flag accepted");

  const expired = await signAuthPayload({ role: "Sale", exp: Math.floor(Date.now() / 1000) - 10 });
  const expiredOk = await verifyAuthCookie(expired);
  if (expiredOk) throw new Error("expired cookie accepted");

  console.log("signedAuthCookie.selfcheck: ok");
}

main().catch((err) => {
  console.error("signedAuthCookie.selfcheck: FAIL", err);
  process.exit(1);
});
