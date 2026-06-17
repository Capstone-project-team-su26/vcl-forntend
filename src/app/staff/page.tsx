"use client";

import { Suspense } from "react";
import StaffPage from "@/modules/staff/StaffPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface text-muted">
          Đang tải...
        </div>
      }
    >
      <StaffPage />
    </Suspense>
  );
}
