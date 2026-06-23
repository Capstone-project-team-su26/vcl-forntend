"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import * as authService from "@/utils/authService";
import { ApiError } from "@/utils/apiError";
import { getErrorMessage } from "@/utils/apiError";
function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const email = e.currentTarget.email?.value?.trim();
    if (!email) {
      setError("Vui l\xF2ng nh\u1EADp email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword({ email });
      setMessage(
        response?.message || "Email \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EEDi. Vui l\xF2ng ki\u1EC3m tra h\u1ED9p th\u01B0 c\u1EE7a b\u1EA1n."
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("Email kh\xF4ng t\u1ED3n t\u1EA1i.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-surface-soft px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md bg-white rounded-2xl border border-border-muted shadow-sm p-8", children: [
    /* @__PURE__ */ jsx(AppLogo, { variant: "auth", className: "mb-8" }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-ink mb-2", children: "Qu\xEAn m\u1EADt kh\u1EA9u" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted mb-6", children: "Nh\u1EADp email \u0111\xE3 \u0111\u0103ng k\xFD. Ch\xFAng t\xF4i s\u1EBD g\u1EEDi link \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u." }),
    error ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
    message ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: message }) : null,
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: "space-y-5",
        onSubmit: handleSubmit,
        onInput: () => {
          if (error) setError("");
        },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-sm font-semibold text-ink", children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                required: true,
                placeholder: "customer@example.com",
                className: "w-full h-12 px-4 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isSubmitting,
              className: "w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-lg transition-colors",
              children: isSubmitting ? "\u0110ang g\u1EEDi..." : "G\u1EEDi email \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("p", { className: "mt-6 text-center text-sm text-muted", children: /* @__PURE__ */ jsx(Link, { href: "/login", className: "font-semibold text-secondary hover:text-insight", children: "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp" }) })
  ] }) });
}
export {
  ForgotPasswordPage as default
};
