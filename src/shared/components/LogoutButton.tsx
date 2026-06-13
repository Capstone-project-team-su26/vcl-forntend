"use client";

import { Icon } from "@iconify/react";
import { useAuth } from "@/shared/hooks/useAuth";

type LogoutButtonProps = {
  variant?: "sidebar" | "header";
  className?: string;
};

export default function LogoutButton({ variant = "sidebar", className = "" }: LogoutButtonProps) {
  const { logout, isLoggedIn } = useAuth();

  if (!isLoggedIn) return null;

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={logout}
        className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-semibold text-danger border border-danger/20 hover:bg-danger/5 transition-colors ${className}`}
      >
        <Icon icon="lucide:log-out" className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/5 transition-colors ${className}`}
    >
      <Icon icon="lucide:log-out" className="w-5 h-5" />
      Logout
    </button>
  );
}
