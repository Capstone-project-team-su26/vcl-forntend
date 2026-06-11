"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppLogo from "@/shared/components/AppLogo";
import * as authService from "@/shared/services/authService";
import { getErrorMessage } from "@/shared/utils/apiError";

export default function ResetPasswordPage() {
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
      setError("Thiếu token đặt lại mật khẩu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu phải có từ 8 ký tự trở lên.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.resetPassword({ token, newPassword });
      setMessage(response?.message || "Mật khẩu đã được đặt lại thành công.");
      window.setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Token không hợp lệ hoặc đã hết hạn."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border-muted shadow-sm p-8">
        <AppLogo variant="auth" className="mb-8" />

        <h1 className="text-2xl font-bold text-ink mb-2">Đặt lại mật khẩu</h1>
        <p className="text-sm text-muted mb-6">Nhập mật khẩu mới cho tài khoản của bạn.</p>

        {error ? (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mb-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
            {message}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-semibold text-ink">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              maxLength={100}
              className="w-full h-12 px-4 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-ink">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full h-12 px-4 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
          >
            {isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-semibold text-secondary hover:text-insight">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
