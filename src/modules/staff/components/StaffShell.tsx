"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppLogo from "@/shared/components/AppLogo";
import UserNavMenu from "@/shared/components/UserNavMenu";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  canAccessStaffArea,
  type StaffSection,
} from "@/modules/staff/staffSections";

const SECTION_META: Record<StaffSection, { label: string; icon: string }> = {
  sales: { label: "Sales", icon: "./assets/IMG_2.svg" },
  "global-warehouse": { label: "Global Warehouse", icon: "./assets/IMG_4.svg" },
  "domestic-warehouse": { label: "Domestic Warehouse", icon: "./assets/IMG_3.svg" },
  "transfer-history": { label: "Transfer History", icon: "./assets/IMG_3.svg" },
  tracking: { label: "Track package", icon: "./assets/IMG_3.svg" },
};

type StaffShellProps = {
  activeSection: StaffSection;
  visibleSections: StaffSection[];
  onSectionChange?: (section: StaffSection) => void;
  children: ReactNode;
};

export default function StaffShell({
  activeSection,
  visibleSections,
  onSectionChange,
  children,
}: StaffShellProps) {
  const router = useRouter();
  const { session, isReady } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (!session?.token) {
      router.replace("/login");
      return;
    }

    if (!canAccessStaffArea(session.role)) {
      router.replace("/");
    }
  }, [isReady, session?.token, session?.role, router]);

  if (!isReady || !session?.token || !canAccessStaffArea(session.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-muted">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-open-sans text-ink">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-muted flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-surface-muted shrink-0">
          <AppLogo />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {visibleSections.map((sectionId) => {
            const item = SECTION_META[sectionId];
            const isActive = sectionId === activeSection;

            return (
              <button
                key={sectionId}
                type="button"
                onClick={() => {
                  onSectionChange?.(sectionId);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted hover:bg-gray-100"
                }`}
              >
                <img src={item.icon} alt={item.label} className="w-5 h-5" />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-muted">
          <UserNavMenu roleLabel="Staff" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-surface-muted flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600"
          >
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button type="button" className="relative p-2 text-muted hover:text-ink">
              <Icon icon="lucide:bell" className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-surface-muted" />
            <UserNavMenu roleLabel="Staff" className="hidden lg:flex" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">{children}</div>

          <footer className="mt-8 border-t border-surface-muted bg-surface-muted/30 px-4 lg:px-8 py-4">
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[12px] text-muted">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
              <div className="flex gap-6">
                <button type="button" className="text-[12px] text-muted hover:text-ink">
                  Support Center
                </button>
                <button type="button" className="text-[12px] text-muted hover:text-ink">
                  Terms of Service
                </button>
                <button type="button" className="text-[12px] text-muted hover:text-ink">
                  Privacy Policy
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
