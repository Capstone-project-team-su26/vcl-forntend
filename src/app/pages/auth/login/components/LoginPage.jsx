"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppLogo from "@/app/components/AppLogo";
import colors from "@/utils/colors";
import { SITE_NAME } from "@/utils/site";
import { isMockMode } from "@/utils/mocks/dataSource";
import { useAuth } from "@/hooks/useAuth";
import { resolvePostLoginPath } from "@/utils/routeAccess";
import { clearSession } from "@/utils/authSession";
import { ROUTES } from "@/utils/appRoutes";
import {
  MOCK_TEST_ACCOUNTS,
  API_TEST_ACCOUNTS,
} from "@/utils/mocks/mockAccounts";
import { ApiError } from "@/utils/apiError";
import { getErrorMessage } from "@/utils/apiError";
import { toast } from "@/app/components/ToastProvider";
const features = [
  { icon: "lucide:users", title: "Quản trị người dùng", desc: "Admin — users, hàng cấm, bảng giá" },
  { icon: "lucide:package", title: "Ký gửi", desc: "Sale — duyệt yêu cầu ký gửi" },
  { icon: "lucide:bar-chart-3", title: "Vận hành", desc: "Dashboard KPI cho Operations" },
  { icon: "lucide:shield-check", title: "Phân quyền", desc: "Truy cập theo role nhân viên" }
];
const avatarColors = [colors.primary, colors.secondary, colors.accent, colors.primaryHover];

