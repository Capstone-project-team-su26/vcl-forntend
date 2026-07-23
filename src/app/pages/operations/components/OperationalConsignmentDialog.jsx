"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { getStaffConsignment } from "@/modules/consignments";
import { formatProductTypeLabel } from "@/modules/product-types";
import { getErrorMessage } from "@/utils/apiError";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function formatNumber(value, suffix = "") {
  if (value == null || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toLocaleString("vi-VN")}${suffix}` : "—";
}

function InfoItem({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-border-muted bg-surface p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Icon icon={icon} className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold text-ink">{value || "—"}</p>
    </div>
  );
}

function PartyCard({ title, icon, name, phone, address }) {
  return (
    <section className="rounded-xl border border-border-muted bg-surface p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
        <Icon icon={icon} className="h-4 w-4 text-secondary" aria-hidden />
        {title}
      </h3>
      <p className="mt-3 text-sm font-semibold text-ink">{name || "—"}</p>
      <p className="mt-1 text-xs text-muted">{phone || "Không có số điện thoại"}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{address || "Không có địa chỉ"}</p>
    </section>
  );
}

export default function OperationalConsignmentDialog({ orderId, open, onClose }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open || !orderId) return undefined;
    let active = true;

    getStaffConsignment(orderId)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Không thể tải chi tiết lô hàng."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, orderId]);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="operations-consignment-title"
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border-muted bg-surface-elevated shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-muted px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Chi tiết lô hàng
            </p>
            <h2
              id="operations-consignment-title"
              className="mt-1 truncate font-mono text-lg font-black text-ink sm:text-xl"
            >
              {detail?.consignmentCode || "Đang tải dữ liệu"}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-muted text-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label="Đóng chi tiết lô hàng"
          >
            <Icon icon="lucide:x" className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted">
              <Icon icon="lucide:loader-circle" className="h-7 w-7 animate-spin" aria-hidden />
              <p className="text-sm font-medium">Đang tải chi tiết lô hàng...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-bg text-danger">
                <Icon icon="lucide:triangle-alert" className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="font-bold text-ink">Không tải được chi tiết</p>
                <p className="mt-1 max-w-md text-sm text-muted">{error}</p>
              </div>
            </div>
          ) : detail ? (
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <ConsignmentStatusBadge status={detail.status} className="self-start" />
                <p className="text-xs text-muted">Tạo lúc {formatDate(detail.createdAt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <InfoItem
                  label="Loại vận chuyển"
                  value={formatProductTypeLabel(detail.consignmentType) || detail.consignmentType}
                  icon="lucide:package"
                />
                <InfoItem
                  label="Tổng trọng lượng"
                  value={formatNumber(detail.totalWeight, " kg")}
                  icon="lucide:weight"
                />
                <InfoItem
                  label="Số kiện"
                  value={formatNumber(detail.packageCount)}
                  icon="lucide:boxes"
                />
                <InfoItem label="Tuyến" value={detail.route} icon="lucide:route" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <PartyCard
                  title="Người gửi"
                  icon="lucide:user-round"
                  name={detail.senderName || detail.customer?.fullName || detail.customerName}
                  phone={detail.senderPhone || detail.customer?.phone}
                  address={detail.senderAddress || detail.customer?.address}
                />
                <PartyCard
                  title="Người nhận"
                  icon="lucide:map-pin"
                  name={detail.receiverName}
                  phone={detail.receiverPhone}
                  address={detail.receiverAddress}
                />
              </div>

              <section className="rounded-xl border border-border-muted">
                <div className="flex items-center justify-between border-b border-border-muted px-4 py-3">
                  <h3 className="text-sm font-bold text-ink">Mặt hàng</h3>
                  <span className="text-xs font-semibold text-muted">
                    {detail.items?.length ?? 0} mục
                  </span>
                </div>
                {detail.items?.length ? (
                  <div className="divide-y divide-border-muted">
                    {detail.items.map((item, index) => (
                      <div
                        key={item.id || `${item.productName}-${index}`}
                        className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <p className="font-semibold text-ink">{item.productName || "Mặt hàng"}</p>
                          <p className="mt-1 text-xs text-muted">
                            {formatProductTypeLabel(item.productType) || item.productType || "Chưa phân loại"}
                          </p>
                        </div>
                        <div className="flex gap-4 text-xs text-muted sm:text-right">
                          <span>SL: {formatNumber(item.quantity)}</span>
                          <span>{formatNumber(item.weight, " kg")}</span>
                          <span>{formatNumber(item.declaredValue, " ₫")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-muted">Không có mặt hàng.</p>
                )}
              </section>

              {detail.quotation ? (
                <section className="rounded-xl border border-primary/40 bg-primary/10 p-4">
                  <h3 className="text-sm font-bold text-ink">Báo giá gần nhất</h3>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                    <InfoItem
                      label="Loại báo giá"
                      value={detail.quotation.quoteType}
                      icon="lucide:file-text"
                    />
                    <InfoItem
                      label="Phí vận chuyển"
                      value={formatNumber(detail.quotation.estimatedFreightCharge, " ₫")}
                      icon="lucide:truck"
                    />
                    <InfoItem
                      label="Tổng ước tính"
                      value={formatNumber(detail.quotation.totalEstimatedCost, " ₫")}
                      icon="lucide:badge-dollar-sign"
                    />
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted">Không có dữ liệu lô hàng.</p>
          )}
        </div>
      </section>
    </div>
  );
}
