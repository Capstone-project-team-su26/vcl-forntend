"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/shared/components/AppLogo";
import colors from "@/shared/constants/colors";

const features = [
  { icon: "lucide:shield-check", title: "Secure Transfers", desc: "Enterprise-grade encryption" },
  { icon: "lucide:globe", title: "Global Reach", desc: "140+ countries supported" },
  { icon: "lucide:clock", title: "Real-time Tracking", desc: "Live shipment visibility" },
  { icon: "lucide:package", title: "Smart Sorting", desc: "Automated warehouse routing" },
];

const avatarColors = [colors.primary, colors.secondary, colors.accent, colors.primaryHover];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
      {/* Marketing panel */}
      <aside className="relative hidden lg:flex lg:w-[58%] bg-surface-soft flex-col justify-between p-10 xl:p-14 overflow-hidden">
        <div className="relative z-10">
          <AppLogo variant="auth" className="mb-10" />

          <span className="inline-block px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.12em] uppercase text-muted bg-white border border-border-muted rounded-full">
            New service tiers available
          </span>

          <h1 className="text-[42px] xl:text-[48px] font-bold leading-[1.15] text-ink tracking-tight max-w-[520px] mb-5">
            Logistics management{" "}
            <em className="text-primary italic font-normal">redefined</em>{" "}
            for you.
          </h1>

          <p className="text-[16px] leading-relaxed text-muted max-w-[480px] mb-10">
            Securely manage your global shipments, track real-time deliveries, and optimize
            your logistics pipeline with SwiftShip&apos;s intelligent dashboard.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-[480px]">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-surface-muted p-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)]"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center mb-3">
                  <Icon icon={feature.icon} className="w-[18px] h-[18px] text-secondary" />
                </div>
                <p className="text-sm font-bold text-ink mb-0.5">{feature.title}</p>
                <p className="text-xs text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 mt-10">
          <div className="flex -space-x-2">
            {avatarColors.map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted">
            Joined by <span className="font-semibold text-ink">12,000+</span> businesses worldwide
          </p>
        </div>

        {/* Hero image */}
        <div className="absolute top-0 right-0 w-[42%] h-full pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-surface-soft via-surface-soft/80 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop&q=80"
            alt="Logistics professional"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </aside>

      {/* Login form */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
        <div className="w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto lg:mr-auto xl:mr-16">
          {/* Mobile logo */}
          <AppLogo variant="auth" className="lg:hidden mb-8" />

          <header className="mb-8">
            <h2 className="text-[28px] font-bold text-ink tracking-tight mb-2">Welcome Back</h2>
            <p className="text-[15px] text-muted">
              Please enter your details to access your dashboard.
            </p>
          </header>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-ink">
                Email Address
              </label>
              <div className="relative">
                <Icon
                  icon="lucide:mail"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-faint"
                />
                <input
                  id="email"
                  type="email"
                  placeholder="alex.h@swiftship.com"
                  className="w-full h-12 pl-11 pr-4 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-ink">
                  Password
                </label>
                <button type="button" className="text-xs font-semibold text-primary hover:text-secondary">
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Icon
                  icon="lucide:lock"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-faint"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 bg-white border border-border-muted rounded-lg text-sm text-ink input-focus-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border-muted accent-primary"
              />
              <span className="text-sm text-muted">Remember me for 30 days</span>
            </label>

            <button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              Sign In to Dashboard
              <Icon icon="lucide:arrow-right" className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-border-muted" />
            <span className="text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
              Or continue with
            </span>
            <div className="flex-1 h-px bg-border-muted" />
          </div>

          <button
            type="button"
            className="w-full h-11 flex items-center justify-center gap-2 border border-border-muted rounded-lg text-sm font-semibold text-ink hover:bg-surface transition-colors"
          >
            <Icon icon="logos:google-icon" className="w-4 h-4" />
            Google
          </button>

          <p className="mt-8 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-primary hover:text-secondary">
              Request Access
            </Link>
          </p>

          <div className="mt-10 pt-6 border-t border-surface-muted flex flex-wrap justify-center gap-x-6 gap-y-2">
            <button type="button" className="text-xs text-faint hover:text-muted">
              Privacy Policy
            </button>
            <button type="button" className="text-xs text-faint hover:text-muted">
              Terms of Service
            </button>
            <button type="button" className="text-xs text-faint hover:text-muted">
              Help Center
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
