"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { SITE_NAME } from "@/utils/site";
import { ROUTES } from "@/utils/appRoutes";

export default function AppLogo({ variant = "sidebar", className = "", href }) {
  const linkHref = href ?? (variant === "auth" ? ROUTES.auth.login : null);

  const iconSize = variant === "auth" ? "w-10 h-10" : "w-9 h-9";
  const iconInner = variant === "auth" ? "w-5 h-5" : "w-[18px] h-[18px]";

  const inner = (
    <>
      <div
        className={`${iconSize} bg-secondary rounded-lg flex items-center justify-center shrink-0 shadow-sm`}
      >
        <Icon icon="lucide:package" className={`${iconInner} text-accent-subtle`} />
      </div>
      {variant === "auth" ? (
        <span className="text-xl font-bold text-ink tracking-tight leading-tight">{SITE_NAME}</span>
      ) : (
        <div className="min-w-0 leading-tight">
          <span className="block text-[15px] font-extrabold text-ink tracking-tight">
            Vietnam
          </span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
            Logistics
          </span>
        </div>
      )}
    </>
  );

  if (!linkHref) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>{inner}</div>
    );
  }

  return (
    <Link
      href={linkHref}
      className={`flex items-center gap-3 hover:opacity-90 transition-opacity ${className}`}
    >
      {inner}
    </Link>
  );
}
