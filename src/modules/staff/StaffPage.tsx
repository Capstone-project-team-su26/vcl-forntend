"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StaffShell from "@/modules/staff/components/StaffShell";
import DomesticWarehouseSection from "./domestic-warehouse/DomesticWarehouseSection";
import AppLogo from "@/shared/components/AppLogo";
import TransferHistory from "./transfer-history/TransferHistory";
import Tracking from "./domestic-warehouse/Tracking";

type StaffSection = "sales" | "global-warehouse" | "domestic-warehouse" | "transfer-history" | "tracking";

const sectionNav: { id: StaffSection; label: string; icon: string }[] = [
  { id: "sales", label: "Sales", icon: "./assets/IMG_2.svg" },
  { id: "global-warehouse", label: "International Warehouse", icon: "./assets/IMG_4.svg" },
  { id: "domestic-warehouse", label: "Domestic Warehouse", icon: "./assets/IMG_3.svg" },
  { id: "transfer-history", label: "Transfer History", icon: "./assets/IMG_3.svg" },
  { id: "tracking", label: "Track package", icon: "./assets/IMG_3.svg" },
];

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
      case "transfer-history":
        return <TransferHistory/>;
      case "tracking":
        return <Tracking/>;
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
