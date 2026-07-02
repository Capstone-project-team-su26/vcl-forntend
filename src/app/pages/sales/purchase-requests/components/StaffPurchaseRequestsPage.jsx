"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PurchaseRequestListPanel from "@/app/pages/sales/purchase-requests/components/PurchaseRequestListPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffPurchaseRequestsPage() {
  const router = useRouter();
  const { isReady, isSale } = useAuth();

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

  return <PurchaseRequestListPanel />;
}
