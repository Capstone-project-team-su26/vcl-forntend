"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./UserNavMenu.module.scss";

const ROLE_LABELS = {
  Sale: "Sales",
  OperationsManager: "Operations",
  Admin: "Admin",
};

function formatRoleLabel(sessionRole, fallback) {
  if (sessionRole && ROLE_LABELS[sessionRole]) return ROLE_LABELS[sessionRole];
  if (sessionRole) return sessionRole;
  return fallback;
}

export default function UserNavMenu({
  displayName = "User",
  roleLabel = "USER",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { session, isLoggedIn, logout } = useAuth();
  const name = session?.displayName || displayName;
  const role = formatRoleLabel(session?.role, roleLabel);
  const email = session?.email;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${styles.root} ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className={styles.userInfo}>
          <p className={styles.displayName}>{name}</p>
          <p className={styles.roleLabel}>{role}</p>
        </div>
        <div className={styles.avatar}>
          <Icon icon="lucide:user" className={styles.avatarIcon} />
        </div>
        <Icon
          icon="lucide:chevron-down"
          className={`${styles.chevron} ${open ? styles.open : ""}`}
        />
      </button>

      {open && (
        <div role="menu" className={styles.menu}>
          <div className={styles.menuHeader}>
            <p className={styles.menuName}>{name}</p>
            {email ? (
              <p className={styles.menuEmail}>{email}</p>
            ) : (
              <p className={styles.menuRole}>{role}</p>
            )}
          </div>

          {isLoggedIn ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className={styles.logoutBtn}
            >
              <Icon icon="lucide:log-out" className={styles.menuIcon} />
              Logout
            </button>
          ) : (
            <Link
              href={ROUTES.auth.login}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={styles.signInLink}
            >
              <Icon icon="lucide:log-in" className={styles.menuIcon} />
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
