"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CreateConsignmentPage from "@/app/pages/sales/consignments/components/CreateConsignmentPage";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./AccessChecking.module.scss";

export default function StaffCreateConsignmentPage() {
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
      <div className={styles.root}>
        <Icon icon="lucide:loader-2" className={styles.icon} />
        <p className={styles.text}>Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  return <CreateConsignmentPage />;
}
