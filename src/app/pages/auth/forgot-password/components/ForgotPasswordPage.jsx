"use client";
import styles from "./ForgotPasswordPage.module.scss";
import { jsx, jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import * as authService from "@/utils/authService";
import { ROUTES } from "@/utils/appRoutes";
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
  return /* @__PURE__ */ jsx("div", { className: styles.t1c1f29, children: /* @__PURE__ */ jsxs("div", { className: styles.te53253, children: [
    /* @__PURE__ */ jsx(AppLogo, { variant: "auth", className: styles.ta8b152 }),
    /* @__PURE__ */ jsx("h1", { className: styles.t3aa844, children: "Qu\xEAn m\u1EADt kh\u1EA9u" }),
    /* @__PURE__ */ jsx("p", { className: styles.t3150ae, children: "Nh\u1EADp email \u0111\xE3 \u0111\u0103ng k\xFD. Ch\xFAng t\xF4i s\u1EBD g\u1EEDi link \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u." }),
    error ? /* @__PURE__ */ jsx("div", { className: styles.t6881d9, children: error }) : null,
    message ? /* @__PURE__ */ jsx("div", { className: styles.tcfabb6, children: message }) : null,
    /* @__PURE__ */ jsxs(
      "form",
      {
        className: styles.tb43b4c,
        onSubmit: handleSubmit,
        onInput: () => {
          if (error) setError("");
        },
        children: [
          /* @__PURE__ */ jsxs("div", { className: styles.t6f7e01, children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", className: styles.tae03fc, children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                required: true,
                placeholder: "customer@example.com",
                className: `${styles.t464be0} input-focus-ring`
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isSubmitting,
              className: styles.t95b04a,
              children: isSubmitting ? "\u0110ang g\u1EEDi..." : "G\u1EEDi email \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("p", { className: styles.t2f96bc, children: /* @__PURE__ */ jsx(Link, { href: ROUTES.auth.login, className: styles.t68e1e8, children: "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp" }) })
  ] }) });
}
export {
  ForgotPasswordPage as default
};
