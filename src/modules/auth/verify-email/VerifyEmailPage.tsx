"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppLogo from "@/shared/components/AppLogo";
import * as authService from "@/shared/services/authService";
import {
  clearPendingRegisterEmail,
  getPendingRegisterEmail,
} from "@/shared/services/authSession";
import { ApiError } from "@/shared/types/api";
import { getErrorMessage } from "@/shared/utils/apiError";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
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
    if (cooldown <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Thiếu email. Vui lòng đăng ký lại.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP phải gồm đúng 6 chữ số.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.verifyCustomerOtp({ email, otp });
      clearPendingRegisterEmail();
      setMessage(response?.message || "Đăng ký tài khoản thành công.");
      router.push("/login");
    } catch (err) {
      setError(getErrorMessage(err, "OTP không hợp lệ hoặc đã hết hạn."));
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
      setMessage(response?.message || "OTP mới đã được gửi.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError(getErrorMessage(err, "Chỉ được gửi lại OTP sau 60 giây."));
        setCooldown(RESEND_COOLDOWN_SECONDS);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-border-muted shadow-sm p-8">
        <AppLogo variant="auth" className="mb-8" />

        <h1 className="text-2xl font-bold text-ink mb-2">Xác thực email</h1>
        <p className="text-sm text-muted mb-6">
          Nhập mã OTP 6 số đã gửi tới{" "}
          <span className="font-semibold text-ink">{email || "email của bạn"}</span>.
          OTP có hiệu lực 5 phút.
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

        <form className="space-y-5" onSubmit={handleVerify}>
          <div className="space-y-2">
            <label htmlFor="otp" className="text-sm font-semibold text-ink">
              Mã OTP
            </label>
            <input
              id="otp"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, ""));
                if (error) setError("");
              }}
              placeholder="123456"
              className="w-full h-12 px-4 bg-white border border-border-muted rounded-lg text-center text-lg tracking-[0.4em] text-ink input-focus-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold rounded-lg transition-colors"
          >
            {isSubmitting ? "Đang xác thực..." : "Xác thực tài khoản"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="inline-flex items-center justify-center gap-2 font-semibold text-secondary hover:text-insight disabled:opacity-50"
          >
            <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
            {cooldown > 0 ? `Gửi lại OTP (${cooldown}s)` : isResending ? "Đang gửi..." : "Gửi lại OTP"}
          </button>

          <Link href="/login" className="text-center text-muted hover:text-ink">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
