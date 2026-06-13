"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppLogo from "@/shared/components/AppLogo";
import * as authService from "@/shared/services/authService";
import { setPendingRegisterEmail } from "@/shared/services/authSession";
import { ApiError } from "@/shared/types/api";
import { getErrorMessage } from "@/shared/utils/apiError";

export default function RegisterPage() {
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
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có từ 8 ký tự trở lên.");
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
        address,
      });

      setPendingRegisterEmail(email);
      setSuccess(response?.message || "OTP đã được gửi đến email của bạn.");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Email đã được sử dụng.");
      } else if (err instanceof ApiError && err.status === 400) {
        setError(getErrorMessage(err, "Dữ liệu không hợp lệ hoặc gửi OTP quá sớm."));
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
      <div className="hidden lg:flex lg:w-1/2 bg-surface-panel flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[274px] h-[202px] bg-secondary/20 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          <AppLogo variant="register" className="mb-6" />
          <p className="text-muted text-xl font-medium leading-relaxed mb-12">
            Streamlining global logistics with secure access for every partner.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          <AppLogo variant="register-mobile" className="lg:hidden mb-8" />

          <h1 className="text-[30px] leading-tight font-bold text-ink tracking-[-0.75px] mb-3">
            Create an account
          </h1>
          <p className="text-muted text-base mb-10">
            Enter your details below to get started with your logistics portal.
          </p>

          {error ? (
            <div className="mb-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-5 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
              {success}
            </div>
          ) : null}

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            onInput={() => {
              if (error) setError("");
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  maxLength={255}
                  placeholder="John Doe"
                  className="w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  placeholder="john@example.com"
                  className="w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={100}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={50}
                  placeholder="0901234567"
                  className="w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Vietnam"
                  className="w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Ho Chi Minh City"
                className="w-full h-11 px-4 bg-white border border-border rounded-[10px] text-sm text-ink input-focus-ring"
              />
            </div>

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-secondary text-white font-bold text-lg rounded-[10px] shadow-sm hover:bg-secondary-hover disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>

              <Link
                href="/login"
                className="block w-full h-10 text-secondary font-semibold text-sm hover:underline text-center"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>

          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-[12px] text-muted leading-relaxed text-center md:text-left">
              By clicking &quot;Create account&quot;, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
