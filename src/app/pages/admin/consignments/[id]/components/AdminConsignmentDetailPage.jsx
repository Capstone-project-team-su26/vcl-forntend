"use client";
import styles from "./AdminConsignmentDetailPage.module.scss";

import { useParams } from "next/navigation";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import ConsignmentDetailPanel from "@/app/pages/sales/consignments/components/ConsignmentDetailPanel";
import { ROUTES } from "@/utils/appRoutes";

export default function AdminConsignmentDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <AdminLayout activeNav="consignments">
      <div className={styles.t6da6a3}>
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
