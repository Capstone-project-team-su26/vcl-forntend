"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import CreateUserModal from "./CreateUserModal";
import * as userService from "@/shared/services/userService";
import { getErrorMessage } from "@/shared/utils/apiError";

type UserStatus = "ACTIVE" | "LOCKED";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastSeen: string;
  avatar: string;
};

const initialUsers: ManagedUser[] = [];

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold tracking-wide bg-info-bg text-info-text">
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const styles = {
    ACTIVE: "bg-success-bg text-success-text",
    LOCKED: "bg-danger/10 text-danger",
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${styles[status]}`}>
      {status === "ACTIVE" ? "ACTIVE" : "LOCKED"}
    </span>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  async function handleLockToggle(user: ManagedUser) {
    setActionError("");
    setActionMessage("");
    setPendingUserId(user.id);
    setOpenMenuId(null);

    try {
      if (user.status === "ACTIVE") {
        const response = await userService.lockUser(user.id);
        setUsers((current) =>
          current.map((item) =>
            item.id === user.id ? { ...item, status: "LOCKED", lastSeen: "Đã khóa" } : item
          )
        );
        setActionMessage(response?.message || "Khóa tài khoản thành công.");
      } else {
        const response = await userService.unlockUser(user.id);
        setUsers((current) =>
          current.map((item) =>
            item.id === user.id ? { ...item, status: "ACTIVE", lastSeen: "Vừa mở khóa" } : item
          )
        );
        setActionMessage(response?.message || "Mở khóa tài khoản thành công.");
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingUserId(null);
    }
  }

  return (
    <AdminLayout activeNav="users">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-ink tracking-tight">Quản lý người dùng</h1>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Tạo nhân viên và khóa/mở khóa tài khoản qua API backend. Backend chưa có API danh sách người dùng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:user-plus" className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>

        {actionError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {actionError}
          </div>
        ) : null}

        {actionMessage ? (
          <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
            {actionMessage}
          </div>
        ) : null}

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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted">
                      Chưa có người dùng trong phiên này. Nhấn &quot;Thêm người dùng&quot; để tạo nhân viên mới.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center text-xs font-bold text-insight shrink-0">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink">{user.name}</p>
                            <p className="text-xs text-muted">{user.email}</p>
                            <p className="text-[10px] text-faint mt-0.5">{user.id}</p>
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
                      <td className="px-6 py-4 text-right relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId((current) => (current === user.id ? null : user.id))}
                          className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
                          aria-label="Tùy chọn"
                        >
                          <Icon icon="lucide:more-horizontal" className="w-5 h-5" />
                        </button>

                        {openMenuId === user.id ? (
                          <div className="absolute right-6 top-12 z-20 w-44 rounded-xl border border-border-muted bg-white shadow-lg py-2 text-left">
                            <button
                              type="button"
                              disabled={pendingUserId === user.id}
                              onClick={() => handleLockToggle(user)}
                              className="w-full px-4 py-2.5 text-sm font-semibold text-left hover:bg-surface disabled:opacity-50"
                            >
                              {pendingUserId === user.id
                                ? "Đang xử lý..."
                                : user.status === "ACTIVE"
                                  ? "Khóa tài khoản"
                                  : "Mở khóa tài khoản"}
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateUserModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(user) => {
          setUsers((current) => [user, ...current]);
          setActionMessage("Tạo tài khoản nhân viên thành công.");
        }}
      />
    </AdminLayout>
  );
}
