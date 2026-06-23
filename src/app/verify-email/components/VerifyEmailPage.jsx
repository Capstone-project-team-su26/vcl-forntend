"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import * as authService from "@/utils/authService";
import {
  clearPendingRegisterEmail,
  getPendingRegisterEmail
} from "@/utils/authSession";
import { ApiError } from "@/utils/apiError";
import { getErrorMessage } from "@/utils/apiError";
const RESEND_COOLDOWN_SECONDS = 60;
function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    const fromQuery = searchParams.get("email");
    const fromStorage = getPendingRegisterEmail();
    setEmail(fromQuery || fromStorage || "");
  }, [searchParams]);
  useEffect(() => {
    if (cooldown <= 0) return void 0;
    const timer = window.setInterval(() => {
      setCooldown((value) => value > 0 ? value - 1 : 0);
    }, 1e3);
    return () => window.clearInterval(timer);
  }, [cooldown]);
  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Thi\u1EBFu email. Vui l\xF2ng \u0111\u0103ng k\xFD l\u1EA1i.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setError("OTP ph\u1EA3i g\u1ED3m \u0111\xFAng 6 ch\u1EEF s\u1ED1.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authService.verifyCustomerOtp({ email, otp });
      clearPendingRegisterEmail();
      setMessage(response?.message || "\u0110\u0103ng k\xFD t\xE0i kho\u1EA3n th\xE0nh c\xF4ng.");
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err, "OTP kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n."));
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleResend() {
    if (!email || cooldown > 0) return;
    setError("");
    setMessage("");
    setIsResending(true);
    try {
      const response = await authService.resendCustomerOtp(email);
      setMessage(response?.message || "OTP m\u1EDBi \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EEDi.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(getErrorMessage(err, "Ch\u1EC9 \u0111\u01B0\u1EE3c g\u1EEDi l\u1EA1i OTP sau 60 gi\xE2y."));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsResending(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-surface-soft px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md bg-white rounded-2xl border border-border-muted shadow-sm p-8", children: [
    /* @__PURE__ */ jsx(AppLogo, { variant: "auth", className: "mb-8" }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-ink mb-2", children: "X\xE1c th\u1EF1c email" }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted mb-6", children: [
      "Nh\u1EADp m\xE3 OTP 6 s\u1ED1 \u0111\xE3 g\u1EEDi t\u1EDBi",
      " ",
      /* @__PURE__ */ jsx("span", { className: "font-semibold text-ink", children: email || "email c\u1EE7a b\u1EA1n" }),
      ". OTP c\xF3 hi\u1EC7u l\u1EF1c 5 ph\xFAt."
    ] }),
    error ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
    message ? /* @__PURE__ */ jsx("div", { className: "mb-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: message }) : null,
    /* @__PURE__ */ jsxs("form", { className: "space-y-5", onSubmit: handleVerify, children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "otp", className: "text-sm font-semibold text-ink", children: "M\xE3 OTP" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "otp",
            name: "otp",
            inputMode: "numeric",
            maxLength: 6,
            autoComplete: "one-time-code",
            value: otp,
            onChange: (event) => {
              setOtp(event.target.value.replace(/\D/g, ""));
              if (error) setError("");
            },
            placeholder: "123456",
            className: "w-full h-12 px-4 bg-white border border-border-muted rounded-lg text-center text-lg tracking-[0.4em] text-ink input-focus-ring"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: isSubmitting,
          className: "w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-lg transition-colors",
          children: isSubmitting ? "\u0110ang x\xE1c th\u1EF1c..." : "X\xE1c th\u1EF1c t\xE0i kho\u1EA3n"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col gap-3 text-sm", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: handleResend,
          disabled: isResending || cooldown > 0,
          className: "inline-flex items-center justify-center gap-2 font-semibold text-secondary hover:text-insight disabled:opacity-50",
          children: [
            /* @__PURE__ */ jsx(Icon, { icon: "lucide:refresh-cw", className: "w-4 h-4" }),
            cooldown > 0 ? `G\u1EEDi l\u1EA1i OTP (${cooldown}s)` : isResending ? "\u0110ang g\u1EEDi..." : "G\u1EEDi l\u1EA1i OTP"
          ]
        }
      ),
      /* @__PURE__ */ jsx(Link, { href: "/login", className: "text-center text-muted hover:text-ink", children: "Quay l\u1EA1i \u0111\u0103ng nh\u1EADp" })
    ] })
  ] }) });
}
export {
  VerifyEmailPage as default
};
