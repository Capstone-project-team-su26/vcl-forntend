"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import PurchaseRequestDetailPanel from "@/app/pages/sales/purchase-requests/components/PurchaseRequestDetailPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffPurchaseRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isReady, isSale } = useAuth();
  const rawId = params?.id;
  const id =
    typeof rawId === "string" && rawId && rawId !== "undefined" ? rawId : "";

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

  if (!id) {
    return (
      <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
        Không tìm thấy mã yêu cầu mua hộ. Quay lại danh sách và mở lại chi tiết.
      </div>
    );
  }

  return <PurchaseRequestDetailPanel id={id} />;
}
