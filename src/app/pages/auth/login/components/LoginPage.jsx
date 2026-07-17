"use client";

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
import { ApiError, getErrorMessage } from "@/utils/apiError";
import styles from "./LoginPage.module.scss";

const features = [
  { icon: "lucide:users", title: "Quản trị người dùng", desc: "Admin — users, hàng cấm, bảng giá" },
  { icon: "lucide:package", title: "Ký gửi", desc: "Sale — duyệt yêu cầu ký gửi" },
  { icon: "lucide:bar-chart-3", title: "Vận hành", desc: "Dashboard KPI cho Operations" },
  { icon: "lucide:shield-check", title: "Phân quyền", desc: "Truy cập theo role nhân viên" },
];

const avatarColors = [colors.primary, colors.secondary, colors.accent, colors.primaryHover];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedTestEmail, setSelectedTestEmail] = useState("");
  const formRef = useRef(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next");
  const { loginWithCredentials, isLoggedIn, isReady, session } = useAuth();
  const mockMode = isMockMode();
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isReady || !isLoggedIn || !session?.role) return;
    // Bị middleware/AuthGuard đẩy về đây (?next=...) dù client tưởng đã đăng nhập
    // ⇒ cookie phiên đã ký thiếu/hết hạn/đổi secret. Xóa session cũ để cắt vòng lặp redirect.
    if (redirectTo) {
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
    try {
      await loginWithCredentials({ email, password, redirectTo });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Email hoặc mật khẩu không đúng.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Bạn không có quyền truy cập.");
      } else {
        setError(getErrorMessage(err, "Đăng nhập thất bại. Vui lòng thử lại."));
      }
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

  return (
    <div className={styles.root}>
      <aside className={styles.aside}>
        <div className={styles.asideContent}>
          <AppLogo variant="auth" className={styles.asideLogo} />
          <span className={styles.badge}>{SITE_NAME}</span>
          <h1 className={styles.headline}>
            Quản lý logistics <em className={styles.headlineAccent}>nội bộ</em> cho đội ngũ.
          </h1>
          <p className={styles.lead}>
            Đăng nhập bằng tài khoản nhân viên để truy cập khu vực Admin, Sales và Operations.
            Khách hàng sử dụng ứng dụng riêng.
          </p>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>
                  <Icon icon={feature.icon} className={styles.featureIcon} />
                </div>
                <p className={styles.featureTitle}>{feature.title}</p>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.asideFooter}>
          <div className={styles.avatars}>
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className={styles.avatar}
                style={{ backgroundColor: color }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className={styles.asideFooterText}>
            {`Dành cho nhân viên ${SITE_NAME} — Admin, Sale, Operations`}
          </p>
        </div>

        <div className={styles.asideImageWrap}>
          <div className={styles.asideImageFade} />
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop&q=80"
            alt="Logistics professional"
            className={styles.asideImage}
          />
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.formWrap}>
          <div className={styles.mobileLogo}>
            <AppLogo variant="auth" />
          </div>

          <header className={styles.header}>
            <h2 className={styles.title}>Đăng nhập</h2>
            <p className={styles.subtitle}>Nhập email nhân viên để vào hệ thống nội bộ.</p>
          </header>

          {error ? <div className={styles.error}>{error}</div> : null}

          {isDev && mockMode ? (
            <div className={`${styles.devBox} ${styles.devBoxMock}`}>
              <p className={styles.devBoxTitle}>Chế độ Mock — bấm acc để đăng nhập ngay</p>
              <div className={styles.testAccounts}>
                {MOCK_TEST_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleMockAccount(account)}
                    className={`${styles.testAccountBtn} ${
                      selectedTestEmail === account.email ? styles.testAccountBtnSelected : ""
                    }`}
                  >
                    <span className={styles.testAccountLabel}>{account.label}</span>
                    <span className={styles.testAccountEmail}>{account.email}</span>
                  </button>
                ))}
              </div>
              <p className={styles.devBoxHint}>
                Test ký gửi: chọn <strong>Sale</strong> → sidebar <strong>Quản lý ký gửi</strong>
              </p>
            </div>
          ) : null}

          {isDev && !mockMode ? (
            <div className={`${styles.devBox} ${styles.devBoxApi}`}>
              <p className={styles.devBoxTitle}>Chế độ API — bấm acc để đăng nhập ngay</p>
              <div className={styles.testAccounts}>
                {API_TEST_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleApiAccount(account)}
                    className={`${styles.testAccountBtn} ${
                      selectedTestEmail === account.email ? styles.testAccountBtnSelected : ""
                    }`}
                  >
                    <span className={styles.testAccountLabel}>{account.label}</span>
                    <span className={styles.testAccountEmail}>{account.email}</span>
                  </button>
                ))}
              </div>
              <p className={styles.devBoxHint}>
                Bấm acc → điền email/mật khẩu seed và đăng nhập ngay (chỉ hiện khi dev).
              </p>
            </div>
          ) : null}

          <form
            ref={formRef}
            className={styles.form}
            onSubmit={handleSubmit}
            onInput={() => {
              if (error) setError("");
            }}
          >
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrap}>
                <Icon icon="lucide:mail" className={styles.inputIcon} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="email@congty.com"
                  className={`${styles.input} input-focus-ring`}
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <Link href={ROUTES.auth.forgotPassword} className={styles.forgotLink}>
                  Forgot Password?
                </Link>
              </div>
              <div className={styles.inputWrap}>
                <Icon icon="lucide:lock" className={styles.inputIcon} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className={`${styles.inputPassword} input-focus-ring`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className={styles.togglePassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon
                    icon={showPassword ? "lucide:eye-off" : "lucide:eye"}
                    className={styles.toggleIcon}
                  />
                </button>
              </div>
            </div>

            <label className={styles.remember}>
              <input type="checkbox" className={styles.checkbox} />
              Remember me for 30 days
            </label>

            <button type="submit" disabled={isSubmitting} className={styles.submit}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              {!isSubmitting ? (
                <Icon icon="lucide:arrow-right" className={styles.submitIcon} />
              ) : null}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
