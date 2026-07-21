"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import ActionNotice from "../../components/ActionNotice";
import AdminLayout from "../../components/AdminLayout";
import LockAccountConfirmModal from "../../components/LockAccountConfirmModal";
import CreateUserModal from "./CreateUserModal";
import DataTable from "@/app/components/DataTable";
import * as userService from "@/modules/users";
import { getErrorMessage } from "@/utils/apiError";

const STATUS_FILTER_OPTIONS = [
  { value: "ACTIVE", label: "Đang hoạt động" },
  { value: "LOCKED", label: "Đã khóa" },
  { value: "PENDING_VERIFICATION", label: "Chờ xác minh" },
];

const STATUS_LABEL = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  PENDING_VERIFICATION: "Chờ xác minh",
};

const ROLE_LABEL = {
  Sale: "Sale",
  OperationsManager: "Operations",
  Warehouse: "Warehouse",
  Delivery: "Delivery",
  Admin: "Admin",
};

function isCustomerUser(user) {
  const type = String(user?.userType || "").toLowerCase();
  const role = String(user?.role || "").toLowerCase();
  return type === "customer" || role === "customer";
}

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
        setActionMessage(
          response?.message || `Đã khóa tài khoản ${user.email || user.name || ""}.`.trim()
        );
      } else if (user.status === "LOCKED") {
        const response = await userService.unlockUser(user.id);
        setUsers((current) =>
          current.map((item) =>
            item.id === user.id
              ? { ...item, status: "ACTIVE", lastSeen: "Vừa mở khóa" }
              : item
          )
        );
        setActionMessage(
          response?.message || `Đã mở khóa tài khoản ${user.email || user.name || ""}.`.trim()
        );
      }
      setConfirmUser(null);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setPendingUserId(null);
    }
  }

  const employees = useMemo(
    () => users.filter((user) => !isCustomerUser(user)),
    [users]
  );

  const stats = useMemo(() => {
    const active = employees.filter((user) => user.status === "ACTIVE").length;
    const locked = employees.filter((user) => user.status === "LOCKED").length;
    return { total: employees.length, active, locked };
  }, [employees]);

  const roleFilterOptions = useMemo(() => {
    const roles = Array.from(new Set(employees.map((user) => user.role).filter(Boolean)));
    return roles.map((role) => ({ value: role, label: ROLE_LABEL[role] || role }));
  }, [employees]);

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Nhân viên",
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
              Nhân viên nội bộ
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Tạo, khóa hoặc mở khóa tài khoản nhân viên (Sale, Operations, Warehouse, Admin).
            </p>
            {!isLoadingUsers && !loadFailed ? (
              <p className="text-sm text-muted mt-2">
                <span className="font-semibold text-ink">{stats.total}</span> nhân viên
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
            Thêm nhân viên
          </button>
        </div>

        {actionError ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <ActionNotice
                message={actionError}
                tone="danger"
                onDismiss={() => setActionError("")}
              />
            </div>
            {loadFailed ? (
              <button
                type="button"
                onClick={loadUsers}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-danger/30 text-xs font-bold text-danger hover:bg-danger/10 shrink-0"
              >
                <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
                Thử lại
              </button>
            ) : null}
          </div>
        ) : null}
        <ActionNotice
          message={actionMessage}
          tone="success"
          onDismiss={() => setActionMessage("")}
        />

        <DataTable
          columns={columns}
          rows={employees}
          loading={isLoadingUsers}
          title="Danh sách nhân viên"
          countLabel="nhân viên"
          searchPlaceholder="Tìm theo tên, email hoặc ID"
          emptyText='Chưa có nhân viên. Nhấn "Thêm nhân viên" để tạo mới.'
          emptyFilteredText="Không tìm thấy nhân viên phù hợp."
          pageSize={20}
          minWidth={960}
        />
      </div>

      <CreateUserModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        existingUsers={users}
        onCreated={(user) => {
          setUsers((current) => [user, ...current]);
          setActionMessage(
            `Đã tạo tài khoản nhân viên ${user.email || user.name || ""}.`.trim()
          );
        }}
      />

      <LockAccountConfirmModal
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
