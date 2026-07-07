"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import * as consignmentQuotationService from "@/utils/consignmentQuotationService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import { formatVolumeCm3, volumeM3ToCm3, formatItemDimensions, formatItemDimFormula } from "@/utils/servicePricingService";

const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
  canStaffSendConsignmentQuotation,
  canStaffUpdateConsignmentStatus,
  canStaffRejectConsignmentStatus,
  formatConsignmentDate,
  formatConsignmentDisplayCode,
  formatConsignmentPageTitle,
  isImageReferenceUrl,
} = orderConsignmentService;

const {
  formatQuotationMoney,
  getQuotationDisplayLines,
  getConsignmentQuotationHeading,
  isDraftConsignmentQuotation,
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

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <dt className="text-sm font-bold text-muted sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

function ProductColumnHeader({ title, hint, className = "" }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-muted ${className}`}>
      <span className="block">{title}</span>
      {hint ? (
        <span className="block mt-0.5 font-normal normal-case text-[10px] text-muted/80">{hint}</span>
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

function ConsignmentProductsTable({ items }) {
  if (!items?.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] p-6 border border-surface-muted/50 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Icon icon="lucide:package" className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-extrabold font-['Oswald'] text-ink">Danh sách sản phẩm</h3>
        </div>
        <p className="text-sm text-muted mt-1">
          Có {items.length} dòng sản phẩm trong lô hàng. Trọng lượng là <strong className="text-ink">tổng dòng</strong>;
          kích thước và DIM tính theo <strong className="text-ink">từng kiện</strong>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-muted/60">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-muted/80 bg-surface/80">
              <ProductColumnHeader title="STT" />
              <ProductColumnHeader title="Hình ảnh" />
              <ProductColumnHeader title="Sản phẩm" />
              <ProductColumnHeader title="Số lượng" hint="(kiện)" className="text-center" />
              <ProductColumnHeader title="TL thực" hint="(tổng dòng)" />
              <ProductColumnHeader title="Kích thước" hint="(mỗi kiện)" />
              <ProductColumnHeader title="DIM" hint="(mỗi kiện)" />
              <ProductColumnHeader title="Giá trị khai báo" hint="(tổng dòng)" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const thumbUrl =
                item.imageUrls?.[0] ?? (isImageReferenceUrl(item.referenceUrl) ? item.referenceUrl : null);
              const dimensions = formatItemDimensions(item.length, item.width, item.height);
              const dimFormula = formatItemDimFormula(item.length, item.width, item.height);
              const weightDisplay = formatItemWeightDisplay(item.weight, item.quantity);
              const productLink =
                item.referenceUrl && !isImageReferenceUrl(item.referenceUrl) ? item.referenceUrl : null;

              return (
                <tr
                  key={item.id ?? `${item.productName}-${index}`}
                  className="border-b border-surface-muted/50 last:border-0 align-middle"
                >
                  <td className="px-4 py-4 text-muted font-semibold">{index + 1}</td>
                  <td className="px-4 py-4">
                    {thumbUrl ? (
                      <a
                        href={thumbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-12 h-12 rounded-lg overflow-hidden border border-surface-muted bg-surface"
                      >
                        <img
                          src={thumbUrl}
                          alt={item.productName || "Ảnh sản phẩm"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-dashed border-surface-muted bg-surface flex items-center justify-center">
                        <Icon icon="lucide:image-off" className="w-5 h-5 text-muted" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-ink">{item.productName || "—"}</p>
                    {item.productType ? (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface text-muted border border-surface-muted">
                        {item.productType}
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
                  <td className="px-4 py-4 text-center font-semibold text-ink">
                    {item.quantity ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    {weightDisplay ? (
                      <div>
                        <p className="font-semibold text-ink whitespace-nowrap">{weightDisplay.totalLabel}</p>
                        {weightDisplay.perUnitLabel ? (
                          <p className="text-[11px] text-muted mt-0.5 whitespace-nowrap">
                            ≈ {weightDisplay.perUnitLabel}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-ink whitespace-nowrap">{dimensions ?? "—"}</td>
                  <td className="px-4 py-4 text-ink">
                    {dimFormula ? (
                      <span className="font-mono text-[13px] leading-snug">{dimFormula}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-4 text-ink whitespace-nowrap">
                    {item.declaredValue != null
                      ? `${Number(item.declaredValue).toLocaleString("vi-VN")} đ`
                      : "—"}
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

function QuotationSummary({ quotation }) {
  if (!quotation) return null;

  const lines = getQuotationDisplayLines(quotation);
  const heading = getConsignmentQuotationHeading(quotation);
  const isDraft = isDraftConsignmentQuotation(quotation);

  return (
    <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] p-6 border border-surface-muted/50 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold font-['Oswald']">{heading}</h3>
          {isDraft && quotation.expiredAt ? (
            <p className="text-xs text-muted mt-1">
              Hết hạn tạm tính: {formatConsignmentDate(quotation.expiredAt)}
            </p>
          ) : null}
        </div>
        <p className="text-xl font-black text-primary font-['Oswald']">
          {formatQuotationMoney(quotation)}
        </p>
      </div>
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
      {quotation.salesNote ? (
        <p className="text-sm text-muted">
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
        const data = await orderConsignmentService.getStaffConsignment(id);
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
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight font-['Oswald']">
                {formatConsignmentPageTitle(detail)}
              </h2>
              <p className="text-muted text-sm mt-2">
                Yêu cầu ký gửi của{" "}
                <span className="font-bold text-ink">{detail.customerName}</span>
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Trạng thái hiện tại
              </span>
              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold ${
                  CONSIGNMENT_STATUS_STYLES[detail.status] || "bg-surface text-muted"
                }`}
              >
                {CONSIGNMENT_STATUS_LABELS[detail.status] || detail.status}
              </span>
            </div>
          </div>

          {successMessage ? (
            <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
              <p className="font-semibold">{successMessage}</p>
              {trackingCode && detail.status === "APPROVED" ? (
                <p className="mt-1">
                  Mã gửi hàng:{" "}
                  <span className="font-bold text-ink">{trackingCode}</span>
                </p>
              ) : null}
            </div>
          ) : null}

          {actionError ? (
            <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {actionError}
            </div>
          ) : null}

          {canSendQuotation ? (
            <div className="bg-white rounded-xl border border-primary/20 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold font-['Oswald']">Bước tiếp theo</h3>
                <p className="text-sm text-muted mt-1">
                  {detail.status === "QUOTATION_REJECTED"
                    ? "Khách đã từ chối báo giá trước đó. Sales có thể tư vấn và gửi báo giá mới."
                    : detail.quotation && isDraftConsignmentQuotation(detail.quotation)
                      ? "Đã có báo giá tạm tính từ hệ thống. Sales kiểm tra, chỉnh phí và gửi cho khách."
                      : "Khách đã gửi yêu cầu. Sales tư vấn, chỉnh phí và gửi báo giá."}
                </p>
              </div>
              <Link
                href={ROUTES.sales.consignmentQuotation(detail.id)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Icon icon="lucide:calculator" className="w-4 h-4" />
                {detail.status === "QUOTATION_REJECTED"
                  ? "Gửi báo giá mới"
                  : "Tư vấn & báo giá"}
              </Link>
            </div>
          ) : detail.quotation ? (
            <div className="bg-white rounded-xl border border-surface-muted p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold font-['Oswald']">Báo giá</h3>
                <p className="text-sm text-muted mt-1">
                  Xem lại chi tiết báo giá đã lập cho yêu cầu này.
                </p>
              </div>
              <Link
                href={quotationHref ?? ROUTES.sales.consignmentQuotation(detail.id)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg border border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
              >
                <Icon icon="lucide:file-text" className="w-4 h-4" />
                Xem chi tiết báo giá
              </Link>
            </div>
          ) : null}

          {detail.status === "QUOTATION_SENT" ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-ink">
              Báo giá đã gửi cho khách. Đang chờ khách <strong>xác nhận hoặc từ chối</strong> báo
              giá — Sales chưa thể duyệt yêu cầu lúc này.
            </div>
          ) : null}

          {detail.status === "QUOTATION_REJECTED" ? (
            <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              Khách đã từ chối báo giá
              {detail.quotation?.rejectionReason ? (
                <>
                  {": "}
                  <span className="font-medium text-ink">{detail.quotation.rejectionReason}</span>
                </>
              ) : null}
              . Sales có thể gửi báo giá mới nếu thỏa thuận lại với khách.
            </div>
          ) : null}

          {detail.status === "QUOTATION_CONFIRMED" ? (
            <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
              Khách đã xác nhận báo giá. Sales có thể duyệt yêu cầu và tạo phiếu nhập kho.
            </div>
          ) : null}

          {detail.items?.length ? (
            <ConsignmentProductsTable items={detail.items} />
          ) : null}

          <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] p-6 border border-surface-muted/50">
            <h3 className="text-lg font-extrabold font-['Oswald'] mb-2">Thông tin yêu cầu</h3>
            <dl>
              {displayCode ? <DetailRow label="Mã yêu cầu" value={displayCode} /> : null}
              <DetailRow label="Tên khách hàng" value={detail.customerName} />
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
              {detail.totalVolume != null ? (
                <DetailRow
                  label="Tổng thể tích"
                  value={formatVolumeCm3(volumeM3ToCm3(detail.totalVolume))}
                />
              ) : null}
              {detail.packageCount != null ? (
                <DetailRow label="Số kiện" value={String(detail.packageCount)} />
              ) : null}
              {!detail.items?.length && detail.productName ? (
                <DetailRow label="Sản phẩm" value={detail.productName} />
              ) : null}
              {detail.quantity != null && !detail.items?.length ? (
                <DetailRow label="Số lượng" value={String(detail.quantity)} />
              ) : null}
              {detail.receiverName ? (
                <DetailRow label="Người nhận" value={detail.receiverName} />
              ) : null}
              {detail.receiverPhone ? (
                <DetailRow label="SĐT người nhận" value={detail.receiverPhone} />
              ) : null}
              {detail.receiverAddress ? (
                <DetailRow label="Địa chỉ nhận" value={detail.receiverAddress} />
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

          {detail.quotation ? <QuotationSummary quotation={detail.quotation} /> : null}

          {!readOnly && detail.status === "APPROVED" ? (
            <div className="bg-white rounded-xl border border-secondary/20 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold font-['Oswald']">Phiếu tiếp nhận kho</h3>
                <p className="text-sm text-muted mt-1">
                  Gửi phiếu tiếp nhận online — kho nhận và xử lý trực tiếp trên hệ thống.
                </p>
              </div>
              <Link
                href={ROUTES.sales.receivingNote(detail.id)}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-secondary text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Icon icon="lucide:send" className="w-4 h-4" />
                Gửi / xem phiếu tiếp nhận
              </Link>
            </div>
          ) : null}

          {canApprove || canReject ? (
            <div className="bg-white rounded-xl border border-surface-muted p-6 space-y-5">
              <h3 className="text-lg font-extrabold font-['Oswald']">Xử lý yêu cầu</h3>

              {canApprove ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleApprove}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-success text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
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
                  <p className="text-sm text-muted">
                    Từ chối yêu cầu khi hàng không đủ điều kiện ký gửi (trước khi gửi báo giá).
                  </p>
                  <label htmlFor="rejectionReason" className="text-sm font-bold text-ink">
                    Lý do từ chối <span className="text-danger">*</span>
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
                    <p className="text-sm text-danger">{rejectValidation}</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleReject}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-danger/40 text-danger text-sm font-bold hover:bg-danger/5 disabled:opacity-60 transition-colors"
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
            !canSendQuotation && (
              <div className="rounded-lg border border-surface-muted bg-surface px-4 py-3 text-sm text-muted">
                Yêu cầu này không thể cập nhật vì đã hủy, đã nhập kho hoặc đã được xử lý.
              </div>
            )
          )}
        </>
      ) : null}
    </div>
  );
}
