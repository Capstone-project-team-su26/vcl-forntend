"use client";

import { useLayoutEffect } from "react";
import { getSession, syncAuthCookies } from "@/utils/authSession";

function ensureAuthCookies() {
  syncAuthCookies(getSession());
}

if (typeof window !== "undefined") {
  ensureAuthCookies();
}

/** Đồng bộ cookie auth sớm — middleware chỉ đọc cookie, không đọc localStorage. */
export default function AuthSessionSync() {
  useLayoutEffect(() => {
    ensureAuthCookies();
  }, []);

  return null;
}
