"use client";
import styles from "./ResetPasswordPage.module.scss";
import { jsx, jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import * as authService from "@/utils/authService";
import { ROUTES } from "@/utils/appRoutes";
import { getErrorMessage } from "@/utils/apiError";
function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setToken(searchParams.get("token") || "");
  }, [searchParams]);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const newPassword = e.currentTarget.newPassword?.value;
    const confirmPassword = e.currentTarget.confirmPassword?.value;
    if (!token) {
      setError("Thi\u1EBFu token \u0111\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("M\u1EADt kh\u1EA9u x\xE1c nh\u1EADn kh\xF4ng kh\u1EDBp.");
      return;
    }
    if (newPassword.length < 8) {
      setError("M\u1EADt kh\u1EA9u ph\u1EA3i c\xF3 t\u1EEB 8 k\xFD t\u1EF1 tr\u1EDF l\xEAn.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword({ token, newPassword });
      setMessage(response?.message || "M\u1EADt kh\u1EA9u \u0111\xE3 \u0111\u01B0\u1EE3c \u0111\u1EB7t l\u1EA1i th\xE0nh c\xF4ng.");
      window.setTimeout(() => router.push(ROUTES.auth.login), 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Token kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n."));
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: styles.t1c1f29, children: /* @__PURE__ */ jsxs("div", { className: styles.te53253, children: [
    /* @__PURE__ */ jsx(AppLogo, { variant: "auth", className: styles.ta8b152 }),
    /* @__PURE__ */ jsx("h1", { className: styles.t3aa844, children: "\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u" }),
    /* @__PURE__ */ jsx("p", { className: styles.t3150ae, children: "Nh\u1EADp m\u1EADt kh\u1EA9u m\u1EDBi cho t\xE0i kho\u1EA3n c\u1EE7a b\u1EA1n." }),
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
            /* @__PURE__ */ jsx("label", { htmlFor: "newPassword", className: styles.tae03fc, children: "M\u1EADt kh\u1EA9u m\u1EDBi" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "newPassword",
                name: "newPassword",
                type: "password",
                required: true,
                minLength: 8,
                maxLength: 100,
                className: `${styles.t464be0} input-focus-ring`
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: styles.t6f7e01, children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", className: styles.tae03fc, children: "X\xE1c nh\u1EADn m\u1EADt kh\u1EA9u" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "confirmPassword",
                name: "confirmPassword",
                type: "password",
                required: true,
                minLength: 8,
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
              children: isSubmitting ? "\u0110ang c\u1EADp nh\u1EADt..." : "\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("p", { className: styles.t2f96bc, children: /* @__PURE__ */ jsx(Link, { href: ROUTES.auth.login, className: styles.t68e1e8, children: "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp" }) })
  ] }) });
}
export {
  ResetPasswordPage as default
};
