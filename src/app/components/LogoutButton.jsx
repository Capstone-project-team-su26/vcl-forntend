"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/useAuth";
function LogoutButton({ variant = "sidebar", className = "" }) {
  const { logout, isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  if (variant === "header") {
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: logout,
        className: `inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-semibold text-danger border border-danger/20 hover:bg-danger/5 transition-colors ${className}`,
        children: [
          /* @__PURE__ */ jsx(Icon, { icon: "lucide:log-out", className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Logout" })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: logout,
      className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/5 transition-colors ${className}`,
      children: [
        /* @__PURE__ */ jsx(Icon, { icon: "lucide:log-out", className: "w-5 h-5" }),
        "Logout"
      ]
    }
  );
}
export {
  LogoutButton as default
};
