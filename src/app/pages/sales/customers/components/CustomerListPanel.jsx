"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CustomerFormModal from "@/app/pages/sales/customers/components/CustomerFormModal";
import DataTable from "@/app/components/DataTable";
import * as customerService from "@/utils/customerService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_STYLES, buildCreateConsignmentUrl } =
  customerService;

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

export default function CustomerListPanel() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
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
        const data = await customerService.listCustomers();
        if (active) setCustomers(data);
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
    router.push(ROUTES.sales.customer(customer.id));
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
        key: "address",
        title: "Địa chỉ",
        headerClassName: "hidden lg:table-cell",
        className: "text-muted hidden lg:table-cell max-w-xs truncate",
        render: (row) => row.address || "—",
      },
      {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        filter: { options: STATUS_FILTER_OPTIONS },
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "actions",
        title: "Thao tác",
        align: "right",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Link
              href={buildCreateConsignmentUrl(row.id)}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg"
              title="Tạo ký gửi thay khách"
            >
              <Icon icon="lucide:package-plus" className="w-4 h-4" />
            </Link>
            <Link
              href={buildCreateConsignmentUrl(row.id, "PURCHASE_ORDER")}
              className="p-2 text-secondary hover:bg-secondary/10 rounded-lg"
              title="Mua hộ thay khách"
            >
              <Icon icon="lucide:shopping-cart" className="w-4 h-4" />
            </Link>
            <Link
              href={ROUTES.sales.customer(row.id)}
              className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg"
              title="Xem chi tiết / chỉnh sửa"
            >
              <Icon icon="lucide:eye" className="w-4 h-4" />
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
            Hồ sơ khách hàng
          </h1>
          <p className="text-muted text-sm font-medium mt-2">
            Tìm kiếm, tạo mới và quản lý thông tin khách để phục vụ ký gửi hoặc mua hộ thay khách.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalMode("create")}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shrink-0"
        >
          <Icon icon="lucide:user-plus" className="w-4 h-4" />
          Thêm khách hàng
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
          {successMessage}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={customers}
        loading={isLoading}
        title="Danh sách khách hàng"
        countLabel="khách hàng"
        searchPlaceholder="Tìm theo mã, tên, SĐT hoặc email..."
        emptyText="Chưa có khách hàng nào."
        emptyFilteredText="Không tìm thấy khách hàng phù hợp."
        minWidth={960}
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
