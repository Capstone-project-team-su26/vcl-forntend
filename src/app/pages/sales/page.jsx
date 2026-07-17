"use client";

import { Suspense } from "react";
import StaffPage from "@/app/pages/sales/components/StaffPage";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className={styles.loading}>
          Đang tải...
        </div>
      }
    >
      <StaffPage />
    </Suspense>
  );
}
