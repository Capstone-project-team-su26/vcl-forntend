"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as orderConsignmentService from "@/modules/consignments";
import * as consignmentQuotationService from "@/modules/consignments/quotation";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import {
  formatVolumeCm3,
  resolveConsignmentTotalVolumeCm3,
  formatItemDimensions,
  calculateItemDimWeightKg,
  resolveVolumetricDivisor,
  isVolumetricDivisorRule,
  VOLUMETRIC_DIVISOR_CM3,
} from "@/modules/service-pricing";
import { formatProductTypeLabel } from "@/modules/product-types";

const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  canStaffSendConsignmentQuotation,
  canStaffUpdateConsignmentStatus,
  canStaffRejectConsignmentStatus,
  formatConsignmentDate,
  formatConsignmentDisplayCode,
  isImageReferenceUrl,
} = orderConsignmentService;

const {
  formatQuotationMoney,
  getQuotationDisplayLines,
  getConsignmentQuotationHeading,
  isDraftConsignmentQuotation,
  formatMoney,
  fetchActiveAdditionalFees,
} = consignmentQuotationService;

function formatConsignmentTypeLabel(detail) {
  const orderLabel =
    CONSIGNMENT_TYPE_LABELS[detail.orderType ?? detail.consignmentType] ||
    detail.orderType ||
    detail.consignmentType;
  const shipping = detail.shippingOption;

  if (shipping && shipping !== detail.orderType) {
    const shippingLabel = CONSIGNMENT_TYPE_LABELS[shipping] || shipping;
    return `${orderLabel} — ${shippingLabel}`;
  }

  return orderLabel || "—";
}

function shortenReferenceId(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length <= 18) return trimmed;
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}`;
}

function NoticeBanner({ variant = "info", icon, children }) {
  const tone =
    variant === "success"
      ? "border-primary bg-success-bg text-success-text"
      : variant === "warning" || variant === "error"
        ? "border-accent bg-warning-bg text-warning-text"
        : "border-primary bg-info-bg text-info-text";

  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${tone}`}>
      <Icon icon={icon} className="w-5 h-5 shrink-0 text-secondary" aria-hidden />
      <div className="min-w-0 font-medium text-secondary leading-relaxed">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border-muted last:border-0">
      <dt className="text-sm font-semibold text-faint sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-secondary">{value}</dd>
    </div>
  );
}

function CopyCodeButton({ value }) {
  const [copied, setCopied] = useState(false);

  if (!value) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border-muted text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors"
      title={copied ? "Đã sao chép" : "Sao chép mã"}
      aria-label={copied ? "Đã sao chép mã" : "Sao chép mã"}
    >
      <Icon icon={copied ? "lucide:check" : "lucide:copy"} className="w-4 h-4" />
    </button>
  );
}

function PartySection({ title, name, phone, address }) {
  return (
    <div className="rounded-lg border border-primary bg-surface-elevated overflow-hidden">
      <div className="px-4 py-3 border-b border-primary">
        <p className="text-xs font-bold uppercase tracking-wide text-secondary">{title}</p>
        <p className="mt-1 text-base font-bold text-secondary">{name || "—"}</p>
      </div>
      <div className="px-4 pb-1">
        <dl>
          <DetailRow label="Số điện thoại" value={phone || "—"} />
          <DetailRow label="Địa chỉ" value={address || "—"} />
        </dl>
      </div>
    </div>
  );
}

