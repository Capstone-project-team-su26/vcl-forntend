"use client";
import { jsx } from "react/jsx-runtime";
import { Suspense } from "react";
import LoginPage from "@/app/login/components/LoginPage";
function Page() {
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center text-muted", children: "\u0110ang t\u1EA3i..." }), children: /* @__PURE__ */ jsx(LoginPage, {}) });
}
export {
  Page as default
};
