"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ConsignmentDetailPanel from "@/app/pages/sales/consignments/components/ConsignmentDetailPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

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
