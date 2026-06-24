"use client";
import { jsx } from "react/jsx-runtime";
import { Suspense } from "react";
import StaffPage from "@/app/pages/sales/components/StaffPage";
function Page() {
  return /* @__PURE__ */ jsx(
    Suspense,
    {
      fallback: /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-surface text-muted", children: "\u0110ang t\u1EA3i..." }),
      children: /* @__PURE__ */ jsx(StaffPage, {})
    }
  );
}
export {
  Page as default
};
