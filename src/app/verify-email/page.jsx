import { jsx } from "react/jsx-runtime";
import { Suspense } from "react";
import VerifyEmailPage from "@/app/verify-email/components/VerifyEmailPage";
function Page() {
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: "Loading..." }), children: /* @__PURE__ */ jsx(VerifyEmailPage, {}) });
}
export {
  Page as default
};
