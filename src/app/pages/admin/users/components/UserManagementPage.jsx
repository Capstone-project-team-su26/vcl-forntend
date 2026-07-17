"use client";
import styles from "./UserManagementPage.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import CreateUserModal from "./CreateUserModal";
import DataTable from "@/app/components/DataTable";
import * as userService from "@/utils/userService";
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
    <span className={styles.t530417}>
      <span className={styles.t76168a}>
        {ROLE_LABEL[role] || role}
      </span>
      {region ? (
        <span className={styles.t5d15d9}>
          {region}
        </span>
      ) : null}
    </span>
  );
}

function StatusBadge({ status }) {
  const statusTone = {
    ACTIVE: styles.badgeRoleActive,
    LOCKED: styles.badgeRoleLocked,
    PENDING_VERIFICATION: styles.badgeRolePending,
  };
  return (
    <span className={`${styles.badgePillSm} ${statusTone[status] || styles.badgeDefault}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function LockConfirmModal({ user, pending, onConfirm, onClose }) {
  if (!user) return null;
  const isLocking = user.status === "ACTIVE";

  return (
    <div className={styles.ta73cc4}>
      <button
        type="button"
        className={styles.tf04169}
        aria-label="Đóng"
        onClick={pending ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-confirm-title"
        className={styles.t2d11b1}
      >
        <div className={styles.t6d820b}>
          <span
            className={`${styles.lockIconWrap} ${
              isLocking ? styles.lockIconDanger : styles.lockIconSuccess
            }`}
          >
            <Icon icon={isLocking ? "lucide:lock" : "lucide:lock-open"} className={styles.ta8600f} />
          </span>
          <div className={styles.t7e0b7c}>
            <h2 id="lock-confirm-title" className={styles.t3c6280}>
              {isLocking ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </h2>
            <p className={styles.subtitle}>
              {isLocking
                ? "Người dùng sẽ không đăng nhập được cho đến khi được mở khóa."
                : "Người dùng sẽ có thể đăng nhập lại bình thường."}
            </p>
            <div className={styles.tc4c2f1}>
              <p className={styles.ta79ef9}>{user.name}</p>
              <p className={styles.tfa9029}>{user.email}</p>
            </div>
          </div>
        </div>

        <div className={styles.t7bc699}>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className={styles.tf4b34a}
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`${styles.lockConfirmBtn} ${
              isLocking ? styles.lockConfirmDanger : styles.lockConfirmInsight
            }`}
          >
            {pending ? (
              <Icon icon="lucide:loader-2" className={styles.tc11061} />
            ) : (
              <Icon icon={isLocking ? "lucide:lock" : "lucide:lock-open"} className={styles.actionIcon} />
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
          <div className={styles.tf86553}>
            <div className={styles.tea948e}>
              {user.avatar}
            </div>
            <div className={styles.t37b310}>
              <p className={styles.tc3190b}>{user.name}</p>
              <p className={styles.t76bb9b}>{user.email}</p>
              <p className={styles.te67c74}>
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
          <span className={styles.t74e489}>
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
        className: styles.t9a12f0,
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
            return <span className={styles.ta8ef7e}>—</span>;
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
              className={styles.ta761ef}
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
                className={`${styles.actionIcon} ${
                  pendingUserId === user.id ? styles.spinIcon : ""
                } ${isLock ? styles.lockHoverDanger : styles.lockHoverSuccess}`}
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
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>
              Quản lý người dùng
            </h1>
            <p className={styles.subtitle}>
              Tạo, khóa hoặc mở khóa tài khoản người dùng.
            </p>
            {!isLoadingUsers && !loadFailed ? (
              <p className={styles.td54f5b}>
                <span className={styles.cellNameSemibold}>{stats.total}</span> người dùng
                <span className={styles.tf28710}>·</span>
                <span className={styles.t0ce2a6}>{stats.active}</span> đang hoạt
                động
                <span className={styles.tf28710}>·</span>
                <span className={styles.t72efc0}>{stats.locked}</span> đã khóa
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className={styles.addBtn}
          >
            <Icon icon="lucide:user-plus" className={styles.actionIcon} />
            Thêm người dùng
          </button>
        </div>

        {actionError ? (
          <div className={styles.te71bc1}>
            <span>{actionError}</span>
            {loadFailed ? (
              <button
                type="button"
                onClick={loadUsers}
                className={styles.t8ced62}
              >
                <Icon icon="lucide:refresh-cw" className={styles.tb41c1b} />
                Thử lại
              </button>
            ) : null}
          </div>
        ) : null}
        {actionMessage ? (
          <div className={styles.alertSuccess}>
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
