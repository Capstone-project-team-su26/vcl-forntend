"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

type RoleFilter = "all" | "admin" | "editor" | "viewer";

const users = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@swiftship.vn",
    role: "EDITOR" as const,
    status: "ACTIVE" as const,
    lastSeen: "2 phút trước",
    avatar: "NA",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@swiftship.vn",
    role: "ADMIN" as const,
    status: "ACTIVE" as const,
    lastSeen: "Đang online",
    avatar: "TB",
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    email: "cuong.le@swiftship.vn",
    role: "VIEWER" as const,
    status: "OFFLINE" as const,
    lastSeen: "1 giờ trước",
    avatar: "LC",
  },
  {
    id: 4,
    name: "Phạm Minh Đức",
    email: "duc.pham@swiftship.vn",
    role: "EDITOR" as const,
    status: "ACTIVE" as const,
    lastSeen: "15 phút trước",
    avatar: "PD",
  },
  {
    id: 5,
    name: "Hoàng Thị Em",
    email: "em.hoang@swiftship.vn",
    role: "VIEWER" as const,
    status: "OFFLINE" as const,
    lastSeen: "3 giờ trước",
    avatar: "HE",
  },
];

const roleFilters: { id: RoleFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "admin", label: "Quản trị viên (Admin)" },
  { id: "editor", label: "Biên tập viên (Editor)" },
  { id: "viewer", label: "Người xem (Viewer)" },
];

function RoleBadge({ role }: { role: "ADMIN" | "EDITOR" | "VIEWER" }) {
  const styles = {
    ADMIN: "bg-insight text-white",
    EDITOR: "bg-info-bg text-info-text",
    VIEWER: "bg-accent text-insight",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-md text-[11px] font-bold tracking-wide ${styles[role]}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: "ACTIVE" | "OFFLINE" }) {
  const styles = {
    ACTIVE: "bg-success-bg text-success-text",
    OFFLINE: "bg-surface-muted text-muted",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function UserManagementPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const filteredUsers = users.filter((user) => {
    if (roleFilter === "all") return true;
    if (roleFilter === "admin") return user.role === "ADMIN";
    if (roleFilter === "editor") return user.role === "EDITOR";
    return user.role === "VIEWER";
  });

  return (
    <AdminLayout activeNav="users">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-ink tracking-tight">Quản lý người dùng</h1>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Quản lý tài khoản, phân quyền và theo dõi hoạt động người dùng trong hệ thống logistics.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:user-plus" className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-3 bg-white rounded-xl border border-border-muted p-5 shadow-sm">
            <p className="text-xs font-semibold text-faint uppercase tracking-wider mb-1">Tổng người dùng</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-ink">1,284</span>
              <span className="text-sm font-bold text-success mb-1">+12%</span>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-xl border border-border-muted p-5 shadow-sm">
            <p className="text-[10px] font-bold text-faint uppercase tracking-[0.14em] mb-3">Bộ lọc nhanh</p>
            <div className="flex flex-wrap gap-2">
              {roleFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setRoleFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    roleFilter === filter.id
                      ? "bg-insight text-white"
                      : "bg-surface text-muted hover:bg-surface-muted"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl border border-border-muted p-5 shadow-sm flex items-center justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-insight transition-colors"
            >
              <Icon icon="lucide:sliders-horizontal" className="w-4 h-4" />
              Tùy chỉnh nâng cao
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b border-border-muted bg-surface">
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">Người dùng</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">Lần cuối</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center text-xs font-bold text-insight shrink-0">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{user.lastSeen}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
                        aria-label="Tùy chọn"
                      >
                        <Icon icon="lucide:more-horizontal" className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border-muted text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-insight transition-colors"
            >
              <Icon icon="lucide:mail" className="w-4 h-4" />
              Mời thêm thành viên (1 đang chờ)
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="fixed bottom-6 right-6 w-14 h-14 bg-insight hover:bg-secondary text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
        aria-label="Thêm nhanh"
      >
        <Icon icon="lucide:plus" className="w-6 h-6" />
      </button>
    </AdminLayout>
  );
}
