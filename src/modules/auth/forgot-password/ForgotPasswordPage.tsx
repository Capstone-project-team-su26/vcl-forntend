"use client";

import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/shared/components/AppLogo";
import * as authService from "@/shared/services/authService";
import { ApiError } from "@/shared/types/api";
import { getErrorMessage } from "@/shared/utils/apiError";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const email = e.currentTarget.email?.value?.trim();
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.forgotPassword({ email });
      setMessage(
        response?.message ||
          "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn."
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("Email không tồn tại.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border-muted shadow-sm p-8">
        <AppLogo variant="auth" className="mb-8" />

        <h1 className="text-2xl font-bold text-ink mb-2">Quên mật khẩu</h1>
        <p className="text-sm text-muted mb-6">
          Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>

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

        <form
          className="space-y-5"
          onSubmit={handleSubmit}
          onInput={() => {
            if (error) setError("");
          }}
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="customer@example.com"
              className="w-full h-12 px-4 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
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
