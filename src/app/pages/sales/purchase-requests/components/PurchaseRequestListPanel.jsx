"use client";
import styles from "./PurchaseRequestListPanel.module.scss";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DataTable from "@/app/components/DataTable";
import * as purchaseRequestService from "@/utils/purchaseRequestService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_STYLES,
  formatPurchaseRequestDate,
} = purchaseRequestService;

const STATUS_FILTER_OPTIONS = Object.entries(PURCHASE_REQUEST_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

function StatusBadge({ status }) {
  return (
    <span
      className={`${styles.t5f03d3}  ${
        PURCHASE_REQUEST_STATUS_STYLES[status] || "status-badge--surface"
      }`}
    >
      {PURCHASE_REQUEST_STATUS_LABELS[status] || status}
    </span>
  );
}

function productText(item) {
  const first = item.items?.[0]?.productName || "";
  const extra = item.items?.length > 1 ? ` (+${item.items.length - 1})` : "";
  return `${first}${extra}`;
}

export default function PurchaseRequestListPanel() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const data = await purchaseRequestService.listPurchaseRequests();
        if (active) setItems(data);
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

  const columns = useMemo(
    () => [
      {
        key: "requestCode",
        title: "Mã YC",
        sortable: true,
        searchable: true,
        className: styles.tf05d22,
        render: (row) => row.requestCode || "—",
      },
      {
        key: "customerName",
        title: "Khách hàng",
        sortable: true,
        searchable: true,
        className: styles.t2689f3,
        render: (row) => row.customerName,
      },
      {
        key: "product",
        title: "Sản phẩm",
        searchable: true,
        searchAccessor: productText,
        className: styles.t9a12f0,
        render: (row) => productText(row) || "—",
      },
      {
        key: "createdAt",
        title: "Ngày tạo",
        sortable: true,
        sortAccessor: (row) => (row.createdAt ? new Date(row.createdAt).getTime() : 0),
        className: styles.t39910d,
        render: (row) => formatPurchaseRequestDate(row.createdAt),
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
        title: "Chi tiết",
        align: "right",
        render: (row) => (
          <Link
            href={ROUTES.sales.purchaseRequest(row.id)}
            className={styles.t96e45c}
            title="Xem chi tiết"
            aria-label="Xem chi tiết"
          >
            <Icon icon="lucide:eye" className={styles.t0bfbea} />
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className={styles.t793f9e}>
      <div>
        <h1 className={styles.t4d16e2}>
          Yêu cầu mua hộ
        </h1>
        <p className={styles.t466889}>
          Kiểm tra và xử lý yêu cầu mua hộ từ khách hàng. Ưu tiên{" "}
          <span className={styles.t17c73d}>chờ xử lý</span>.
        </p>
      </div>

      {error ? (
        <div className={styles.te12bff}>
          {error}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={items}
        loading={isLoading}
        title="Danh sách yêu cầu"
        countLabel="yêu cầu"
        searchPlaceholder="Tìm theo mã, khách hàng hoặc sản phẩm..."
        emptyText="Chưa có yêu cầu mua hộ nào."
        emptyFilteredText="Không có yêu cầu mua hộ phù hợp."
      />
    </div>
  );
}
