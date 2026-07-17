"use client";
import styles from "./StaffPurchaseRequestQuotationPage.module.scss";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import PurchaseRequestQuotationPanel from "@/app/pages/sales/purchase-requests/components/PurchaseRequestQuotationPanel";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffPurchaseRequestQuotationPage() {
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
      <div className={styles.t04f23c}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return <PurchaseRequestQuotationPanel id={id} />;
}
