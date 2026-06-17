"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StaffShell from "@/modules/staff/components/StaffShell";
import DomesticWarehouseSection from "./domestic-warehouse/DomesticWarehouseSection";
import GlobalWarehouseSection from "./global-warehouse/GlobalWarehouseSection";
import SalesSection from "./sales/SalesSection";
import {
  getDefaultStaffSection,
  getStaffSectionsForRole,
  type SalesTab,
  type StaffSection,
} from "@/modules/staff/staffSections";
import { useAuth } from "@/shared/hooks/useAuth";

export default function StaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isReady } = useAuth();

  const visibleSections = useMemo(
    () => getStaffSectionsForRole(session?.role),
    [session?.role]
  );

  const salesTab: SalesTab =
    searchParams.get("salesTab") === "consignments" ? "consignments" : "overview";

  const [activeSection, setActiveSection] = useState<StaffSection>("sales");

  useEffect(() => {
    if (!isReady || !session?.role) return;

    const defaultSection = getDefaultStaffSection(session.role);
    setActiveSection(defaultSection);
  }, [isReady, session?.role]);

  function handleSectionChange(section: StaffSection) {
    setActiveSection(section);
    router.push("/staff");
  }

  function handleSalesTabChange(tab: SalesTab) {
    if (tab === "consignments") {
      router.push("/staff?salesTab=consignments");
    } else {
      router.push("/staff");
    }
  }

  function renderSection() {
    switch (activeSection) {
      case "sales":
        return <SalesSection activeTab={salesTab} onTabChange={handleSalesTabChange} />;
      case "global-warehouse":
        return <GlobalWarehouseSection />;
      case "domestic-warehouse":
        return <DomesticWarehouseSection />;
      default:
        return null;
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-muted">
        Đang tải...
      </div>
    );
  }

  return (
    <StaffShell
      activeSection={activeSection}
      visibleSections={visibleSections}
      onSectionChange={handleSectionChange}
    >
      {renderSection()}
    </StaffShell>
  );
}
