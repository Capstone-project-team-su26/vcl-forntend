"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { countConsolidationParcels, getConsolidationDetail } from "@/modules/operations";
import { getErrorMessage } from "@/utils/apiError";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import ConsolidationStatusBadge from "./ConsolidationStatusBadge";

function formatNumber(value, suffix = "") {
  if (value == null || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toLocaleString("vi-VN")}${suffix}` : "—";
}

function formatDimensions(parcel) {
  if (parcel?.length == null && parcel?.width == null && parcel?.height == null) return "—";
  const part = (value) => (value == null ? "?" : Number(value).toLocaleString("vi-VN"));
  return `${part(parcel.length)} × ${part(parcel.width)} × ${part(parcel.height)} cm`;
}

function SummaryItem({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-border-muted bg-surface p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Icon icon={icon} className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

/* ponytail: font mặc định của jsPDF không render tiếng Việt có dấu →
   nhãn PDF dùng tiếng Anh; nâng cấp bằng cách nhúng font Unicode (vd. Roboto). */
async function exportManifestPdf(detail) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const pdf = new jsPDF();
  const value = (input, suffix = "") =>
    input == null || input === "" ? "-" : `${input}${suffix}`;

  pdf.setFontSize(16);
  pdf.text("Consolidation Manifest", 14, 16);
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString("en-GB")}`, 14, 23);

  autoTable(pdf, {
    startY: 29,
    head: [["Field", "Value"]],
    body: [
      ["Master code", value(detail.masterCode)],
      ["Status", value(detail.status)],
      ["Total weight (kg)", value(detail.totalWeight)],
      ["Total volume (m3)", value(detail.totalVolume)],
      ["Orders", detail.orders?.length ?? 0],
      ["Parcels", countConsolidationParcels(detail)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: 14, right: 14 },
  });

  const parcelRows = [];
  for (const order of detail.orders ?? []) {
    const parcels = order.parcels?.length ? order.parcels : [null];
    for (const parcel of parcels) {
      parcelRows.push([
        value(order.consignmentCode),
        value(parcel?.packageCode),
        parcel ? formatDimensions(parcel).replace("—", "-") : "-",
        value(parcel?.actualWeight),
        value(parcel?.volumetricWeight),
        value(parcel?.chargeableWeight),
        value(parcel?.packageStatus ?? order.status),
      ]);
    }
  }

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 8,
    head: [["Order", "Package", "Dims (cm)", "Actual kg", "Volumetric kg", "Chargeable kg", "Status"]],
    body: parcelRows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: 14, right: 14 },
  });

  pdf.save(`${detail.masterCode || "consolidation"}.pdf`);
}

export default function ConsolidationDetailDialog({ consolidationId, open, onClose }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open || !consolidationId) return undefined;
    let active = true;

    getConsolidationDetail(consolidationId)
      .then((data) => {
        if (active) setDetail(data);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, "Không thể tải chi tiết lô gom hàng."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, consolidationId]);

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

  async function handleExport() {
    if (!detail) return;
    setIsExporting(true);
    try {
      await exportManifestPdf(detail);
    } finally {
      setIsExporting(false);
    }
  }

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
        aria-labelledby="consolidation-detail-title"
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-border-muted bg-surface-elevated shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-muted px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Chi tiết lô gom hàng
            </p>
            <h2
              id="consolidation-detail-title"
              className="mt-1 truncate font-mono text-lg font-black text-ink sm:text-xl"
            >
              {detail?.masterCode || "Đang tải dữ liệu"}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={!detail || isLoading || isExporting}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-secondary px-3.5 text-xs font-bold text-white shadow-sm hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Icon
                icon={isExporting ? "lucide:loader-circle" : "lucide:file-down"}
                className={`h-4 w-4 ${isExporting ? "animate-spin" : ""}`}
                aria-hidden
              />
              Xuất PDF
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-muted text-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-secondary"
              aria-label="Đóng chi tiết lô gom hàng"
            >
              <Icon icon="lucide:x" className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted">
              <Icon icon="lucide:loader-circle" className="h-7 w-7 animate-spin" aria-hidden />
              <p className="text-sm font-medium">Đang tải chi tiết lô gom hàng...</p>
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
                <ConsolidationStatusBadge status={detail.status} className="self-start" />
                {detail.shipmentId ? (
                  <p className="font-mono text-xs text-muted">Shipment: {detail.shipmentId}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <SummaryItem
                  label="Tổng trọng lượng"
                  value={formatNumber(detail.totalWeight, " kg")}
                  icon="lucide:weight"
                />
                <SummaryItem
                  label="Tổng thể tích"
                  value={formatNumber(detail.totalVolume, " m³")}
                  icon="lucide:box"
                />
                <SummaryItem
                  label="Số đơn hàng"
                  value={formatNumber(detail.orders?.length ?? 0)}
                  icon="lucide:package"
                />
                <SummaryItem
                  label="Số kiện hàng"
                  value={formatNumber(countConsolidationParcels(detail))}
                  icon="lucide:boxes"
                />
              </div>

              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                  <Icon icon="lucide:package" className="h-4 w-4 text-secondary" aria-hidden />
                  Đơn hàng trong lô ({detail.orders?.length ?? 0})
                </h3>
                {detail.orders?.length ? (
                  detail.orders.map((order) => (
                    <article
                      key={order.id}
                      className="overflow-hidden rounded-xl border border-border-muted"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-muted bg-surface px-4 py-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-bold text-secondary">
                            {order.consignmentCode || "—"}
                          </span>
                          <ConsignmentStatusBadge
                            status={order.status}
                            className="px-2.5 py-1 text-[11px]"
                          />
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-muted">
                          <Icon icon="lucide:route" className="h-3.5 w-3.5" aria-hidden />
                          {order.route || "Chưa có tuyến"}
                        </span>
                      </div>
                      {order.parcels?.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px] text-left text-sm">
                            <thead>
                              <tr className="border-b border-border-muted text-[11px] font-bold uppercase tracking-wide text-muted">
                                <th className="px-4 py-2">Mã kiện</th>
                                <th className="px-4 py-2">Kích thước</th>
                                <th className="px-4 py-2 text-right">TL thực</th>
                                <th className="px-4 py-2 text-right">TL quy đổi</th>
                                <th className="px-4 py-2 text-right">TL tính phí</th>
                                <th className="px-4 py-2">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-muted">
                              {order.parcels.map((parcel) => (
                                <tr key={parcel.id}>
                                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-ink">
                                    {parcel.packageCode || "—"}
                                  </td>
                                  <td className="px-4 py-2.5 whitespace-nowrap text-xs text-muted">
                                    {formatDimensions(parcel)}
                                  </td>
                                  <td className="px-4 py-2.5 text-right tabular-nums">
                                    {formatNumber(parcel.actualWeight, " kg")}
                                  </td>
                                  <td className="px-4 py-2.5 text-right tabular-nums">
                                    {formatNumber(parcel.volumetricWeight, " kg")}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-ink">
                                    {formatNumber(parcel.chargeableWeight, " kg")}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className="inline-flex rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted">
                                      {parcel.packageStatus || "—"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="px-4 py-5 text-center text-sm text-muted">
                          Đơn này chưa có kiện hàng nào.
                        </p>
                      )}
                    </article>
                  ))
                ) : (
                  <p className="rounded-xl border border-border-muted px-4 py-8 text-center text-sm text-muted">
                    Lô gom chưa chứa đơn hàng nào.
                  </p>
                )}
              </section>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-muted">Không có dữ liệu lô gom hàng.</p>
          )}
        </div>
      </section>
    </div>
  );
}
