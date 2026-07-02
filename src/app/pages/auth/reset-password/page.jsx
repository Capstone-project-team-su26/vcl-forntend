import { jsx } from "react/jsx-runtime";
import { Suspense } from "react";
import ResetPasswordPage from "@/app/pages/auth/reset-password/components/ResetPasswordPage";
function Page() {
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: "Loading..." }), children: /* @__PURE__ */ jsx(ResetPasswordPage, {}) });
}
export {
  Page as default
};
