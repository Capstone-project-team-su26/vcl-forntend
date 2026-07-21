"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import { ROUTES } from "@/utils/appRoutes";

const ConsignmentDetailPanel = dynamic(
  () => import("@/app/pages/sales/consignments/components/ConsignmentDetailPanel"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-24 text-muted">
        Đang tải chi tiết...
      </div>
    ),
  }
);

export default function AdminConsignmentDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <AdminLayout activeNav="consignments">
      <div className="w-full">
        <ConsignmentDetailPanel
          id={id}
          backHref={ROUTES.admin.consignments}
          quotationHref={ROUTES.admin.consignmentQuotation(id)}
          readOnly
        />
      </div>
    </AdminLayout>
  );
}
