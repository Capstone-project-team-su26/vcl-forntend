"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CustomerListPanel from "@/app/pages/sales/customers/components/CustomerListPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffCustomersPage() {
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

  return <CustomerListPanel />;
}
