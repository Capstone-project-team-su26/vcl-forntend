"use client";

import AdminLayout from "../../components/AdminLayout";
import CustomerProfilesPanel from "./CustomerProfilesPanel";

export default function AdminCustomerManagementPage() {
  return (
    <AdminLayout activeNav="customer-users">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
            Quản lý khách
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Hồ sơ khách kèm trạng thái tài khoản đăng nhập (khớp email/SĐT). Khóa TK ngay trên
            trang chi tiết.
          </p>
        </div>
        <CustomerProfilesPanel />
      </div>
    </AdminLayout>
  );
}
