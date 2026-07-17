"use client";

import { Icon } from "@iconify/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ReceivingNotePage from "@/app/pages/sales/consignments/components/ReceivingNotePage";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./AccessChecking.module.scss";

export default function StaffReceivingNotePage() {
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
      <div className={styles.root}>
        <Icon icon="lucide:loader-2" className={styles.icon} />
        <p className={styles.text}>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return <ReceivingNotePage consignmentId={id} />;
}
