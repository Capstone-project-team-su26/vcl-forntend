import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE,
  LEGACY_AUTH_COOKIE,
  LEGACY_ROLE_COOKIE,
  clearAuthCookieOptions,
} from "@/utils/signedAuthCookie";

/** Xóa cookie phiên HttpOnly + cookie legacy forgeable. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cleared = clearAuthCookieOptions();
  response.cookies.set(AUTH_SESSION_COOKIE, "", cleared);
  response.cookies.set(LEGACY_AUTH_COOKIE, "", cleared);
  response.cookies.set(LEGACY_ROLE_COOKIE, "", cleared);
  return response;
}