function testAccountButtonClass(selected) {
  return `inline-flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-colors ${
    selected
      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
      : "border-surface-muted bg-white hover:bg-surface"
  }`;
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedTestEmail, setSelectedTestEmail] = useState("");
  const formRef = useRef(null);
  // Tránh clearSession khi vừa login thành công mà URL còn ?next= (race với middleware).
  const justLoggedInRef = useRef(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next");
  const { loginWithCredentials, isLoggedIn, isReady, session } = useAuth();
  const mockMode = isMockMode();
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isReady || !isLoggedIn || !session?.role) return;
    // Middleware đẩy về login?next= với localStorage cũ (cookie HttpOnly thiếu) → xóa để cắt loop.
    // Không clear khi vừa login — cookie mới vừa set, clear sẽ logout ngay.
    if (redirectTo && !justLoggedInRef.current) {
      clearSession();
      return;
    }
    const target = resolvePostLoginPath(session.role, redirectTo);
    window.location.replace(target);
  }, [isReady, isLoggedIn, session?.role, redirectTo]);

  function fillForm(email, password) {
    const form = formRef.current;
    if (!form) return;
    const emailInput = form.elements.namedItem("email");
    const passwordInput = form.elements.namedItem("password");
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
    setSelectedTestEmail(email);
  }

  async function loginAs(email, password) {
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    fillForm(email, password);
    setIsSubmitting(true);
    justLoggedInRef.current = true;
    try {
      await loginWithCredentials({ email, password, redirectTo });
    } catch (err) {
      justLoggedInRef.current = false;
      let message = getErrorMessage(err, "Đăng nhập thất bại. Vui lòng thử lại.");
      if (err instanceof ApiError && err.status === 401) {
        message = "Email hoặc mật khẩu không đúng.";
      } else if (err instanceof ApiError && err.status === 403) {
        message = "Bạn không có quyền truy cập.";
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleMockAccount(account) {
    void loginAs(account.email, "mock123");
  }

  function handleApiAccount(account) {
    void loginAs(account.email, account.password);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email?.value?.trim();
    const password = form.password?.value;
    await loginAs(email, password);
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans", children: [
    /* @__PURE__ */ jsxs("aside", { className: "relative hidden lg:flex lg:w-[58%] bg-surface-soft flex-col justify-between p-10 xl:p-14 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
        /* @__PURE__ */ jsx(AppLogo, { variant: "auth", className: "mb-10" }),
        /* @__PURE__ */ jsx("span", { className: "inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.12em] uppercase text-muted bg-white border border-border-muted rounded-full", children: SITE_NAME }),
        /* @__PURE__ */ jsxs("h1", { className: "text-[42px] xl:text-[48px] font-bold leading-[1.15] text-ink tracking-tight max-w-[520px] mb-5", children: [
          "Quản lý logistics",
          " ",
          /* @__PURE__ */ jsx("em", { className: "text-primary italic font-normal", children: "nội bộ" }),
          " ",
          "cho đội ngũ."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[16px] leading-relaxed text-muted max-w-[480px] mb-10", children: "Đăng nhập bằng tài khoản nhân viên để truy cập khu vực Admin, Sales và Operations. Khách hàng sử dụng ứng dụng riêng." }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-4 max-w-[480px]", children: features.map((feature) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-white rounded-xl border border-surface-muted p-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center mb-3", children: /* @__PURE__ */ jsx(Icon, { icon: feature.icon, className: "w-[18px] h-[18px] text-secondary" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-ink mb-0.5", children: feature.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted", children: feature.desc })
            ]
          },
          feature.title
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 flex items-center gap-3 mt-10", children: [
        /* @__PURE__ */ jsx("div", { className: "flex -space-x-2", children: avatarColors.map((color, i) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white",
            style: { backgroundColor: color },
            children: String.fromCharCode(65 + i)
          },
          i
        )) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted", children: `Dành cho nhân viên ${SITE_NAME} — Admin, Sale, Operations` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-0 right-0 w-[42%] h-full pointer-events-none", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-surface-soft via-surface-soft/80 to-transparent z-10" }),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop&q=80",
            alt: "Logistics professional",
            className: "w-full h-full object-cover object-center"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto lg:mr-auto xl:mr-16", children: [
      /* @__PURE__ */ jsx(AppLogo, { variant: "auth", className: "lg:hidden mb-8" }),
      /* @__PURE__ */ jsxs("header", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-[28px] font-bold text-ink tracking-tight mb-2", children: "Đăng nhập" }),
        /* @__PURE__ */ jsx("p", { className: "text-[15px] text-muted", children: "Nhập email nhân viên để vào hệ thống nội bộ." })
      ] }),
      error ? /* @__PURE__ */ jsx("div", { className: "mb-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger", children: error }) : null,
      isDev && mockMode ? /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-lg border border-warning-bg bg-warning-bg/40 px-4 py-3 text-sm text-ink space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Chế độ Mock — bấm acc để đăng nhập ngay" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: MOCK_TEST_ACCOUNTS.map((account) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled: isSubmitting,
            onClick: () => handleMockAccount(account),
            className: testAccountButtonClass(selectedTestEmail === account.email),
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-primary", children: account.label }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted", children: account.email })
            ]
          },
          account.email
        )) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted", children: [
          "Test ký gửi: chọn ",
          /* @__PURE__ */ jsx("strong", { children: "Sale" }),
          " → sidebar ",
          /* @__PURE__ */ jsx("strong", { children: "Quản lý ký gửi" })
        ] })
      ] }) : isDev && !mockMode ? /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-lg border border-info-bg bg-info-bg/30 px-4 py-3 text-sm text-ink space-y-3", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Chế độ API — bấm acc để đăng nhập ngay" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: API_TEST_ACCOUNTS.map((account) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled: isSubmitting,
            onClick: () => handleApiAccount(account),
            className: testAccountButtonClass(selectedTestEmail === account.email),
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-primary", children: account.label }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted", children: account.email })
            ]
          },
          account.email
        )) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted", children: "Bấm acc → điền email/mật khẩu seed và đăng nhập ngay (chỉ hiện khi dev)." })
      ] }) : null,
      /* @__PURE__ */ jsxs(
        "form",
        {
          ref: formRef,
          className: "space-y-5",
          onSubmit: handleSubmit,
          onInput: () => {
            if (error) setError("");
          },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "text-sm font-semibold text-ink", children: "Email Address" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  Icon,
                  {
                    icon: "lucide:mail",
                    className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-faint"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "email",
                    name: "email",
                    type: "email",
                    autoComplete: "email",
                    required: true,
                    placeholder: "email@congty.com",
                    className: "w-full h-12 pl-11 pr-4 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "password", className: "text-sm font-semibold text-ink", children: "Password" }),
                /* @__PURE__ */ jsx(Link, { href: ROUTES.auth.forgotPassword, className: "text-xs font-semibold text-primary hover:text-secondary", children: "Forgot Password?" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(
                  Icon,
                  {
                    icon: "lucide:lock",
                    className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-faint"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    id: "password",
                    name: "password",
                    type: showPassword ? "text" : "password",
                    autoComplete: "current-password",
                    required: true,
                    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                    className: "w-full h-12 pl-11 pr-11 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowPassword((v) => !v),
                    className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-muted",
                    "aria-label": showPassword ? "Hide password" : "Show password",
                    children: /* @__PURE__ */ jsx(Icon, { icon: showPassword ? "lucide:eye-off" : "lucide:eye", className: "w-[18px] h-[18px]" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2.5 cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "w-4 h-4 rounded border-border-muted accent-primary"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted", children: "Remember me for 30 days" })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "submit",
                disabled: isSubmitting,
                className: "w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors",
                children: [
                  isSubmitting ? "Đang đăng nhập..." : "Đăng nhập",
                  !isSubmitting ? /* @__PURE__ */ jsx(Icon, { icon: "lucide:arrow-right", className: "w-4 h-4" }) : null
                ]
              }
            )
          ]
        }
      )
    ] }) })
  ] });
}
export {
  LoginPage as default
};
