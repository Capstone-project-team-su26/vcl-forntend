"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ConsignmentDetailPanel from "@/modules/staff/consignments/ConsignmentDetailPanel";
import StaffShell from "@/modules/staff/components/StaffShell";
import { useAuth } from "@/shared/hooks/useAuth";

export default function StaffConsignmentDetailPage() {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-muted">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <StaffShell
      activeSection="sales"
      visibleSections={["sales"]}
      onSectionChange={() => router.push("/staff?salesTab=consignments")}
    >
      <ConsignmentDetailPanel id={id} backHref="/staff?salesTab=consignments" />
    </StaffShell>
  );
}
