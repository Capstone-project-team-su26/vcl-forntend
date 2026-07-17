"use client";
import styles from "./StaffPurchaseOrderStatusPage.module.scss";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import PurchaseOrderStatusPanel from "@/app/pages/sales/purchase-orders/components/PurchaseOrderStatusPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffPurchaseOrderStatusPage() {
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

  return <PurchaseOrderStatusPanel id={id} />;
}
