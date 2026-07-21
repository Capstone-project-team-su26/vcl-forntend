"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/modules/customers";
import * as purchaseOrderService from "@/modules/purchase-orders";
import { useToast } from "@/app/components/ToastProvider";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_STYLES,
  getAllowedNextPurchaseOrderStatuses,
  canUpdatePurchaseOrderStatus,
  isWaitingWarehouseReceive,
  formatPurchaseOrderDate,
} = purchaseOrderService;

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${
        PURCHASE_ORDER_STATUS_STYLES[status] || "bg-surface text-muted"
      }`}
    >
      {PURCHASE_ORDER_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function PurchaseOrderStatusPanel({
  id,
  backHref,
}) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nextStatus, setNextStatus] = useState("");
  const [processingNote, setProcessingNote] = useState("");

  const allowedStatuses = useMemo(
    () => (detail ? getAllowedNextPurchaseOrderStatuses(detail.status) : []),
    [detail]
  );

  const canUpdate = detail ? canUpdatePurchaseOrderStatus(detail.status) : false;

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await purchaseOrderService.getPurchaseOrder(id);
        if (!active) return;

        setDetail(data);
        setProcessingNote(data.processingNote ?? "");
        setNextStatus(getAllowedNextPurchaseOrderStatuses(data.status)[0] ?? "");

        if (data.customerId) {
          try {
            const customerData = await customerService.getCustomer(data.customerId);
            if (active) setCustomer(customerData);
          } catch {
            if (active) setCustomer(null);
          }
        }
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!detail || !canUpdate || isSubmitting || !nextStatus) return;

    setIsSubmitting(true);

    try {
      const response = await purchaseOrderService.updatePurchaseOrderStatus(detail.id, {
        status: nextStatus,
        processingNote,
      });

      const updated = response.purchaseOrder;
      if (updated) {
        setDetail(updated);
        setProcessingNote(updated.processingNote ?? "");
        setNextStatus(getAllowedNextPurchaseOrderStatuses(updated.status)[0] ?? "");
      } else {
        setDetail((current) =>
          current
            ? {
                ...current,
                status: response.status ?? nextStatus,
                processingNote: response.processingNote ?? processingNote,
              }
            : current
        );
        setNextStatus("");
      }

      toast.success(
        `${response.message || "Cập nhật trạng thái mua hàng thành công."} Trạng thái mới: ${
          PURCHASE_ORDER_STATUS_LABELS[response.status] || response.status
        }.`
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const resolvedBackHref =
    backHref ??
    (detail?.purchaseRequestId
      ? ROUTES.sales.purchaseRequest(detail.purchaseRequestId)
      : ROUTES.sales.purchaseRequests);

  const customerPhone = customer?.phone ?? detail?.customerPhone;
  const customerEmail = customer?.email ?? detail?.customerEmail;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Đang tải đơn mua hàng...</p>
      </div>
    );
  }

  if (loadError && !detail) {
    return (
      <div className="space-y-4">
        <Link
          href={ROUTES.sales.purchaseRequests}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại
        </Link>
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {loadError}
        </div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link
          href={resolvedBackHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
              Cập nhật trạng thái mua hàng
            </h1>
            <p className="text-muted text-sm font-medium mt-2">
              Mã đơn mua hàng:{" "}
              <span className="font-mono text-ink">{detail.purchaseOrderCode}</span>
            </p>
            <p className="text-muted text-sm font-medium mt-1">
              Mã yêu cầu mua hộ:{" "}
              <span className="font-mono text-ink">{detail.requestCode || "—"}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      <section className="rounded-xl border border-border-muted bg-surface/50 px-6 py-4 text-sm text-muted">
        Trang này chỉ ghi nhận tiến độ mua hàng với nhà cung cấp. Không xử lý vận chuyển nội địa.
      </section>

      {isWaitingWarehouseReceive(detail.status) ? (
        <section className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
          Đơn mua hàng đã ở trạng thái chờ kho nhận. Có thể chuyển sang quy trình nhập kho.
        </section>
      ) : null}

      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-2">
        <h2 className="text-lg font-bold text-ink mb-1">Thông tin khách hàng</h2>
        <p className="text-sm">
          <span className="text-muted">Khách hàng:</span>{" "}
          <span className="font-semibold text-ink">{detail.customerName}</span>
        </p>
        {customerPhone ? (
          <p className="text-sm">
            <span className="text-muted">SĐT:</span>{" "}
            <span className="font-medium text-ink">{customerPhone}</span>
          </p>
        ) : null}
        {customerEmail ? (
          <p className="text-sm">
            <span className="text-muted">Email:</span>{" "}
            <span className="font-medium text-ink">{customerEmail}</span>
          </p>
        ) : null}
        {detail.supplier ? (
          <p className="text-sm">
            <span className="text-muted">Nhà cung cấp:</span>{" "}
            <span className="font-medium text-ink">{detail.supplier}</span>
          </p>
        ) : null}
        <p className="text-sm text-muted">
          Ngày tạo đơn: {formatPurchaseOrderDate(detail.createdAt)}
        </p>
      </section>

      <section className="rounded-xl border border-border-muted bg-surface-elevated overflow-hidden">
        <div className="px-6 py-4 border-b border-border-muted">
          <h2 className="text-lg font-bold text-ink">Sản phẩm cần mua</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                <th className="px-6 py-3 font-bold">Sản phẩm</th>
                <th className="px-6 py-3 font-bold">Link</th>
                <th className="px-6 py-3 font-bold">SL</th>
                <th className="px-6 py-3 font-bold">Thuộc tính</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border-muted/60 last:border-0"
                >
                  <td className="px-6 py-4 font-semibold text-ink">{product.productName}</td>
                  <td className="px-6 py-4 max-w-xs">
                    {product.productLink ? (
                      <a
                        href={product.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all text-xs"
                      >
                        Link
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-6 py-4">{product.quantity}</td>
                  <td className="px-6 py-4 text-muted">{product.attributes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Trạng thái mua hàng</h2>

          <div className="space-y-2">
            <p className="text-sm text-muted">Trạng thái hiện tại</p>
            <StatusBadge status={detail.status} />
          </div>

          {canUpdate ? (
            <div className="space-y-2">
              <label htmlFor="nextStatus" className="text-sm font-semibold text-ink">
                Chuyển sang trạng thái
              </label>
              <select
                id="nextStatus"
                required
                disabled={isSubmitting}
                value={nextStatus}
                onChange={(event) => {
                  setNextStatus(event.target.value);
                }}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring disabled:opacity-60"
              >
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {PURCHASE_ORDER_STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-sm text-muted">
              {detail.status === "CANCELLED"
                ? "Đơn mua hàng đã bị hủy, không thể cập nhật thêm."
                : "Đơn mua hàng đã hoàn tất bước mua với NCC."}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="processingNote" className="text-sm font-semibold text-ink">
              Ghi chú xử lý
            </label>
            <textarea
              id="processingNote"
              rows={3}
              disabled={!canUpdate || isSubmitting}
              value={processingNote}
              onChange={(event) => {
                setProcessingNote(event.target.value);
              }}
              placeholder="Ghi chú tiến độ mua hàng với nhà cung cấp..."
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring min-h-[88px] disabled:opacity-60"
            />
          </div>
        </section>

        {canUpdate ? (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted">
              Chỉ chọn trạng thái tiếp theo hợp lệ theo quy trình mua hàng với NCC.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !nextStatus}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
                  Cập nhật trạng thái
                </>
              )}
            </button>
          </section>
        ) : null}
      </form>
    </div>
  );
}
