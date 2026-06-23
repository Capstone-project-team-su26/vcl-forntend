"use client";
import { jsx } from "react/jsx-runtime";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import StaffShell from "@/app/staff/components/StaffShell";
import DomesticWarehouseSection from "./domestic-warehouse/DomesticWarehouseSection";
import GlobalWarehouseSection from "./global-warehouse/GlobalWarehouseSection";
import SalesSection from "./sales/SalesSection";
import TransferHistory from "./transfer-history/TransferHistory";
import Tracking from "./domestic-warehouse/Tracking";
import {
  getDefaultStaffSection,
  getStaffSectionsForRole
} from "@/app/staff/components/staffSections";
import { useAuth } from "@/hooks/useAuth";
function StaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isReady } = useAuth();
  const visibleSections = useMemo(
    () => getStaffSectionsForRole(session?.role),
    [session?.role]
  );
  const salesTab = searchParams.get("salesTab") === "consignments" ? "consignments" : "overview";
  const [activeSection, setActiveSection] = useState("sales");
  useEffect(() => {
    if (!isReady || !session?.role) return;
    const defaultSection = getDefaultStaffSection(session.role);
    setActiveSection(defaultSection);
  }, [isReady, session?.role]);
  function handleSectionChange(section) {
    setActiveSection(section);
    router.push("/staff");
  }
  function handleSalesTabChange(tab) {
    if (tab === "consignments") {
      router.push("/staff?salesTab=consignments");
    } else {
      router.push("/staff");
    }
  }
  function renderSection() {
    switch (activeSection) {
      case "sales":
        return /* @__PURE__ */ jsx(SalesSection, { activeTab: salesTab, onTabChange: handleSalesTabChange });
      case "global-warehouse":
        return /* @__PURE__ */ jsx(GlobalWarehouseSection, {});
      case "domestic-warehouse":
        return /* @__PURE__ */ jsx(DomesticWarehouseSection, {});
      case "transfer-history":
        return /* @__PURE__ */ jsx(TransferHistory, {});
      case "tracking":
        return /* @__PURE__ */ jsx(Tracking, {});
      default:
        return null;
    }
  }
  if (!isReady) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-surface text-muted", children: "\u0110ang t\u1EA3i..." });
  }
  return /* @__PURE__ */ jsx(
    StaffShell,
    {
      activeSection,
      visibleSections,
      onSectionChange: handleSectionChange,
      children: renderSection()
    }
  );
}
export {
  StaffPage as default
};
