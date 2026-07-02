"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import ConsignmentListPanel from "@/app/pages/sales/consignments/components/ConsignmentListPanel";
import { ROUTES } from "@/utils/appRoutes";

export default function StaffConsignmentsPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={ROUTES.sales.createConsignment}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
        >
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Tạo yêu cầu ký gửi
        </Link>
      </div>
      <ConsignmentListPanel />
    </div>
  );
}
