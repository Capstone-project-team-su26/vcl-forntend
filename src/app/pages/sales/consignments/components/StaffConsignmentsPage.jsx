"use client";

import dynamic from "next/dynamic";

const ConsignmentListPanel = dynamic(
  () => import("@/app/pages/sales/consignments/components/ConsignmentListPanel"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-24 text-muted">
        Đang tải danh sách...
      </div>
    ),
  }
);

export default function StaffConsignmentsPage() {
  return <ConsignmentListPanel />;
}
