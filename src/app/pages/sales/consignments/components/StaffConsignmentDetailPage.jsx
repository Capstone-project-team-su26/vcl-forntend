"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

const ConsignmentDetailPanel = dynamic(
  () => import("@/app/pages/sales/consignments/components/ConsignmentDetailPanel"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-24 text-muted">
        Đang tải chi tiết...
      </div>
    ),
  }
);

export default function StaffConsignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isReady, isSale } = useAuth();
  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    if (!isReady) return;
    if (!isSale) {
      router.replace(ROUTES.sales.home);
    }
  }, [isReady, isSale, router]);

  if (!isReady || !isSale) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return <ConsignmentDetailPanel id={id} backHref={ROUTES.sales.consignments} />;
}
