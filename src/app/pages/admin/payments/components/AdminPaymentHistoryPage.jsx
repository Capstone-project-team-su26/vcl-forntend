"use client";

import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import PaymentHistoryPanel from "@/app/components/PaymentHistoryPanel";
import { ROUTES } from "@/utils/appRoutes";

export default function AdminPaymentHistoryPage() {
  return (
    <AdminLayout activeNav="payments">
      <PaymentHistoryPanel
        title="Lịch sử thanh toán"
        description="Toàn bộ giao dịch PayOS (đặt cọc / thanh toán cuối) theo đơn ký gửi gần đây."
        consignmentHref={(orderId) => ROUTES.admin.consignment(orderId)}
      />
    </AdminLayout>
  );
}
