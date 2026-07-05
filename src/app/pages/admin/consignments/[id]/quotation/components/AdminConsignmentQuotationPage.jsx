"use client";

import { useParams } from "next/navigation";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import ConsignmentQuotationPanel from "@/app/pages/sales/consignments/components/ConsignmentQuotationPanel";
import { ROUTES } from "@/utils/appRoutes";

export default function AdminConsignmentQuotationPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <AdminLayout activeNav="consignments">
      <ConsignmentQuotationPanel id={id} backHref={ROUTES.admin.consignment(id)} readOnly />
    </AdminLayout>
  );
}
