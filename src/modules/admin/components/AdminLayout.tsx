"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

type AdminNavId = "dashboard" | "users" | "alerts" | "settings";

const navItems: { id: AdminNavId; label: string; icon: string; href?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
  { id: "users", label: "Users", icon: "lucide:users", href: "/admin/users" },
  { id: "alerts", label: "Alerts", icon: "lucide:bell" },
  { id: "settings", label: "Settings", icon: "lucide:settings" },
];

type AdminLayoutProps = {
  activeNav: AdminNavId;
  children: ReactNode;
};

export default function AdminLayout({ activeNav, children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-panel font-sans text-ink">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-muted flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-5 border-b border-border-muted">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-insight flex items-center justify-center">
              <Icon icon="lucide:shield" className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-insight leading-tight">AdminPanel</p>
              <p className="text-[11px] text-muted">Enterprise Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === activeNav;
            const className = `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive
                ? "bg-primary/15 text-insight border-l-4 border-insight pl-2"
                : "text-muted hover:bg-surface"
            }`;

            if (item.href) {
              return (
                <Link key={item.id} href={item.href} className={className} onClick={() => setIsSidebarOpen(false)}>
                  <Icon icon={item.icon} className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            }

            return (
              <button key={item.id} type="button" className={className}>
                <Icon icon={item.icon} className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-muted">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-danger hover:bg-danger/5 transition-colors"
          >
            <Icon icon="lucide:log-out" className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border-muted flex items-center gap-4 px-4 lg:px-8 shrink-0">
          <button
            type="button"
            className="lg:hidden p-2 text-muted"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Icon
                icon="lucide:search"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint"
              />
              <input
                type="search"
                placeholder="Tìm kiếm hệ thống..."
                className="w-full h-10 pl-10 pr-4 bg-surface rounded-full border border-border-muted text-sm text-ink input-focus-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-5 ml-auto">
            <button type="button" className="relative p-2 text-muted hover:text-ink">
              <Icon icon="lucide:bell" className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            <button type="button" className="p-2 text-muted hover:text-ink hidden sm:block">
              <Icon icon="lucide:circle-help" className="w-5 h-5" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-border-muted" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-ink leading-none">Quản trị viên</p>
                <p className="text-[10px] font-bold text-faint tracking-wider mt-1">ADMIN ROLE</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center overflow-hidden">
                <Icon icon="lucide:user" className="w-5 h-5 text-insight" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
