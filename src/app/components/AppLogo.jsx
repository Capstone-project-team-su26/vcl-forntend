"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { SITE_NAME } from "@/utils/site";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./AppLogo.module.scss";

export default function AppLogo({ variant = "sidebar", className = "", href }) {
  const linkHref = href ?? (variant === "auth" ? ROUTES.auth.login : null);

  const inner = (
    <>
      <div className={`${styles.iconBox} ${styles[variant]}`}>
        <Icon icon="lucide:package" className={styles.icon} />
      </div>
      {variant === "auth" ? (
        <span className={styles.authTitle}>{SITE_NAME}</span>
      ) : (
        <div className={styles.textBlock}>
          <span className={styles.brandPrimary}>Vietnam</span>
          <span className={styles.brandSecondary}>Logistics</span>
        </div>
      )}
    </>
  );

  if (!linkHref) {
    return <div className={`${styles.wrap} ${className}`}>{inner}</div>;
  }

  return (
    <Link href={linkHref} className={`${styles.link} ${className}`}>
      {inner}
    </Link>
  );
}
