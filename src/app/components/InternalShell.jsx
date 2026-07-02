"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import AppLogo from "@/app/components/AppLogo";
import ThemeToggle from "@/app/components/ThemeToggle";
import UserNavMenu from "@/app/components/UserNavMenu";

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
    <div className="flex min-h-screen bg-background font-open-sans text-ink">
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border-muted flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-border-muted shrink-0">
          <AppLogo href={logoHref} />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.id === activeNav;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <img src={item.icon} alt="" className="w-5 h-5" />
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border-muted shrink-0">
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="no-print h-16 bg-surface-elevated border-b border-border-muted flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-muted hover:text-ink"
            aria-label="Mở menu"
          >
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button type="button" className="relative p-2 text-muted hover:text-ink" aria-label="Thông báo">
              <Icon icon="lucide:bell" className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            <UserNavMenu roleLabel={roleLabel} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-background print:overflow-visible">
          <div className="p-4 lg:p-8 max-w-[1200px] mx-auto print:p-0 print:max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