function NextStepCard({ detail, canSendQuotation }) {
  if (!canSendQuotation) return null;

  const isRejected = detail.status === "QUOTATION_REJECTED";
  const hasDraft = detail.quotation && isDraftConsignmentQuotation(detail.quotation);

  const title = isRejected
    ? "Gửi báo giá mới"
    : hasDraft
      ? "Kiểm tra và gửi báo giá"
      : "Lập báo giá cho khách";

  const description = isRejected
    ? "Khách đã từ chối báo giá trước đó. Bạn cần rà soát lại phí và gửi báo giá mới."
    : hasDraft
      ? "Hệ thống đã tạo báo giá tạm tính. Bạn cần kiểm tra phí, điều chỉnh nếu cần và gửi cho khách."
      : "Yêu cầu mới cần được tư vấn. Bạn cần lập báo giá và gửi cho khách xác nhận.";

  return (
    <div className="rounded-xl border-2 border-primary bg-surface-elevated p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex gap-4 min-w-0">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary bg-surface-tint text-secondary">
          <Icon icon="lucide:clipboard-check" className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">Việc cần làm</p>
          <h3 className="text-base font-bold text-secondary mt-0.5">{title}</h3>
          <p className="text-sm text-secondary mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      <Link
        href={ROUTES.sales.consignmentQuotation(detail.id)}
        className="inline-flex shrink-0 items-center justify-center gap-2 h-11 px-5 rounded-lg bg-secondary text-accent-subtle text-sm font-bold hover:bg-primary transition-colors"
      >
        <Icon icon="lucide:calculator" className="w-4 h-4" />
        {isRejected ? "Gửi báo giá mới" : "Tư vấn & báo giá"}
      </Link>
    </div>
  );
}

function formatDeclaredValue(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return formatMoney(Number(value));
}

function formatDimDisplay(length, width, height, divisor = VOLUMETRIC_DIVISOR_CM3) {
  const dimKg = calculateItemDimWeightKg(length, width, height, divisor);
  if (dimKg == null) return null;

  const l = Number(length);
  const w = Number(width);
  const h = Number(height);
  const dim = Number(divisor) > 0 ? Number(divisor) : VOLUMETRIC_DIVISOR_CM3;
  const value = `${dimKg.toLocaleString("vi-VN", {
    maximumFractionDigits: 6,
  })} kg`;
  const formula = `(${l}×${w}×${h}) / ${dim.toLocaleString("vi-VN")}`;

  return { value, formula };
}

function ProductColumnHeader({ title, hint, className = "" }) {
  return (
    <th className={`px-4 py-3 text-xs font-bold text-secondary ${className}`}>
      <span className="block">{title}</span>
      {hint ? (
        <span className="block mt-0.5 font-normal text-xs text-faint">{hint}</span>
      ) : null}
    </th>
  );
}

function formatItemWeightDisplay(weight, quantity) {
  const total = Number(weight);
  const qty = Math.max(Number(quantity) || 1, 1);
  if (weight == null || Number.isNaN(total)) return null;

  const formatKg = (value) =>
    value.toLocaleString("vi-VN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return {
    totalLabel: `${formatKg(total)} kg`,
    perUnitLabel: qty > 1 ? `${formatKg(total / qty)} kg/kiện` : null,
  };
}

