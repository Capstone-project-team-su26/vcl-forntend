"use client";

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
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        PURCHASE_REQUEST_STATUS_STYLES[status] || "bg-surface text-muted"
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
        className: "font-mono text-xs",
        render: (row) => row.requestCode || "—",
      },
      {
        key: "customerName",
        title: "Khách hàng",
        sortable: true,
        searchable: true,
        className: "font-medium",
        render: (row) => row.customerName,
      },
      {
        key: "product",
        title: "Sản phẩm",
        searchable: true,
        searchAccessor: productText,
        className: "text-muted",
        render: (row) => productText(row) || "—",
      },
      {
        key: "createdAt",
        title: "Ngày tạo",
        sortable: true,
        sortAccessor: (row) => (row.createdAt ? new Date(row.createdAt).getTime() : 0),
        className: "text-muted whitespace-nowrap",
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
            className="inline-flex items-center justify-center p-2 rounded-lg border border-secondary/30 text-secondary hover:bg-surface-muted transition-colors"
            title="Xem chi tiết"
            aria-label="Xem chi tiết"
          >
            <Icon icon="lucide:eye" className="w-4 h-4" />
          </Link>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          Yêu cầu mua hộ
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Kiểm tra và xử lý yêu cầu mua hộ từ khách hàng. Ưu tiên{" "}
          <span className="text-warning-text font-bold">chờ xử lý</span>.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
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
