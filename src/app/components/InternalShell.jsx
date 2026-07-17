"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserNavMenu from "@/app/components/UserNavMenu";
import styles from "./InternalShell.module.scss";

/** Layout nội bộ dùng chung — sidebar + header, một logo, một UserNavMenu (chỉ header). */
export default function InternalShell({
  navItems,
  activeNav,
  roleLabel,
  logoHref,
  children,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.root}>
      {isSidebarOpen ? (
        <div
          className={`no-print ${styles.overlay}`}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`no-print ${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <AppLogo href={logoHref} />
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.id === activeNav;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.navIconWrap}>
                  {item.icon?.startsWith("/") ? (
                    <img
                      src={item.icon}
                      alt=""
                      className={styles.navIconImg}
                    />
                  ) : (
                    <Icon icon={item.icon} className={styles.navIcon} aria-hidden />
                  )}
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <ThemeToggle />
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <header className={`no-print ${styles.header}`}>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className={styles.menuBtn}
            aria-label="Mở menu"
          >
            <Icon icon="lucide:menu" className={styles.menuIcon} />
          </button>

          <div className={styles.headerActions}>
            <button type="button" className={styles.notifyBtn} aria-label="Thông báo">
              <Icon icon="lucide:bell" className={styles.notifyIcon} />
              <span className={styles.notifyDot} />
            </button>
            <UserNavMenu roleLabel={roleLabel} />
          </div>
        </header>

        <main className={`${styles.main} custom-scrollbar`}>
          <div className={styles.mainInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