function ConsignmentProductsTable({ items, volumetricDivisor = VOLUMETRIC_DIVISOR_CM3 }) {
  if (!items?.length) return null;

  return (
    <div className="bg-surface-elevated rounded-xl p-6 border border-border space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Icon icon="lucide:package" className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-extrabold font-['Oswald'] text-ink">Danh sách sản phẩm</h3>
        </div>
        <p className="text-sm text-subtle mt-1">
          Có {items.length} dòng sản phẩm trong lô hàng. Trọng lượng là <strong className="text-ink">tổng dòng</strong>;
          kích thước và DIM tính theo <strong className="text-ink">từng kiện</strong>
          {" "}(÷ {Number(volumetricDivisor).toLocaleString("vi-VN")}).
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-muted/60">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-primary bg-surface-elevated">
              <ProductColumnHeader title="STT" />
              <ProductColumnHeader title="Ảnh" />
              <ProductColumnHeader title="Sản phẩm" />
              <ProductColumnHeader title="SL" hint="kiện" className="text-right" />
              <ProductColumnHeader title="TL" hint="tổng dòng" className="text-right" />
              <ProductColumnHeader title="Kích thước" hint="mỗi kiện" className="text-right" />
              <ProductColumnHeader title="DIM" hint="mỗi kiện" className="text-right" />
              <ProductColumnHeader title="Giá khai báo" hint="tổng dòng" className="text-right" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const thumbUrl =
                item.imageUrls?.[0] ?? (isImageReferenceUrl(item.referenceUrl) ? item.referenceUrl : null);
              const dimensions = formatItemDimensions(item.length, item.width, item.height);
              const dimDisplay = formatDimDisplay(
                item.length,
                item.width,
                item.height,
                volumetricDivisor
              );
              const weightDisplay = formatItemWeightDisplay(item.weight, item.quantity);
              const productLink =
                item.referenceUrl && !isImageReferenceUrl(item.referenceUrl) ? item.referenceUrl : null;
              // ponytail: chỉ hiện mã vận đơn nội địa — không fallback sang GUID item.id.
              const skuLabel = item.domesticTrackingCode
                ? shortenReferenceId(item.domesticTrackingCode)
                : null;
              const productTypeLabel = formatProductTypeLabel(item.productType);
              const showProductType = Boolean(productTypeLabel);

              return (
                <tr
                  key={item.id ?? `${item.productName}-${index}`}
                  className="border-b border-surface-muted/50 last:border-0 align-middle hover:bg-surface/50"
                >
                  <td className="px-4 py-4 text-subtle font-semibold tabular-nums">{index + 1}</td>
                  <td className="px-4 py-4">
                    {thumbUrl ? (
                      <a
                        href={thumbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-14 h-14 rounded-lg overflow-hidden border border-surface-muted bg-surface"
                      >
                        <img
                          src={thumbUrl}
                          alt={item.productName || "Ảnh sản phẩm"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <div className="w-14 h-14 rounded-lg border border-dashed border-surface-muted bg-surface flex items-center justify-center">
                        <Icon icon="lucide:image-off" className="w-5 h-5 text-muted" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 min-w-[180px]">
                    <p className="font-semibold text-ink">{item.productName || "—"}</p>
                    {skuLabel ? (
                      <p
                        className="mt-1 text-xs font-mono text-faint"
                        title={item.domesticTrackingCode}
                      >
                        Mã: {skuLabel}
                      </p>
                    ) : null}
                    {showProductType ? (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-semibold bg-surface-tint text-secondary border border-primary">
                        {productTypeLabel}
                      </span>
                    ) : null}
                    {productLink ? (
                      <a
                        href={productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <Icon icon="lucide:external-link" className="w-3.5 h-3.5" />
                        Link tham chiếu
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-ink tabular-nums">
                    {item.quantity ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {weightDisplay ? (
                      <div>
                        <p className="font-semibold text-ink whitespace-nowrap tabular-nums">
                          {weightDisplay.totalLabel}
                        </p>
                        {weightDisplay.perUnitLabel ? (
                          <p className="text-xs text-faint mt-0.5 whitespace-nowrap tabular-nums">
                            ≈ {weightDisplay.perUnitLabel}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-right text-ink whitespace-nowrap tabular-nums">
                    {dimensions ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {dimDisplay ? (
                      <div>
                        <p className="font-semibold text-ink tabular-nums">{dimDisplay.value}</p>
                        <p className="text-xs text-faint mt-0.5 font-mono">{dimDisplay.formula}</p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-ink whitespace-nowrap tabular-nums">
                    {formatDeclaredValue(item.declaredValue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuotationSummary({
  quotation,
  volumetricDivisor = VOLUMETRIC_DIVISOR_CM3,
  volumetricDivisorRule = null,
}) {
  if (!quotation) return null;

  const lines = getQuotationDisplayLines(quotation);
  const heading = getConsignmentQuotationHeading(quotation);
  const isDraft = isDraftConsignmentQuotation(quotation);
  const actualWeight = Number(quotation.totalWeight);
  const volumetricWeight = Number(quotation.volumetricWeight);
  const chargeableWeight = Number(quotation.chargeableWeight);
  const hasWeightSummary =
    (Number.isFinite(actualWeight) && actualWeight > 0) ||
    (Number.isFinite(volumetricWeight) && volumetricWeight > 0) ||
    (Number.isFinite(chargeableWeight) && chargeableWeight > 0);

  const formatKg = (value) =>
    `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 6 })} kg`;

  return (
    <div className="bg-surface-elevated rounded-xl p-6 border border-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold font-['Oswald']">{heading}</h3>
          {isDraft && quotation.expiredAt ? (
            <p className="text-xs text-subtle mt-1">
              Hết hạn tạm tính: {formatConsignmentDate(quotation.expiredAt)}
            </p>
          ) : null}
        </div>
        <p className="text-xl font-black text-primary font-['Oswald']">
          {formatQuotationMoney(quotation)}
        </p>
      </div>

      {hasWeightSummary ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="text-muted text-xs font-semibold uppercase tracking-wide mb-1">
            Cân thực → DIM → Tính phí
          </p>
          <p className="font-semibold text-ink leading-snug">
            {Number.isFinite(actualWeight) && actualWeight > 0 ? `${formatKg(actualWeight)} thực` : "— thực"}
            {Number.isFinite(volumetricWeight) && volumetricWeight >= 0 ? (
              <>
                {" · "}
                <span className="text-muted font-normal">DIM {formatKg(volumetricWeight)}</span>
              </>
            ) : null}
            {Number.isFinite(chargeableWeight) && chargeableWeight > 0 ? (
              <>
                {" → "}
                <span className="text-primary">{formatKg(chargeableWeight)}</span> tính phí
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {lines.length ? (
        <ul className="space-y-2 text-sm">
          {lines.map((line, index) => (
            <li
              key={`${line.label}-${index}`}
              className="flex items-center justify-between gap-4 border-b border-surface-muted/60 pb-2 last:border-0"
            >
              <span className="text-ink">{line.label}</span>
              <span className="font-semibold text-ink">{formatQuotationMoney(quotation, line.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="rounded-lg border border-border-muted bg-surface/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-sm">
        <p className="font-semibold text-ink">Hệ số quy đổi thể tích</p>
        <p className="text-muted">
          DIM = (Dài × Rộng × Cao cm) ÷{" "}
          <span className="font-mono font-bold text-ink">
            {Number(volumetricDivisor).toLocaleString("vi-VN")}
          </span>
          {volumetricDivisorRule ? (
            <span className="text-xs">
              {" "}
              · từ quy tắc {volumetricDivisorRule.code || "VOLUMETRIC_DIVISOR"}
            </span>
          ) : (
            <span className="text-xs">
              {" "}
              · mặc định IATA {VOLUMETRIC_DIVISOR_CM3.toLocaleString("vi-VN")}
            </span>
          )}
          . Cước theo MAX(cân thực, DIM).
        </p>
      </div>

      {quotation.salesNote ? (
        <p className="text-sm text-subtle">
          <span className="font-semibold text-ink">Ghi chú tư vấn:</span> {quotation.salesNote}
        </p>
      ) : null}
      {quotation.rejectionReason ? (
        <p className="text-sm text-danger">
          <span className="font-semibold">Lý do khách từ chối:</span> {quotation.rejectionReason}
        </p>
      ) : null}
    </div>
  );
}

export default function ConsignmentDetailPanel({
  id,
  backHref = ROUTES.sales.consignments,
  readOnly = false,
  quotationHref,
}) {
  const [detail, setDetail] = useState(null);
  const [feeCatalog, setFeeCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectValidation, setRejectValidation] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvedTrackingCode, setApprovedTrackingCode] = useState(null);

  const canSendQuotation =
    detail && !readOnly ? canStaffSendConsignmentQuotation(detail) : false;
  const canApprove = detail && !readOnly ? canStaffUpdateConsignmentStatus(detail.status) : false;
  const canReject = detail && !readOnly ? canStaffRejectConsignmentStatus(detail.status) : false;
  const isSubmitting = isApproving || isRejecting;
  const trackingCode = approvedTrackingCode || detail?.trackingCode;
  const displayCode = detail ? formatConsignmentDisplayCode(detail) : null;

  const volumetricDivisor = useMemo(
    () => resolveVolumetricDivisor(feeCatalog),
    [feeCatalog]
  );
  const volumetricDivisorRule = useMemo(
    () => feeCatalog.find(isVolumetricDivisorRule) ?? null,
    [feeCatalog]
  );

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");
      setActionError("");
      setSuccessMessage("");
      setApprovedTrackingCode(null);
      setRejectionReason("");
      setRejectValidation("");

      try {
        const [data, fees] = await Promise.all([
          orderConsignmentService.getStaffConsignment(id),
          fetchActiveAdditionalFees().catch(() => []),
        ]);
        if (!active) return;
        setDetail(data);
        setFeeCatalog(Array.isArray(fees) ? fees : []);
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

  function applyUpdatedConsignment(next, message, tracking) {
    setDetail(next);
    setSuccessMessage(message);
    setActionError("");
    setRejectValidation("");
    if (tracking) setApprovedTrackingCode(tracking);
  }

  async function handleApprove() {
    if (!detail || !canApprove || isSubmitting) return;

    setIsApproving(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const response = await orderConsignmentService.updateStaffConsignmentStatus(detail.id, {
        status: "APPROVED",
      });
      const updated = response.consignment ?? {
        ...detail,
        status: response.status ?? "APPROVED",
        trackingCode: response.trackingCode ?? response.shipmentCode,
      };
      const code = response.trackingCode ?? response.shipmentCode ?? updated.trackingCode;
      applyUpdatedConsignment(
        updated,
        response.message || "Duyệt yêu cầu thành công.",
        code
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsApproving(false);
    }
  }

  async function handleReject() {
    if (!detail || !canReject || isSubmitting) return;

    const reason = rejectionReason.trim();
    if (!reason) {
      setRejectValidation("Vui lòng nhập lý do từ chối.");
      return;
    }

    setIsRejecting(true);
    setActionError("");
    setSuccessMessage("");
    setRejectValidation("");

    try {
      const response = await orderConsignmentService.updateStaffConsignmentStatus(detail.id, {
        status: "REJECTED",
        rejectionReason: reason,
      });
      const updated = response.consignment ?? {
        ...detail,
        status: response.status ?? "REJECTED",
        rejectionReason: response.rejectionReason ?? reason,
      };
      applyUpdatedConsignment(
        updated,
        response.message || "Đã từ chối yêu cầu ký gửi."
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setIsRejecting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"
      >
        <Icon icon="lucide:arrow-left" className="w-4 h-4" />
        Quay lại danh sách ký gửi
      </Link>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted gap-2">
          <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Đang tải chi tiết...</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : detail ? (
        <>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-1">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-subtle">Mã ký gửi</p>
              <div className="mt-1 flex items-center gap-2 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-deep font-mono truncate">
                  {displayCode ?? "Yêu cầu ký gửi"}
                </h2>
                {displayCode ? <CopyCodeButton value={displayCode} /> : null}
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 shrink-0">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Trạng thái
              </span>
              <ConsignmentStatusBadge status={detail.status} className="text-sm" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PartySection
              title="Người gửi"
              name={detail.senderName || detail.customerName}
              phone={detail.senderPhone || detail.customer?.phone}
              address={detail.senderAddress || detail.customer?.address}
            />
            <PartySection
              title="Người nhận"
              name={detail.receiverName || detail.customerName}
              phone={detail.receiverPhone || detail.customer?.phone}
              address={detail.receiverAddress || detail.customer?.address}
            />
          </div>

          {successMessage ? (
            <NoticeBanner variant="success" icon="lucide:check-circle">
              <p className="font-semibold">{successMessage}</p>
              {trackingCode && detail.status === "APPROVED" ? (
                <p className="mt-1">
                  Mã gửi hàng: <span className="font-bold">{trackingCode}</span>
                </p>
              ) : null}
            </NoticeBanner>
          ) : null}

          {actionError ? (
            <NoticeBanner variant="error" icon="lucide:alert-circle">
              {actionError}
            </NoticeBanner>
          ) : null}

          <NextStepCard detail={detail} canSendQuotation={canSendQuotation} />

          {!canSendQuotation && detail.quotation ? (
            <div className="bg-surface-elevated rounded-xl border border-border p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold font-['Oswald']">Báo giá</h3>
                <p className="text-sm text-subtle mt-1">
                  Xem lại chi tiết báo giá đã lập cho yêu cầu này.
                </p>
              </div>
              <Link
                href={quotationHref ?? ROUTES.sales.consignmentQuotation(detail.id)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg border-2 border-primary bg-surface-elevated text-secondary text-sm font-bold hover:bg-surface-tint transition-colors"
              >
                <Icon icon="lucide:file-text" className="w-4 h-4" />
                Xem chi tiết báo giá
              </Link>
            </div>
          ) : null}

          {detail.status === "QUOTATION_SENT" ? (
            <NoticeBanner variant="info" icon="lucide:hourglass">
              Báo giá đã gửi cho khách. Đang chờ khách <strong>xác nhận hoặc từ chối</strong> báo
              giá — bạn chưa thể duyệt yêu cầu lúc này.
            </NoticeBanner>
          ) : null}

          {detail.status === "QUOTATION_REJECTED" ? (
            <NoticeBanner variant="warning" icon="lucide:x-circle">
              Khách đã từ chối báo giá
              {detail.quotation?.rejectionReason ? (
                <>
                  {": "}
                  <span className="font-semibold">{detail.quotation.rejectionReason}</span>
                </>
              ) : null}
              . Bạn có thể gửi báo giá mới nếu thỏa thuận lại với khách.
            </NoticeBanner>
          ) : null}

          {detail.status === "QUOTATION_CONFIRMED" ? (
            <NoticeBanner variant="success" icon="lucide:check-circle">
              Khách đã xác nhận báo giá. Bạn có thể duyệt yêu cầu và tạo phiếu nhập kho.
            </NoticeBanner>
          ) : null}

          {detail.status === "WAITING_DEPOSIT" || detail.status === "WAITING_PAYMENT" ? (
            <NoticeBanner variant="warning" icon="lucide:wallet">
              Khách đã xác nhận báo giá và đang <strong>thanh toán đặt cọc</strong>. Chờ PayOS
              xác nhận — sau khi thanh toán thành công đơn sẽ chuyển sang{" "}
              <strong>Đã thanh toán đặt cọc</strong>.
            </NoticeBanner>
          ) : null}

          {detail.status === "DEPOSIT_PAID" ? (
            <NoticeBanner variant="success" icon="lucide:badge-check">
              Khách đã thanh toán đặt cọc. Bạn có thể duyệt yêu cầu và tạo phiếu nhập kho.
            </NoticeBanner>
          ) : null}

          {detail.items?.length ? (
            <ConsignmentProductsTable
              items={detail.items}
              volumetricDivisor={volumetricDivisor}
            />
          ) : null}

          <div className="bg-surface-elevated rounded-xl p-6 border border-border space-y-4">
            <h3 className="text-lg font-extrabold font-['Oswald'] mb-2">Thông tin yêu cầu</h3>
            <dl>
              {displayCode ? <DetailRow label="Mã yêu cầu" value={displayCode} /> : null}
              <DetailRow
                label="Loại ký gửi"
                value={formatConsignmentTypeLabel(detail)}
              />
              <DetailRow
                label="Trạng thái"
                value={CONSIGNMENT_STATUS_LABELS[detail.status] || detail.status}
              />
              <DetailRow label="Ngày tạo" value={formatConsignmentDate(detail.createdAt)} />
              {detail.route ? <DetailRow label="Tuyến" value={detail.route} /> : null}
              {detail.totalWeight != null ? (
                <DetailRow label="Tổng khối lượng" value={`${detail.totalWeight} kg`} />
              ) : null}
              {(() => {
                const volumeCm3 = resolveConsignmentTotalVolumeCm3({
                  totalVolume: detail.totalVolume,
                  totalVolumeM3: detail.totalVolumeM3,
                });
                return volumeCm3 != null ? (
                  <DetailRow label="Tổng thể tích" value={formatVolumeCm3(volumeCm3)} />
                ) : null;
              })()}
          {detail.packageCount != null ? (
            <DetailRow label="Số kiện" value={String(detail.packageCount)} />
          ) : null}
              {!detail.items?.length && detail.productName ? (
                <DetailRow label="Sản phẩm" value={detail.productName} />
              ) : null}
              {detail.quantity != null && !detail.items?.length ? (
                <DetailRow label="Số lượng" value={String(detail.quantity)} />
              ) : null}
              {detail.requiresInspection ? (
                <DetailRow label="Kiểm đếm" value="Có" />
              ) : null}
              {detail.destination ? (
                <DetailRow label="Điểm đến" value={detail.destination} />
              ) : null}
              {detail.notes ? <DetailRow label="Ghi chú đơn hàng" value={detail.notes} /> : null}
              {trackingCode ? <DetailRow label="Mã gửi hàng" value={trackingCode} /> : null}
              {detail.rejectionReason ? (
                <DetailRow label="Lý do từ chối" value={detail.rejectionReason} />
              ) : null}
            </dl>
          </div>

          {detail.quotation ? (
            <QuotationSummary
              quotation={detail.quotation}
              volumetricDivisor={volumetricDivisor}
              volumetricDivisorRule={volumetricDivisorRule}
            />
          ) : null}

          {!readOnly && detail.status === "APPROVED" ? (
            <div className="bg-surface-elevated rounded-xl border border-secondary p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold font-['Oswald']">Phiếu tiếp nhận kho</h3>
                <p className="text-sm text-subtle mt-1">
                  Gửi phiếu tiếp nhận online — kho nhận và xử lý trực tiếp trên hệ thống.
                </p>
              </div>
              <Link
                href={ROUTES.sales.receivingNote(detail.id)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-secondary text-accent-subtle text-sm font-bold hover:bg-primary transition-colors"
              >
                <Icon icon="lucide:send" className="w-4 h-4" />
                Gửi / xem phiếu tiếp nhận
              </Link>
            </div>
          ) : null}

          {canApprove || canReject ? (
            <div className="bg-surface-elevated rounded-xl border border-border p-6 space-y-5">
              <h3 className="text-lg font-extrabold font-['Oswald']">Xử lý yêu cầu</h3>

              {canApprove ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleApprove}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-secondary text-accent-subtle text-sm font-bold hover:bg-primary disabled:opacity-60 transition-colors"
                  >
                    {isApproving ? (
                      <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon icon="lucide:check" className="w-4 h-4" />
                    )}
                    {isApproving ? "Đang duyệt..." : "Duyệt yêu cầu"}
                  </button>
                </div>
              ) : null}

              {canReject ? (
                <div className="space-y-3">
                  <p className="text-sm text-subtle">
                    Từ chối yêu cầu khi hàng không đủ điều kiện ký gửi (trước khi gửi báo giá).
                  </p>
                  <label htmlFor="rejectionReason" className="text-sm font-bold text-ink">
                    Lý do từ chối <span className="text-secondary">*</span>
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(event) => {
                      setRejectionReason(event.target.value);
                      if (rejectValidation) setRejectValidation("");
                    }}
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Nhập lý do để khách hàng biết vì sao yêu cầu bị từ chối..."
                    className="w-full px-4 py-3 rounded-lg border border-surface-muted text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                  {rejectValidation ? (
                    <p className="text-sm text-secondary font-semibold">{rejectValidation}</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleReject}
                    className="btn-destructive"
                  >
                    {isRejecting ? (
                      <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon icon="lucide:x" className="w-4 h-4" />
                    )}
                    {isRejecting ? "Đang từ chối..." : "Từ chối yêu cầu"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            !readOnly &&
            !canSendQuotation &&
            detail.status !== "WAITING_DEPOSIT" &&
            detail.status !== "WAITING_PAYMENT" &&
            detail.status !== "QUOTATION_SENT" && (
              <div className="rounded-lg border border-border-muted bg-surface-muted px-4 py-3 text-sm text-subtle">
                Yêu cầu này không thể cập nhật vì đã hủy, đã nhập kho hoặc đã được xử lý.
              </div>
            )
          )}
        </>
      ) : null}
    </div>
  );
}
