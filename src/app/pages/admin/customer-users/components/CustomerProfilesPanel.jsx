"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ActionNotice from "../../components/ActionNotice";
import CustomerFormModal from "./CustomerFormModal";
import DataTable from "@/app/components/DataTable";
import * as customerService from "@/modules/customers";
import * as userService from "@/modules/users";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_STYLES } = customerService;

const ACCOUNT_STATUS_LABEL = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  PENDING_VERIFICATION: "Chờ xác minh",
};

const STATUS_FILTER_OPTIONS = Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        CUSTOMER_STATUS_STYLES[status] || "bg-surface text-muted"
      }`}
    >
      {CUSTOMER_STATUS_LABELS[status] || status}
    </span>
  );
}

function AccountLinkBadge({ link }) {
  if (!link?.user) {
    return <span className="text-xs text-muted">Chưa có TK</span>;
  }
  const status = link.user.status;
  const tone =
    status === "LOCKED"
      ? "bg-danger/10 text-danger"
      : status === "PENDING_VERIFICATION"
        ? "bg-warning-bg text-warning-text"
        : "bg-success-bg text-success-text";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${tone}`}>
      {ACCOUNT_STATUS_LABEL[status] || status}
    </span>
  );
}

export default function CustomerProfilesPanel() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const [customerData, userData] = await Promise.all([
          customerService.listCustomers(),
          userService.listUsers(),
        ]);
        if (!active) return;
        setCustomers(customerData);
        setUsers(userData);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  function handleCreated(customer, message) {
    setCustomers((current) => [customer, ...current]);
    setSuccessMessage(message);
    setError("");
    router.push(ROUTES.admin.customerProfile(customer.id));
  }

  const columns = useMemo(
    () => [
      {
        key: "customerCode",
        title: "Mã KH",
        sortable: true,
        searchable: true,
        className: "font-mono text-xs",
        render: (row) => row.customerCode || "—",
      },
      {
        key: "fullName",
        title: "Họ tên",
        sortable: true,
        searchable: true,
        className: "font-semibold text-ink",
        render: (row) => row.fullName,
      },
      {
        key: "phone",
        title: "Điện thoại",
        searchable: true,
        className: "text-muted",
        render: (row) => row.phone || "—",
      },
      {
        key: "email",
        title: "Email",
        searchable: true,
        className: "text-muted",
        render: (row) => row.email || "—",
      },
      {
        key: "account",
        title: "Tài khoản",
        sortable: true,
        sortAccessor: (row) =>
          customerService.findLinkedCustomerAccount(row, users)?.user?.status || "NONE",
        filter: {
          options: [
            { value: "ACTIVE", label: "TK hoạt động" },
            { value: "LOCKED", label: "TK đã khóa" },
            { value: "PENDING_VERIFICATION", label: "TK chờ xác minh" },
            { value: "NONE", label: "Chưa có TK" },
          ],
        },
        filterAccessor: (row) =>
          customerService.findLinkedCustomerAccount(row, users)?.user?.status || "NONE",
        render: (row) => (
          <AccountLinkBadge link={customerService.findLinkedCustomerAccount(row, users)} />
        ),
      },
      {
        key: "status",
        title: "Hồ sơ",
        sortable: true,
        filter: { options: STATUS_FILTER_OPTIONS },
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        title: "Thao tác",
        align: "right",
        render: (row) => (
          <Link
            href={ROUTES.admin.customerProfile(row.id)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border-muted text-muted hover:text-ink hover:bg-surface-muted"
            title="Xem hồ sơ & tài khoản"
            aria-label="Xem hồ sơ & tài khoản"
          >
            <Icon icon="lucide:eye" className="w-4 h-4" />
          </Link>
        ),
      },
    ],
    [users]
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModalMode("create")}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
        >
          <Icon icon="lucide:user-plus" className="w-4 h-4" />
          Thêm hồ sơ
        </button>
      </div>

      <ActionNotice message={error} tone="danger" onDismiss={() => setError("")} />
      <ActionNotice
        message={successMessage}
        tone="success"
        onDismiss={() => setSuccessMessage("")}
      />

      <DataTable
        columns={columns}
        rows={customers}
        loading={isLoading}
        title="Danh sách hồ sơ khách"
        countLabel="hồ sơ"
        searchPlaceholder="Tìm theo mã, tên, SĐT hoặc email..."
        emptyText="Chưa có hồ sơ khách nào."
        emptyFilteredText="Không tìm thấy hồ sơ phù hợp."
        minWidth={1020}
      />

      <CustomerFormModal
        open={modalMode === "create"}
        mode="create"
        customer={null}
        onClose={() => setModalMode(null)}
        onSaved={handleCreated}
      />
    </div>
  );
}
