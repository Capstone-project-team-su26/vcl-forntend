"use client";
import { jsx } from "react/jsx-runtime";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ConsignmentDetailPanel from "@/app/staff/consignments/components/ConsignmentDetailPanel";
import StaffShell from "@/app/staff/components/StaffShell";
import { useAuth } from "@/hooks/useAuth";
function StaffConsignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isReady, isSale } = useAuth();
  const id = typeof params.id === "string" ? params.id : "";
  useEffect(() => {
    if (!isReady) return;
    if (!isSale) {
      router.replace("/staff");
    }
  }, [isReady, isSale, router]);
  if (!isReady || !isSale) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-surface text-muted", children: "\u0110ang ki\u1EC3m tra quy\u1EC1n truy c\u1EADp..." });
  }
  return /* @__PURE__ */ jsx(
    StaffShell,
    {
      activeSection: "sales",
      visibleSections: ["sales"],
      onSectionChange: () => router.push("/staff?salesTab=consignments"),
      children: /* @__PURE__ */ jsx(ConsignmentDetailPanel, { id, backHref: "/staff?salesTab=consignments" })
    }
  );
}
export {
  StaffConsignmentDetailPage as default
};
