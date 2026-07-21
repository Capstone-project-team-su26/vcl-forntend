"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import { ROUTES } from "@/utils/appRoutes";

const ConsignmentQuotationPanel = dynamic(
  () => import("@/app/pages/sales/consignments/components/ConsignmentQuotationPanel"),
  {
    loading: () => (
      <div className="flex items-center justify-center py-24 text-muted">
        Đang tải báo giá...
      </div>
    ),
  }
);

export default function AdminConsignmentQuotationPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <AdminLayout activeNav="consignments">
      <ConsignmentQuotationPanel id={id} backHref={ROUTES.admin.consignment(id)} readOnly />
    </AdminLayout>
  );
}
