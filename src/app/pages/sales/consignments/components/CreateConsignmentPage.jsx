"use client";

import { useSearchParams } from "next/navigation";
import CreateConsignmentRequestPage from "@/app/pages/sales/consignments/components/CreateConsignmentRequestPage";
import CreatePurchaseOrderRequestPage from "@/app/pages/sales/consignments/components/CreatePurchaseOrderRequestPage";

export default function CreateConsignmentPage() {
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");
  const isPurchaseOrder = searchParams.get("orderType") === "PURCHASE_ORDER";

  if (isPurchaseOrder) {
    return <CreatePurchaseOrderRequestPage preselectedCustomerId={preselectedCustomerId} />;
  }

  return <CreateConsignmentRequestPage preselectedCustomerId={preselectedCustomerId} />;
}
