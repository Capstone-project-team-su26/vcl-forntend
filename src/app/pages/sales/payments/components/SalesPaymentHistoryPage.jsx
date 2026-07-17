"use client";

import PaymentHistoryPanel from "@/app/components/PaymentHistoryPanel";
import { ROUTES } from "@/utils/appRoutes";

export default function SalesPaymentHistoryPage() {
  return (
    <PaymentHistoryPanel
      title="Lịch sử thanh toán"
      description="Theo dõi đặt cọc và thanh toán cuối của đơn ký gửi bạn phụ trách."
      consignmentHref={(orderId) => ROUTES.sales.consignment(orderId)}
    />
  );
}
