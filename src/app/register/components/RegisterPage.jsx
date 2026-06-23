"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import * as authService from "@/utils/authService";
import { setPendingRegisterEmail } from "@/utils/authSession";
import { ApiError } from "@/utils/apiError";
import { getErrorMessage } from "@/utils/apiError";
function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const form = e.currentTarget;
    const fullName = form.fullName?.value?.trim();
    const email = form.email?.value?.trim();
    const password = form.password?.value;
    const confirmPassword = form.confirmPassword?.value;
    const phone = form.phone?.value?.trim();
    const country = form.country?.value?.trim();
    const address = form.address?.value?.trim();
    if (password !== confirmPassword) {
      setError("M\u1EADt kh\u1EA9u x\xE1c nh\u1EADn kh\xF4ng kh\u1EDBp.");
      return;
    }
    if (password.length < 8) {
      setError("M\u1EADt kh\u1EA9u ph\u1EA3i c\xF3 t\u1EEB 8 k\xFD t\u1EF1 tr\u1EDF l\xEAn.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await authService.registerCustomer({
        fullName,
        email,
        password,
        phone,
        country,
        address
      });
      setPendingRegisterEmail(email);
      setSuccess(response?.message || "OTP \u0111\xE3 \u0111\u01B0\u1EE3c g\u1EEDi \u0111\u1EBFn email c\u1EE7a b\u1EA1n.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Email \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError(getErrorMessage(err, "D\u1EEF li\u1EC7u kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c g\u1EEDi OTP qu\xE1 s\u1EDBm."));
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex lg:w-1/2 bg-surface-panel flex-col items-center justify-center p-12 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[274px] h-[202px] bg-secondary/20 rounded-full blur-[40px] pointer-events-none" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex flex-col items-center max-w-md text-center", children: [
        /* @__PURE__ */ jsx(AppLogo, { variant: "register", className: "mb-6" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted text-xl font-medium leading-relaxed mb-12", children: "Streamlining global logistics with secure access for every partner." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[480px]", children: [
      /* @__PURE__ */ jsx(AppLogo, { variant: "register-mobile", className: "lg:hidden mb-8" }),
      /* @__PURE__ */ jsx("h1", { className: "text-[30px] leading-tight font-bold text-ink tracking-[-0.75px] mb-3", children: "Create an account" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted text-base mb-10", children: "Enter your details below to get started with your logistics portal." }),
      error ? /* @__PURE__ */ jsx("div", { className: "mb-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
      success ? /* @__PURE__ */ jsx("div", { className: "mb-5 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text", children: success }) : null,
      /* @__PURE__ */ jsxs(
        "form",
        {
          className: "space-y-6",
          onSubmit: handleSubmit,
          onInput: () => {
            if (error) setError("");
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "fullName", children: "Full Name" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "fullName",
                    name: "fullName",
                    type: "text",
                    required: true,
                    maxLength: 255,
                    placeholder: "John Doe",
                    className: "w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Email Address" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "email",
                    name: "email",
                    type: "email",
                    required: true,
                    maxLength: 255,
                    placeholder: "john@example.com",
                    className: "w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "password",
                    name: "password",
                    type: "password",
                    required: true,
                    minLength: 8,
                    maxLength: 100,
                    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                    className: "w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", children: "Confirm Password" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "confirmPassword",
                    name: "confirmPassword",
                    type: "password",
                    required: true,
                    minLength: 8,
                    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                    className: "w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "phone", children: "Phone Number" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "phone",
                    name: "phone",
                    type: "tel",
                    required: true,
                    maxLength: 50,
                    placeholder: "0901234567",
                    className: "w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "country", children: "Country" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "country",
                    name: "country",
                    type: "text",
                    required: true,
                    maxLength: 100,
                    placeholder: "Vietnam",
                    className: "w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "address", children: "Address" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "address",
                  name: "address",
                  type: "text",
                  required: true,
                  placeholder: "Ho Chi Minh City",
                  className: "w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pt-4 space-y-4", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: isSubmitting,
                  className: "w-full h-12 bg-secondary text-white font-bold text-lg rounded-[10px] shadow-sm hover:bg-secondary-hover disabled:opacity-60 transition-colors cursor-pointer",
                  children: isSubmitting ? "Creating account..." : "Create account"
                }
              ),
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/login",
                  className: "block w-full h-10 text-secondary font-semibold text-sm hover:underline text-center",
                  children: "Already have an account? Sign in"
                }
              )
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "mt-12 pt-6 border-t border-border", children: /* @__PURE__ */ jsx("p", { className: "text-[12px] text-muted leading-relaxed text-center md:text-left", children: 'By clicking "Create account", you agree to our Terms of Service and Privacy Policy.' }) })
    ] }) })
  ] });
}
export {
  RegisterPage as default
};
