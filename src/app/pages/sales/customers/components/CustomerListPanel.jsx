"use client";
import styles from "./CustomerListPanel.module.scss";

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
      className={`${styles.t5f03d3}  ${
        CUSTOMER_STATUS_STYLES[status] || "status-badge--surface"
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
        className: styles.tf05d22,
        render: (row) => row.customerCode || "—",
      },
      {
        key: "fullName",
        title: "Họ tên",
        sortable: true,
        searchable: true,
        className: styles.t1d3e56,
        render: (row) => row.fullName,
      },
      {
        key: "phone",
        title: "Điện thoại",
        searchable: true,
        className: styles.t9a12f0,
        render: (row) => row.phone || "—",
      },
      {
        key: "email",
        title: "Email",
        searchable: true,
        className: styles.t9a12f0,
        render: (row) => row.email || "—",
      },
      {
        key: "address",
        title: "Địa chỉ",
        headerClassName: "hidden lg:table-cell",
        className: styles.te38c30,
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
          <div className={styles.t0bd0c1}>
            <Link
              href={buildCreateConsignmentUrl(row.id)}
              className={styles.t2e9506}
              title="Tạo ký gửi thay khách"
            >
              <Icon icon="lucide:package-plus" className={styles.t0bfbea} />
            </Link>
            <Link
              href={buildCreateConsignmentUrl(row.id, "PURCHASE_ORDER")}
              className={styles.t3963f0}
              title="Mua hộ thay khách"
            >
              <Icon icon="lucide:shopping-cart" className={styles.t0bfbea} />
            </Link>
            <Link
              href={ROUTES.sales.customer(row.id)}
              className={styles.t540c9f}
              title="Xem chi tiết / chỉnh sửa"
            >
              <Icon icon="lucide:eye" className={styles.t0bfbea} />
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className={styles.t793f9e}>
      <div className={styles.tbccecd}>
        <div>
          <h1 className={styles.t4d16e2}>
            Hồ sơ khách hàng
          </h1>
          <p className={styles.t466889}>
            Tìm kiếm, tạo mới và quản lý thông tin khách để phục vụ ký gửi hoặc mua hộ thay khách.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalMode("create")}
          className={styles.t17259a}
        >
          <Icon icon="lucide:user-plus" className={styles.t0bfbea} />
          Thêm khách hàng
        </button>
      </div>

      {error ? (
        <div className={styles.te12bff}>
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className={styles.te918f5}>
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
