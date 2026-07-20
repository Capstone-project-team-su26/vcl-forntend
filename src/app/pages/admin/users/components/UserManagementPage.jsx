"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import CreateUserModal from "./CreateUserModal";
import DataTable from "@/app/components/DataTable";
import * as userService from "@/modules/users";
import { getErrorMessage } from "@/utils/apiError";

const STATUS_FILTER_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "LOCKED", label: "Đã khóa" },
  { value: "PENDING_VERIFICATION", label: "Chờ xác minh" },
];

const USER_TYPE_FILTER_OPTIONS = [
  { value: "Employee", label: "Nhân viên" },
  { value: "Customer", label: "Khách hàng" },
];

const STATUS_LABEL = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  PENDING_VERIFICATION: "Chờ xác minh",
};

const USER_TYPE_LABEL = {
  Employee: "Nhân viên",
  Customer: "Khách hàng",
};

const ROLE_LABEL = {
  Sale: "Sale",
  OperationsManager: "Operations",
  Warehouse: "Warehouse",
  Delivery: "Delivery",
  Admin: "Admin",
  Customer: "Customer",
};

function RoleBadge({ role, region }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide bg-info-bg text-info-text">
        {ROLE_LABEL[role] || role}
      </span>
      {region ? (
        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-surface text-muted">
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
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        styles[status] || "bg-surface text-muted"
      }`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function LockConfirmModal({ user, pending, onConfirm, onClose }) {
  if (!user) return null;
  const isLocking = user.status === "ACTIVE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={pending ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-confirm-title"
        className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-xl p-5"
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isLocking ? "bg-danger/10 text-danger" : "bg-success-bg text-success-text"
            }`}
          >
            <Icon icon={isLocking ? "lucide:lock" : "lucide:lock-open"} className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h2 id="lock-confirm-title" className="text-base font-bold text-ink">
              {isLocking ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              {isLocking
                ? "Người dùng sẽ không đăng nhập được cho đến khi được mở khóa."
                : "Người dùng sẽ có thể đăng nhập lại bình thường."}
            </p>
            <div className="mt-3 rounded-lg border border-border-muted bg-surface px-3 py-2.5">
              <p className="text-sm font-semibold text-ink leading-snug">{user.name}</p>
              <p className="text-sm text-muted leading-snug mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border-muted text-sm font-semibold text-muted hover:text-ink hover:bg-surface-muted disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-bold text-white disabled:opacity-50 ${
              isLocking ? "bg-danger hover:opacity-90" : "bg-insight hover:bg-secondary"
            }`}
          >
            {pending ? (
              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
            ) : (
              <Icon icon={isLocking ? "lucide:lock" : "lucide:lock-open"} className="w-4 h-4" />
            )}
            {pending ? "Đang xử lý..." : isLocking ? "Khóa tài khoản" : "Mở khóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let active = true;
    userService
      .listUsers()
      .then((data) => {
        if (!active) return;
        setUsers(data);
        setIsLoadingUsers(false);
      })
      .catch((error) => {
        if (!active) return;
        setActionError(getErrorMessage(error));
        setLoadFailed(true);
        setIsLoadingUsers(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function loadUsers() {
    setIsLoadingUsers(true);
    setActionError("");
    setLoadFailed(false);
    try {
      const data = await userService.listUsers();
      setUsers(data);
    } catch (error) {
      setActionError(getErrorMessage(error));
      setLoadFailed(true);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleLockToggle() {
    const user = confirmUser;
    if (!user) return;

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
      setConfirmUser(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingUserId(null);
    }
  }

  const stats = useMemo(() => {
    const active = users.filter((user) => user.status === "ACTIVE").length;
    const locked = users.filter((user) => user.status === "LOCKED").length;
    return { total: users.length, active, locked };
  }, [users]);

  const roleFilterOptions = useMemo(() => {
    const roles = Array.from(new Set(users.map((user) => user.role).filter(Boolean)));
    return roles.map((role) => ({ value: role, label: ROLE_LABEL[role] || role }));
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
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-insight shrink-0">
              {user.avatar}
            </div>
            <div className="min-w-0 leading-snug">
              <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
              <p className="text-[13px] text-muted truncate">{user.email}</p>
              <p className="text-[11px] text-muted/80 mt-0.5 font-mono truncate">
                {user.phone || user.id || "—"}
              </p>
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
          <span className="text-xs font-semibold text-muted">
            {USER_TYPE_LABEL[user.userType] || user.userType || "—"}
          </span>
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
        sortable: true,
        render: (user) => user.lastSeen,
      },
      {
        key: "actions",
        title: "Hành động",
        align: "right",
        render: (user) => {
          const canToggleLock = user.status === "ACTIVE" || user.status === "LOCKED";
          if (!canToggleLock) {
            return <span className="text-xs text-muted/60">—</span>;
          }
          const isLock = user.status === "ACTIVE";
          return (
            <button
              type="button"
              disabled={pendingUserId === user.id}
              onClick={(event) => {
                event.stopPropagation();
                setConfirmUser(user);
              }}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border-muted text-muted hover:text-ink hover:bg-surface-muted hover:border-border transition-colors disabled:opacity-50 group"
              title={isLock ? "Khóa tài khoản" : "Mở khóa tài khoản"}
              aria-label={isLock ? "Khóa tài khoản" : "Mở khóa tài khoản"}
            >
              <Icon
                icon={
                  pendingUserId === user.id
                    ? "lucide:loader-2"
                    : isLock
                      ? "lucide:lock"
                      : "lucide:lock-open"
                }
                className={`w-4 h-4 ${pendingUserId === user.id ? "animate-spin" : ""} ${
                  isLock ? "group-hover:text-danger" : "group-hover:text-success-text"
                }`}
              />
            </button>
          );
        },
      },
    ],
    [roleFilterOptions, pendingUserId]
  );

  return (
    <AdminLayout activeNav="users">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Quản lý người dùng
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Tạo, khóa hoặc mở khóa tài khoản người dùng.
            </p>
            {!isLoadingUsers && !loadFailed ? (
              <p className="text-sm text-muted mt-2">
                <span className="font-semibold text-ink">{stats.total}</span> người dùng
                <span className="mx-1.5 text-border">·</span>
                <span className="font-semibold text-success-text">{stats.active}</span> đang hoạt
                động
                <span className="mx-1.5 text-border">·</span>
                <span className="font-semibold text-danger">{stats.locked}</span> đã khóa
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:user-plus" className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>

        {actionError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span>{actionError}</span>
            {loadFailed ? (
              <button
                type="button"
                onClick={loadUsers}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-danger/30 text-xs font-bold hover:bg-danger/10 shrink-0"
              >
                <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
                Thử lại
              </button>
            ) : null}
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
          searchPlaceholder="Tìm theo tên, email hoặc ID"
          emptyText='Chưa có người dùng. Nhấn "Thêm người dùng" để tạo mới.'
          emptyFilteredText="Không tìm thấy người dùng phù hợp."
          pageSize={20}
          minWidth={960}
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

      <LockConfirmModal
        user={confirmUser}
        pending={Boolean(confirmUser && pendingUserId === confirmUser.id)}
        onConfirm={handleLockToggle}
        onClose={() => {
          if (!pendingUserId) setConfirmUser(null);
        }}
      />
    </AdminLayout>
  );
}
