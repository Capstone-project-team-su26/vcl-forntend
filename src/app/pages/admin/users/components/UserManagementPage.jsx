"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import CreateUserModal from "./CreateUserModal";
import DataTable from "@/app/components/DataTable";
import * as userService from "@/utils/userService";
import { getErrorMessage } from "@/utils/apiError";

const STATUS_FILTER_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "LOCKED", label: "LOCKED" },
  { value: "PENDING_VERIFICATION", label: "PENDING" },
];

const USER_TYPE_FILTER_OPTIONS = [
  { value: "Employee", label: "Employee" },
  { value: "Customer", label: "Customer" },
];

const STATUS_LABEL = {
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  PENDING_VERIFICATION: "PENDING",
};

function RoleBadge({ role, region }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold tracking-wide bg-info-bg text-info-text">
        {role}
      </span>
      {region ? (
        <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold tracking-wide bg-surface text-muted">
          {region}
        </span>
      ) : null}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-success-bg text-success-text",
    LOCKED: "bg-danger/10 text-danger",
    PENDING_VERIFICATION: "bg-warning-bg text-warning-text",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        styles[status] || "bg-surface text-muted"
      }`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    let active = true;
    userService
      .listUsers()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((error) => {
        if (active) setActionError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsLoadingUsers(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleLockToggle(user) {
    setActionError("");
    setActionMessage("");
    setPendingUserId(user.id);
    try {
      if (user.status === "ACTIVE") {
        const response = await userService.lockUser(user.id);
        setUsers((current) =>
          current.map((item) =>
            item.id === user.id
              ? { ...item, status: "LOCKED", lastSeen: "Đã khóa" }
              : item
          )
        );
        setActionMessage(response?.message || "Khóa tài khoản thành công.");
      } else if (user.status === "LOCKED") {
        const response = await userService.unlockUser(user.id);
        setUsers((current) =>
          current.map((item) =>
            item.id === user.id
              ? { ...item, status: "ACTIVE", lastSeen: "Vừa mở khóa" }
              : item
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

  const roleFilterOptions = useMemo(() => {
    const roles = Array.from(new Set(users.map((user) => user.role).filter(Boolean)));
    return roles.map((role) => ({ value: role, label: role }));
  }, [users]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Người dùng",
        sortable: true,
        searchable: true,
        searchAccessor: (user) =>
          `${user.name || ""} ${user.email || ""} ${user.phone || ""} ${user.id || ""}`,
        render: (user) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/25 flex items-center justify-center text-xs font-bold text-insight shrink-0">
              {user.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
              <p className="text-[10px] text-faint mt-0.5">{user.phone || "—"}</p>
            </div>
          </div>
        ),
      },
      {
        key: "userType",
        title: "Loại",
        sortable: true,
        filter: { options: USER_TYPE_FILTER_OPTIONS },
        render: (user) => (
          <span className="text-xs font-semibold text-muted">{user.userType || "—"}</span>
        ),
      },
      {
        key: "role",
        title: "Vai trò",
        sortable: true,
        filter: roleFilterOptions.length ? { options: roleFilterOptions } : undefined,
        render: (user) => <RoleBadge role={user.role} region={user.region} />,
      },
      {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        filter: { options: STATUS_FILTER_OPTIONS },
        render: (user) => <StatusBadge status={user.status} />,
      },
      {
        key: "lastSeen",
        title: "Ngày tạo",
        className: "text-muted",
        render: (user) => user.lastSeen,
      },
      {
        key: "actions",
        title: "Hành động",
        align: "right",
        render: (user) => {
          const canToggleLock = user.status === "ACTIVE" || user.status === "LOCKED";
          if (!canToggleLock) {
            return <span className="text-xs text-faint">—</span>;
          }
          return (
            <button
              type="button"
              disabled={pendingUserId === user.id}
              onClick={() => handleLockToggle(user)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                user.status === "ACTIVE"
                  ? "border-2 border-danger-border bg-danger-bg text-danger hover:bg-danger-hover-bg"
                  : "text-success-text hover:bg-success-bg"
              }`}
            >
              <Icon
                icon={
                  pendingUserId === user.id
                    ? "lucide:loader-2"
                    : user.status === "ACTIVE"
                      ? "lucide:lock"
                      : "lucide:lock-open"
                }
                className={`w-4 h-4 ${pendingUserId === user.id ? "animate-spin" : ""}`}
              />
              {pendingUserId === user.id
                ? "Đang xử lý..."
                : user.status === "ACTIVE"
                  ? "Khóa"
                  : "Mở khóa"}
            </button>
          );
        },
      },
    ],
    [roleFilterOptions, pendingUserId]
  );

  return (
    <AdminLayout activeNav="users">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-ink tracking-tight">
              Quản lý người dùng
            </h1>
            <p className="text-sm text-muted mt-1 max-w-xl">
              Tạo nhân viên (kèm region cho Warehouse), lọc theo loại/vai trò, và khóa/mở khóa
              tài khoản.
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

        <DataTable
          columns={columns}
          rows={users}
          loading={isLoadingUsers}
          title="Danh sách người dùng"
          countLabel="người dùng"
          searchPlaceholder="Tìm theo tên, email, SĐT hoặc ID..."
          emptyText='Chưa có người dùng. Nhấn "Thêm người dùng" để tạo nhân viên mới.'
          emptyFilteredText="Không tìm thấy người dùng phù hợp."
          minWidth={900}
        />
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
