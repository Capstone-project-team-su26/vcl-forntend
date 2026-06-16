"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import SalesSection from "./sales/SalesSection";
import GlobalWarehouseSection from "./global-warehouse/GlobalWarehouseSection";
import DomesticWarehouseSection from "./domestic-warehouse/DomesticWarehouseSection";
import AppLogo from "@/shared/components/AppLogo";
import TransferHistory from "./transfer-history/TransferHistory";

type StaffSection = "sales" | "global-warehouse" | "domestic-warehouse" | "transfer-history";

const sectionNav: { id: StaffSection; label: string; icon: string }[] = [
  { id: "sales", label: "Sales", icon: "./assets/IMG_2.svg" },
  { id: "global-warehouse", label: "Global Warehouse", icon: "./assets/IMG_4.svg" },
  { id: "domestic-warehouse", label: "Domestic Warehouse", icon: "./assets/IMG_3.svg" },
  { id: "transfer-history", label: "Transfer History", icon: "./assets/IMG_3.svg" },
];

export default function StaffPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<StaffSection>("sales");

  const renderSection = () => {
    switch (activeSection) {
      case "sales":
        return <SalesSection />;
      case "global-warehouse":
        return <GlobalWarehouseSection />;
      case "domestic-warehouse":
        return <DomesticWarehouseSection />;
      case "transfer-history":
        return <TransferHistory/>;
      default:
        return <SalesSection />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-open-sans text-ink">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-muted transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-surface-muted">
            <AppLogo />
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {sectionNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeSection === item.id ? "bg-primary/10 text-primary" : "text-muted hover:bg-gray-100"
                }`}
              >
                <img src={item.icon} alt={item.label} className="w-5 h-5" />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-surface-muted space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-muted hover:bg-gray-100 rounded-lg transition-colors">
              <img src="./assets/IMG_6.svg" alt="Settings" className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-danger hover:bg-red-50 rounded-lg transition-colors">
              <img src="./assets/IMG_7.svg" alt="Sign Out" className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-surface-muted flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-600">
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            <div className="relative">
              <img src="./assets/IMG_9.svg" alt="Notifications" className="w-5 h-5 text-ink" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger border-2 border-white rounded-full" />
            </div>
            <div className="hidden sm:block h-8 w-px bg-surface-muted" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Alex Henderson</p>
                <p className="text-[12px] text-muted mt-1">Internal Staff</p>
              </div>
              <div className="relative">
                <img src="./assets/IMG_8.webp" alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
            {renderSection()}
          </div>

          <footer className="mt-auto border-t border-surface-muted bg-surface-muted/30 px-4 lg:px-8 py-4">
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[12px] text-muted">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
              <div className="flex gap-6">
                <button className="text-[12px] text-muted hover:text-ink">Support Center</button>
                <button className="text-[12px] text-muted hover:text-ink">Terms of Service</button>
                <button className="text-[12px] text-muted hover:text-ink">Privacy Policy</button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
