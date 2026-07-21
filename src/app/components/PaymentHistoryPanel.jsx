"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DataTable from "@/app/components/DataTable";
import * as orderPaymentService from "@/modules/payments";
import { getErrorMessage } from "@/utils/apiError";

const {
  PAYMENT_STATUS_STYLES,
  formatPaymentAmount,
  formatPaymentDate,
  formatInstallmentType,
  formatPaymentStatus,
  listFlattenedPaymentHistory,
} = orderPaymentService;

const STATUS_FILTER_OPTIONS = Object.entries(orderPaymentService.PAYMENT_STATUS_LABELS)
  .filter(([value]) => value !== "PAID" && value !== "CANCELLED")
  .map(([value, label]) => ({ value, label }));

const TYPE_FILTER_OPTIONS = Object.entries(orderPaymentService.INSTALLMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

function StatusBadge({ status }) {
  const key = String(status ?? "").toUpperCase();
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
        PAYMENT_STATUS_STYLES[key] || "bg-surface text-muted"
      }`}
    >
      {formatPaymentStatus(status)}
    </span>
  );
}

/**
 * @param {{
 *   title?: string;
 *   description?: string;
 *   consignmentHref: (orderId: string) => string;
 * }} props
 */
export default function PaymentHistoryPanel({
  title = "Lịch sử thanh toán",
  description = "Các khoản đặt cọc / thanh toán cuối từ PayOS theo đơn ký gửi gần đây.",
  consignmentHref,
}) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const rows = await listFlattenedPaymentHistory();
        if (active) setItems(rows);
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
        key: "paidAt",
        title: "Thời gian",
        sortable: true,
        sortAccessor: (row) => row.paidAt || row.createdAt || "",
        className: "text-muted whitespace-nowrap",
        render: (row) => formatPaymentDate(row.paidAt || row.createdAt),
      },
      {
        key: "consignmentCode",
        title: "Mã đơn",
        sortable: true,
        searchable: true,
        className: "font-bold text-secondary",
        render: (row) =>
          row.orderId && consignmentHref ? (
            <Link
              href={consignmentHref(row.orderId)}
              className="hover:underline"
            >
              {row.consignmentCode || row.orderId.slice(0, 8)}
            </Link>
          ) : (
            row.consignmentCode || "—"
          ),
      },
      {
        key: "customerName",
        title: "Khách hàng",
        sortable: true,
        searchable: true,
        className: "font-medium",
        render: (row) => row.customerName || "—",
      },
      {
        key: "installmentType",
        title: "Loại",
        sortable: true,
        filter: { options: TYPE_FILTER_OPTIONS },
        className: "text-muted",
        render: (row) => formatInstallmentType(row.installmentType),
      },
      {
        key: "amount",
        title: "Số tiền",
        sortable: true,
        sortAccessor: (row) => Number(row.amount) || 0,
        className: "font-semibold text-ink text-right",
        align: "right",
        render: (row) => formatPaymentAmount(row.amount),
      },
      {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        filter: { options: STATUS_FILTER_OPTIONS },
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "paymentMethod",
        title: "PTTT",
        headerClassName: "hidden md:table-cell",
        className: "text-muted hidden md:table-cell font-mono text-xs",
        render: (row) => row.paymentMethod || "—",
      },
      {
        key: "transactionCode",
        title: "Mã GD",
        searchable: true,
        headerClassName: "hidden lg:table-cell",
        className: "text-muted hidden lg:table-cell font-mono text-xs",
        render: (row) => row.transactionCode || "—",
      },
    ],
    [consignmentHref]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">{title}</h1>
        <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted">
          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Đang tải lịch sử thanh toán...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          rowKey={(row) => row.paymentId || row.id}
          emptyText="Chưa có giao dịch thanh toán nào."
          searchPlaceholder="Tìm mã đơn, khách, mã GD..."
        />
      )}
    </div>
  );
}
