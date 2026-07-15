"use client";

import { useParams } from "next/navigation";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import ConsignmentDetailPanel from "@/app/pages/sales/consignments/components/ConsignmentDetailPanel";
import { ROUTES } from "@/utils/appRoutes";

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
