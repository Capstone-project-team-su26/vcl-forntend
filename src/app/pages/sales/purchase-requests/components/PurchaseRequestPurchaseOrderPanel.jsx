"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as customerService from "@/modules/customers";
import * as purchaseRequestService from "@/modules/purchase-requests";
import { useToast } from "@/app/components/ToastProvider";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_STYLES,
  canStaffCreatePurchaseOrder,
  getQuotedUnitPrice,
  formatQuotationAmount,
  formatPurchaseRequestDate,
} = purchaseRequestService;

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

export default function PurchaseRequestPurchaseOrderPanel({ id, backHref }) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [supplier, setSupplier] = useState("");
  const [purchaseNote, setPurchaseNote] = useState("");

  const canCreate = detail ? canStaffCreatePurchaseOrder(detail) : false;
  const isReadOnly =
    !canCreate &&
    (detail?.status === "PURCHASE_ORDER_CREATED" || Boolean(detail?.purchaseOrder));

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await purchaseRequestService.getPurchaseRequest(id);
        if (!active) return;

        setDetail(data);

        if (data.purchaseOrder) {
          setSupplier(data.purchaseOrder.supplier ?? "");
          setPurchaseNote(data.purchaseOrder.purchaseNote ?? "");
        } else {
          setSupplier("");
          setPurchaseNote("");
        }

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

    if (!detail || !canCreate || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await purchaseRequestService.createPurchaseRequestPurchaseOrder(
        detail.id,
        { supplier, purchaseNote }
      );

      const updated = response.purchaseRequest;
      if (updated) {
        setDetail(updated);
        if (updated.purchaseOrder) {
          setSupplier(updated.purchaseOrder.supplier ?? "");
          setPurchaseNote(updated.purchaseOrder.purchaseNote ?? "");
        }
      } else if (response.purchaseOrder) {
        setDetail((current) =>
          current
            ? {
                ...current,
                status: response.status ?? "PURCHASE_ORDER_CREATED",
                purchaseOrder: response.purchaseOrder,
              }
            : current
        );
      }

      toast.success(
        `${response.message || "Tạo đơn mua hàng thành công."} Trạng thái: ${
          PURCHASE_REQUEST_STATUS_LABELS[response.status] || response.status
        }.`
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const resolvedBackHref =
    backHref ?? (id ? ROUTES.sales.purchaseRequest(id) : ROUTES.sales.purchaseRequests);

  const customerPhone = customer?.phone ?? detail?.customerPhone;
  const customerEmail = customer?.email ?? detail?.customerEmail;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Đang tải yêu cầu mua hộ...</p>
      </div>
    );
  }

  if (loadError && !detail) {
    return (
      <div className="space-y-4">
        <Link
          href={resolvedBackHref}
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
          Quay lại chi tiết yêu cầu
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
              Tạo đơn mua hàng
            </h1>
            <p className="text-muted text-sm font-medium mt-2">
              Mã yêu cầu:{" "}
              <span className="font-mono text-ink">{detail.requestCode}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {!canCreate && !isReadOnly ? (
        <div className="rounded-lg border border-warning/30 bg-warning-bg/40 px-4 py-3 text-sm text-ink">
          Không thể tạo đơn mua hàng. Yêu cầu phải được Customer xác nhận báo giá (
          <span className="font-semibold">CONFIRMED</span>) và chưa có đơn mua hàng.
        </div>
      ) : null}

      {detail.purchaseOrder && !canCreate ? (
        <div className="rounded-lg border border-info/30 bg-info-bg/40 px-4 py-3 text-sm text-ink">
          Yêu cầu này đã có đơn mua hàng{" "}
          <span className="font-mono font-semibold">
            {detail.purchaseOrder.purchaseOrderCode}
          </span>
          . Không thể tạo trùng.
        </div>
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
      </section>

      {detail.quotation ? (
        <section className="rounded-xl border border-success/30 bg-success-bg/20 p-6 space-y-1">
          <h2 className="text-lg font-bold text-ink">Báo giá đã xác nhận</h2>
          <p className="text-sm text-muted">
            Tổng tiền báo giá:{" "}
            <span className="font-bold text-ink">
              {formatQuotationAmount(detail.quotation.totalAmount)}
            </span>
          </p>
          {detail.quotation.quotationNote ? (
            <p className="text-sm text-muted">Ghi chú báo giá: {detail.quotation.quotationNote}</p>
          ) : null}
        </section>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
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
                  <th className="px-6 py-3 font-bold text-right">Giá báo giá</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((product) => {
                  const unitPrice = getQuotedUnitPrice(product, detail.quotation);

                  return (
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
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatQuotationAmount(unitPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="supplier" className="text-sm font-semibold text-ink">
              Nhà cung cấp
            </label>
            <input
              id="supplier"
              type="text"
              disabled={!canCreate || isSubmitting}
              value={supplier}
              onChange={(event) => {
                setSupplier(event.target.value);
              }}
              placeholder="VD: Amazon US, Apple Store Online..."
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring disabled:opacity-60"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="purchaseNote" className="text-sm font-semibold text-ink">
              Ghi chú mua hàng
            </label>
            <textarea
              id="purchaseNote"
              rows={3}
              disabled={!canCreate || isSubmitting}
              value={purchaseNote}
              onChange={(event) => {
                setPurchaseNote(event.target.value);
              }}
              placeholder="Ghi chú nội bộ cho Buying Team khi đặt hàng với nhà cung cấp..."
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring min-h-[88px] disabled:opacity-60"
            />
          </div>
        </section>

        {isReadOnly && detail.purchaseOrder ? (
          <section className="rounded-xl border border-border-muted bg-surface/50 p-6 space-y-3">
            <h2 className="text-lg font-bold text-ink">Đơn mua hàng đã tạo</h2>
            <p className="text-sm">
              <span className="text-muted">Mã đơn:</span>{" "}
              <span className="font-mono font-semibold text-ink">
                {detail.purchaseOrder.purchaseOrderCode}
              </span>
            </p>
            <p className="text-sm text-muted">
              Ngày tạo: {formatPurchaseRequestDate(detail.purchaseOrder.createdAt)}
            </p>
            <Link
              href={ROUTES.sales.purchaseOrderStatus(detail.id)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-bold hover:bg-primary/10"
            >
              <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
              Cập nhật trạng thái mua hàng
            </Link>
          </section>
        ) : null}

        {canCreate ? (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted">
                Xác nhận bắt đầu xử lý mua hàng với nhà cung cấp theo báo giá đã được Customer
                duyệt.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  Đang tạo đơn mua hàng...
                </>
              ) : (
                <>
                  <Icon icon="lucide:shopping-cart" className="w-4 h-4" />
                  Tạo đơn mua hàng
                </>
              )}
            </button>
          </section>
        ) : null}
      </form>
    </div>
  );
}
