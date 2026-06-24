"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { SITE_NAME } from "@/utils/site";
import { ROUTES } from "@/utils/appRoutes";

export default function AppLogo({ variant = "sidebar", className = "", href }) {
  const linkHref = href ?? (variant === "auth" ? ROUTES.auth.login : null);

  const iconSize = variant === "auth" ? "w-9 h-9" : "w-8 h-8";
  const iconInner = variant === "auth" ? "w-5 h-5" : "w-5 h-5";
  const textSize = variant === "auth" ? "text-xl" : "text-base";

  const inner = (
    <>
      <div
        className={`${iconSize} bg-primary rounded-md flex items-center justify-center shrink-0`}
      >
        <Icon icon="lucide:package" className={`${iconInner} text-white`} />
      </div>
      <span className={`${textSize} font-bold text-ink tracking-tight leading-tight`}>
        {SITE_NAME}
      </span>
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
      className={`flex items-center gap-2.5 hover:opacity-80 transition-opacity ${className}`}
    >
      {inner}
    </Link>
  );
}
