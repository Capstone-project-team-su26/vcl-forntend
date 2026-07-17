"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserNavMenu from "@/app/components/UserNavMenu";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { id: "dashboard", label: "Tổng quan", icon: "lucide:layout-dashboard" },
  { id: "users", label: "Người dùng", icon: "lucide:users", href: ROUTES.admin.users },
  {
    id: "consignments",
    label: "Yêu cầu ký gửi",
    icon: "lucide:package-search",
    href: ROUTES.admin.consignments,
  },
  {
    id: "restricted-items",
    label: "Hàng cấm",
    icon: "lucide:shield-alert",
    href: ROUTES.admin.restrictedItems,
  },
  {
    id: "pricing-rules",
    label: "Giá DV chính",
    icon: "lucide:receipt",
    href: ROUTES.admin.pricingRules,
  },
  {
    id: "warehouses",
    label: "Quản lý kho",
    icon: "lucide:warehouse",
    href: ROUTES.admin.warehouses,
  },
  {
    id: "shipping-methods",
    label: "Vận chuyển",
    icon: "lucide:truck",
    href: ROUTES.admin.shippingMethods,
  },
  {
    id: "carriers",
    label: "Đơn vị vận chuyển",
    icon: "lucide:plane",
    href: ROUTES.admin.carriers,
  },
  {
    id: "additional-service-fees",
    label: "Phí DV bổ sung",
    icon: "lucide:layers",
    href: ROUTES.admin.additionalServiceFees,
  },
  { id: "alerts", label: "Cảnh báo", icon: "lucide:bell" },
  { id: "settings", label: "Cài đặt", icon: "lucide:settings" },
];

export default function AdminLayout({ activeNav, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.root}>
      {isSidebarOpen ? (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <AppLogo href={ROUTES.admin.users} />
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.id === activeNav;
            const linkClass = `${styles.navLink} ${isActive ? styles.active : ""}`;

            const content = (
              <>
                <Icon
                  icon={item.icon}
                  className={styles.navIcon}
                />
                <span>{item.label}</span>
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={linkClass}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.id} type="button" className={linkClass}>
                {content}
              </button>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <ThemeToggle />
        </div>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Icon icon="lucide:menu" className={styles.menuIcon} />
          </button>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.notifyBtn}
              aria-label="Thông báo"
            >
              <Icon icon="lucide:bell" className={styles.notifyIcon} />
              <span className={styles.notifyDot} />
            </button>
            <div className={styles.headerDivider} />
            <UserNavMenu roleLabel="Quản trị" />
          </div>
        </header>

        <main className={`${styles.main} custom-scrollbar`}>
          <div className={styles.mainInner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
