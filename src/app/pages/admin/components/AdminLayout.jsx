"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserNavMenu from "@/app/components/UserNavMenu";
import { ROUTES } from "@/utils/appRoutes";

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
    <div className="flex min-h-screen bg-surface-panel font-sans text-ink">
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-elevated border-r border-border-muted flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-border-muted shrink-0">
          <AppLogo href={ROUTES.admin.users} />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.id === activeNav;
            const className = `w-full flex items-center gap-3 pl-2.5 pr-3 py-2 rounded-lg border-l-[3px] text-sm transition-colors ${
              isActive
                ? "border-l-primary bg-primary/10 text-primary font-bold"
                : "border-l-transparent text-muted font-semibold hover:bg-surface-muted hover:text-ink"
            }`;

            const content = (
              <>
                <Icon
                  icon={item.icon}
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`}
                />
                <span>{item.label}</span>
              </>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={className}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.id} type="button" className={className}>
                {content}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-border-muted shrink-0">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-surface-elevated border-b border-border-muted flex items-center gap-4 px-4 lg:px-8 shrink-0">
          <button
            type="button"
            className="lg:hidden p-2 text-muted"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 lg:gap-5 ml-auto">
            <button
              type="button"
              className="relative p-2 text-muted hover:text-ink"
              aria-label="Thông báo"
            >
              <Icon icon="lucide:bell" className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-border-muted" />
            <UserNavMenu roleLabel="Quản trị" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 pt-4 pb-6 lg:px-10 lg:pt-5 lg:pb-8 w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
