"use client";
import styles from "./StaffPurchaseRequestPurchaseOrderPage.module.scss";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import PurchaseRequestPurchaseOrderPanel from "@/app/pages/sales/purchase-requests/components/PurchaseRequestPurchaseOrderPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffPurchaseRequestPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { isReady, isSale, isOps } = useAuth();
  const id = typeof params.id === "string" ? params.id : "";
  const canAccess = isSale || isOps;

  useEffect(() => {
    if (!isReady) return;
    if (!canAccess) {
      router.replace(ROUTES.sales.home);
    }
  }, [isReady, canAccess, router]);

  if (!isReady || !canAccess) {
    return (
      <div className={styles.t04f23c}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return <PurchaseRequestPurchaseOrderPanel id={id} />;
}
