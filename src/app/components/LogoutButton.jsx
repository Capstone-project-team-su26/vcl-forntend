"use client";

import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/useAuth";
import styles from "./LogoutButton.module.scss";

export default function LogoutButton({ variant = "sidebar", className = "" }) {
  const { logout, isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={logout}
        className={`${styles.headerBtn} ${className}`}
      >
        <Icon icon="lucide:log-out" className={styles.iconSm} />
        <span className={styles.headerLabel}>Logout</span>
      </button>
    );
  }

  return (
    <button type="button" onClick={logout} className={`${styles.sidebarBtn} ${className}`}>
      <Icon icon="lucide:log-out" className={styles.iconMd} />
      Logout
    </button>
  );
}
