"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import CustomerDetailPanel from "@/app/pages/sales/customers/components/CustomerDetailPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffCustomerDetailPage() {
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

  return <CustomerDetailPanel id={id} />;
}
