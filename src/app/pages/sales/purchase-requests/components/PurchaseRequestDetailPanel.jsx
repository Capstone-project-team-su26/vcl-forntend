"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as purchaseRequestService from "@/utils/purchaseRequestService";
import {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_STYLES,
  canUpdatePurchaseOrderStatus,
} from "@/utils/purchaseOrderService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_STYLES,
  canStaffProcessPurchaseRequest,
  canAcceptPurchaseRequest,
  canStaffCreateQuotation,
  canStaffCreatePurchaseOrder,
  formatPurchaseRequestDate,
  formatQuotationAmount,
} = purchaseRequestService;

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border-muted/60 last:border-0">
      <dt className="text-sm font-bold text-muted sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${
        PURCHASE_REQUEST_STATUS_STYLES[status] || "bg-surface text-muted"
      }`}
    >
      {PURCHASE_REQUEST_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function PurchaseRequestDetailPanel({
  id,
  backHref = ROUTES.sales.purchaseRequests,
}) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [reasonValidation, setReasonValidation] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  const canProcess = detail ? canStaffProcessPurchaseRequest(detail.status) : false;
  const canAccept = detail ? canAcceptPurchaseRequest(detail.status) : false;
  const canQuote = detail ? canStaffCreateQuotation(detail.status) : false;
  const canCreatePurchaseOrder = detail ? canStaffCreatePurchaseOrder(detail) : false;

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");
      setActionError("");
      setSuccessMessage("");
      setActionReason("");
      setReasonValidation("");
      setPendingAction(null);

      try {
        const data = await purchaseRequestService.getPurchaseRequest(id);
        if (active) setDetail(data);
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
  }, [id]);

  function applyUpdatedRequest(next, message) {
    setDetail(next);
    setSuccessMessage(message);
    setActionError("");
    setReasonValidation("");
    setActionReason("");
    setPendingAction(null);
  }

  async function handleStatusUpdate(status) {
    if (!detail || !canProcess || pendingAction) return;

    const needsReason = status === "NEED_MORE_INFO" || status === "REJECTED";
    const reason = actionReason.trim();

    if (needsReason && !reason) {
      setReasonValidation(
        status === "NEED_MORE_INFO"
          ? "Vui lòng nhập lý do yêu cầu bổ sung thông tin."
          : "Vui lòng nhập lý do từ chối."
      );
      return;
    }

    setPendingAction(status);
    setActionError("");
    setSuccessMessage("");
    setReasonValidation("");

    try {
      const response = await purchaseRequestService.updatePurchaseRequestStatus(detail.id, {
        status,
        reason: needsReason ? reason : undefined,
      });

      const updated =
        response.purchaseRequest ??
        ({
          ...detail,
          status: response.status ?? status,
          statusReason: response.statusReason ?? (needsReason ? reason : null),
        });

      applyUpdatedRequest(
        updated,
        response.message || "Cập nhật trạng thái yêu cầu mua hộ thành công."
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Đang tải yêu cầu mua hộ...</p>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
              Yêu cầu mua hộ
            </h1>
            <p className="text-muted text-sm font-medium mt-2">
              Mã yêu cầu:{" "}
              <span className="font-mono text-ink">{detail.requestCode}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
          {successMessage}
          <p className="mt-1 font-semibold">
            Trạng thái mới: {PURCHASE_REQUEST_STATUS_LABELS[detail.status] || detail.status}
          </p>
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {actionError}
        </div>
      ) : null}

      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6">
        <h2 className="text-lg font-bold text-ink mb-2">Thông tin yêu cầu</h2>
        <dl>
          <DetailRow label="Khách hàng" value={detail.customerName} />
          <DetailRow label="Ngày tạo" value={formatPurchaseRequestDate(detail.createdAt)} />
          <DetailRow
            label="Ghi chú của Customer"
            value={detail.customerNote || "—"}
          />
          {detail.statusReason ? (
            <DetailRow label="Lý do xử lý" value={detail.statusReason} />
          ) : null}
        </dl>
      </section>

      <section className="rounded-xl border border-border-muted bg-surface-elevated overflow-hidden">
        <div className="px-6 py-4 border-b border-border-muted">
          <h2 className="text-lg font-bold text-ink">Sản phẩm cần mua</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                <th className="px-6 py-3 font-bold">Tên sản phẩm</th>
                <th className="px-6 py-3 font-bold">Link mua hàng</th>
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
                  <td className="px-6 py-4">
                    {product.productLink ? (
                      <a
                        href={product.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {product.productLink}
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

      {canQuote ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Báo giá mua hộ</h2>
            <p className="text-sm text-muted mt-1">
              Đã kiểm tra sản phẩm — nhập chi phí và gửi báo giá cho khách.
            </p>
          </div>
          <Link
            href={ROUTES.sales.purchaseRequestQuotation(id)}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shrink-0"
          >
            <Icon icon="lucide:file-text" className="w-4 h-4" />
            Tạo báo giá
          </Link>
        </section>
      ) : null}

      {detail.status === "QUOTED" && detail.quotation ? (
        <section className="rounded-xl border border-success/30 bg-success-bg/30 p-6 space-y-2">
          <h2 className="text-lg font-bold text-ink">Báo giá đã gửi</h2>
          <p className="text-sm text-muted">
            Tổng tiền:{" "}
            <span className="font-bold text-ink">
              {formatQuotationAmount(detail.quotation.totalAmount)}
            </span>
          </p>
          {detail.quotation.quotationNote ? (
            <p className="text-sm text-muted">Ghi chú: {detail.quotation.quotationNote}</p>
          ) : null}
        </section>
      ) : null}

      {detail.status === "CONFIRMED" && detail.quotation ? (
        <section className="rounded-xl border border-success/30 bg-success-bg/30 p-6 space-y-2">
          <h2 className="text-lg font-bold text-ink">Báo giá đã được Customer xác nhận</h2>
          <p className="text-sm text-muted">
            Tổng tiền:{" "}
            <span className="font-bold text-ink">
              {formatQuotationAmount(detail.quotation.totalAmount)}
            </span>
          </p>
          {detail.quotation.quotationNote ? (
            <p className="text-sm text-muted">Ghi chú: {detail.quotation.quotationNote}</p>
          ) : null}
        </section>
      ) : null}

      {canCreatePurchaseOrder ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Tạo đơn mua hàng</h2>
            <p className="text-sm text-muted mt-1">
              Customer đã xác nhận báo giá — ghi nhận bắt đầu mua hàng với nhà cung cấp.
            </p>
          </div>
          <Link
            href={ROUTES.sales.purchaseRequestPurchaseOrder(id)}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shrink-0"
          >
            <Icon icon="lucide:shopping-cart" className="w-4 h-4" />
            Tạo đơn mua hàng
          </Link>
        </section>
      ) : null}

      {detail.purchaseOrder ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-3">
          <h2 className="text-lg font-bold text-ink">Đơn mua hàng</h2>
          <p className="text-sm">
            <span className="text-muted">Mã đơn:</span>{" "}
            <span className="font-mono font-semibold text-ink">
              {detail.purchaseOrder.purchaseOrderCode}
            </span>
          </p>
          {detail.purchaseOrder.status ? (
            <p className="text-sm flex items-center gap-2">
              <span className="text-muted">Trạng thái mua hàng:</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                  PURCHASE_ORDER_STATUS_STYLES[detail.purchaseOrder.status] ||
                  "bg-surface text-muted"
                }`}
              >
                {PURCHASE_ORDER_STATUS_LABELS[detail.purchaseOrder.status] ||
                  detail.purchaseOrder.status}
              </span>
            </p>
          ) : null}
          {detail.purchaseOrder.supplier ? (
            <p className="text-sm text-muted">Nhà cung cấp: {detail.purchaseOrder.supplier}</p>
          ) : null}
          {detail.purchaseOrder.purchaseNote ? (
            <p className="text-sm text-muted">Ghi chú: {detail.purchaseOrder.purchaseNote}</p>
          ) : null}
          {detail.purchaseOrder.processingNote ? (
            <p className="text-sm text-muted">
              Ghi chú xử lý: {detail.purchaseOrder.processingNote}
            </p>
          ) : null}
          <p className="text-sm text-muted">
            Ngày tạo: {formatPurchaseRequestDate(detail.purchaseOrder.createdAt)}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={ROUTES.sales.purchaseOrderStatus(detail.id)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {canUpdatePurchaseOrderStatus(detail.purchaseOrder.status ?? "CREATED")
                ? "Cập nhật trạng thái mua hàng"
                : "Xem trạng thái mua hàng"}
              <Icon icon="lucide:arrow-right" className="w-4 h-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {canProcess ? (
        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Xử lý yêu cầu</h2>
          <p className="text-sm text-muted">
            Kiểm tra link sản phẩm và thông tin khách cung cấp trước khi cập nhật trạng thái.
          </p>

          <div className="space-y-2">
            <label htmlFor="actionReason" className="text-sm font-semibold text-ink">
              Lý do (bắt buộc khi yêu cầu bổ sung hoặc từ chối)
            </label>
            <textarea
              id="actionReason"
              rows={3}
              value={actionReason}
              onChange={(event) => {
                setActionReason(event.target.value);
                setReasonValidation("");
              }}
              placeholder="Nhập lý do để Customer biết cần bổ sung gì hoặc vì sao bị từ chối..."
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring min-h-[88px]"
            />
            {reasonValidation ? (
              <p className="text-sm text-danger">{reasonValidation}</p>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            {canAccept ? (
              <button
                type="button"
                disabled={Boolean(pendingAction)}
                onClick={() => handleStatusUpdate("IN_REVIEW")}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {pendingAction === "IN_REVIEW" ? (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon icon="lucide:play" className="w-4 h-4" />
                )}
                Nhận xử lý
              </button>
            ) : null}
            <button
              type="button"
              disabled={Boolean(pendingAction)}
              onClick={() => handleStatusUpdate("NEED_MORE_INFO")}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg border border-warning/40 bg-warning-bg text-warning-text text-sm font-bold hover:bg-warning-bg/80 disabled:opacity-50"
            >
              {pendingAction === "NEED_MORE_INFO" ? (
                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon icon="lucide:message-circle-question" className="w-4 h-4" />
              )}
              Yêu cầu bổ sung thông tin
            </button>
            <button
              type="button"
              disabled={Boolean(pendingAction)}
              onClick={() => handleStatusUpdate("REJECTED")}
              className="btn-destructive disabled:opacity-50"
            >
              {pendingAction === "REJECTED" ? (
                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon icon="lucide:x-circle" className="w-4 h-4" />
              )}
              Từ chối yêu cầu
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-border-muted bg-surface/50 px-6 py-4 text-sm text-muted">
          {detail.status === "QUOTED" ? (
            <p>Báo giá đã được gửi cho khách hàng. Chờ Customer xác nhận.</p>
          ) : detail.status === "CONFIRMED" ? (
            <p>Customer đã xác nhận báo giá. Có thể tạo đơn mua hàng.</p>
          ) : detail.status === "PURCHASE_ORDER_CREATED" ? (
            <p>Đơn mua hàng đã được tạo. Buying Team đang xử lý với nhà cung cấp.</p>
          ) : detail.status === "NEED_MORE_INFO" ? (
            <p>Đang chờ Customer bổ sung thông tin theo yêu cầu.</p>
          ) : detail.status === "REJECTED" ? (
            <p>Yêu cầu đã bị từ chối.</p>
          ) : (
            <p>Yêu cầu không còn ở trạng thái có thể xử lý.</p>
          )}
        </section>
      )}
    </div>
  );
}
