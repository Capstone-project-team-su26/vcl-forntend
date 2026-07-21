"use client";

import { useParams } from "next/navigation";
import AdminLayout from "../../components/AdminLayout";
import CustomerProfileDetailPanel from "../components/CustomerProfileDetailPanel";

export default function Page() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  return (
    <AdminLayout activeNav="customer-users">
      <CustomerProfileDetailPanel id={id} />
    </AdminLayout>
  );
}
