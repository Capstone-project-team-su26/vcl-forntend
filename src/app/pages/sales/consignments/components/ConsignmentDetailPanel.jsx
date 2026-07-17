"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import ConsignmentProductsTable from "@/app/pages/sales/consignments/components/detail/ConsignmentProductsTable";
import CopyCodeButton from "@/app/pages/sales/consignments/components/detail/CopyCodeButton";
import DetailRow from "@/app/pages/sales/consignments/components/detail/DetailRow";
import NextStepCard from "@/app/pages/sales/consignments/components/detail/NextStepCard";
import NoticeBanner from "@/app/pages/sales/consignments/components/detail/NoticeBanner";
import PartySection from "@/app/pages/sales/consignments/components/detail/PartySection";
import QuotationSummary from "@/app/pages/sales/consignments/components/detail/QuotationSummary";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import { fetchActiveAdditionalFees } from "@/utils/consignmentQuotationService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import {
  formatVolumeCm3,
  resolveConsignmentTotalVolumeCm3,
  resolveVolumetricDivisor,
  isVolumetricDivisorRule,
} from "@/utils/servicePricingService";
import styles from "./ConsignmentDetailPanel.module.scss";

const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  canStaffSendConsignmentQuotation,
  canStaffUpdateConsignmentStatus,
  canStaffRejectConsignmentStatus,
  formatConsignmentDate,
  formatConsignmentDisplayCode,
} = orderConsignmentService;

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
    <div className={styles.root}>
      <Link href={backHref} className={styles.backLink}>
        <Icon icon="lucide:arrow-left" className={styles.iconSm} />
        Quay lại danh sách ký gửi
      </Link>

      {isLoading ? (
        <div className={styles.loading}>
          <Icon icon="lucide:loader-2" className={`${styles.iconMd} ${styles.spin}`} />
          <span>Đang tải chi tiết...</span>
        </div>
      ) : error ? (
        <div className={styles.alertDanger}>{error}</div>
      ) : detail ? (
        <>
          <div className={styles.codeHeader}>
            <div className={styles.codeBlock}>
              <p className={styles.codeLabel}>Mã ký gửi</p>
              <div className={styles.codeRow}>
                <h2 className={styles.code}>{displayCode ?? "Yêu cầu ký gửi"}</h2>
                {displayCode ? <CopyCodeButton value={displayCode} /> : null}
              </div>
            </div>
            <div className={styles.statusBlock}>
              <span className={styles.statusLabel}>Trạng thái</span>
              <ConsignmentStatusBadge
                status={detail.status}
                className={styles.statusBadgeLarge}
              />
            </div>
          </div>

          <div className={styles.partyGrid}>
            <PartySection
              title="Người gửi"
              name={detail.senderName || detail.customerName}
              phone={detail.senderPhone}
              address={detail.senderAddress}
            />
            <PartySection
              title="Người nhận"
              name={detail.receiverName}
              phone={detail.receiverPhone}
              address={detail.receiverAddress}
            />
          </div>

          {successMessage ? (
            <NoticeBanner variant="success" icon="lucide:check-circle">
              <p>{successMessage}</p>
              {trackingCode && detail.status === "APPROVED" ? (
                <p>
                  Mã gửi hàng: <strong>{trackingCode}</strong>
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
            <div className={styles.linkCard}>
              <div>
                <h3 className={styles.linkTitle}>Báo giá</h3>
                <p className={styles.linkBody}>
                  Xem lại chi tiết báo giá đã lập cho yêu cầu này.
                </p>
              </div>
              <Link
                href={quotationHref ?? ROUTES.sales.consignmentQuotation(detail.id)}
                className={styles.outlineBtn}
              >
                <Icon icon="lucide:file-text" className={styles.iconSm} />
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
                  <strong>{detail.quotation.rejectionReason}</strong>
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
            <ConsignmentProductsTable items={detail.items} volumetricDivisor={volumetricDivisor} />
          ) : null}

          <div className={styles.infoPanel}>
            <h3 className={styles.infoTitle}>Thông tin yêu cầu</h3>
            <dl>
              {displayCode ? <DetailRow label="Mã yêu cầu" value={displayCode} /> : null}
              <DetailRow label="Loại ký gửi" value={formatConsignmentTypeLabel(detail)} />
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
                  weightKg: detail.totalWeight,
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
              {detail.requiresInspection ? <DetailRow label="Kiểm đếm" value="Có" /> : null}
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
            <div className={styles.receivingCard}>
              <div>
                <h3 className={styles.linkTitle}>Phiếu tiếp nhận kho</h3>
                <p className={styles.linkBody}>
                  Gửi phiếu tiếp nhận online — kho nhận và xử lý trực tiếp trên hệ thống.
                </p>
              </div>
              <Link href={ROUTES.sales.receivingNote(detail.id)} className={styles.primaryBtn}>
                <Icon icon="lucide:send" className={styles.iconSm} />
                Gửi / xem phiếu tiếp nhận
              </Link>
            </div>
          ) : null}

          {canApprove || canReject ? (
            <div className={styles.actionsPanel}>
              <h3 className={styles.infoTitle}>Xử lý yêu cầu</h3>

              {canApprove ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleApprove}
                  className={styles.primaryBtn}
                >
                  {isApproving ? (
                    <Icon icon="lucide:loader-2" className={`${styles.iconSm} ${styles.spin}`} />
                  ) : (
                    <Icon icon="lucide:check" className={styles.iconSm} />
                  )}
                  {isApproving ? "Đang duyệt..." : "Duyệt yêu cầu"}
                </button>
              ) : null}

              {canReject ? (
                <div className={styles.fieldStack}>
                  <p className={styles.rejectHint}>
                    Từ chối yêu cầu khi hàng không đủ điều kiện ký gửi (trước khi gửi báo giá).
                  </p>
                  <label htmlFor="rejectionReason" className={styles.rejectLabel}>
                    Lý do từ chối <span className={styles.required}>*</span>
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
                    className={`${styles.textarea} input-focus-ring`}
                  />
                  {rejectValidation ? (
                    <p className={styles.rejectValidation}>{rejectValidation}</p>
                  ) : null}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleReject}
                    className="btn-destructive"
                  >
                    {isRejecting ? (
                      <Icon icon="lucide:loader-2" className={`${styles.iconSm} ${styles.spin}`} />
                    ) : (
                      <Icon icon="lucide:x" className={styles.iconSm} />
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
              <div className={styles.inactiveNote}>
                Yêu cầu này không thể cập nhật vì đã hủy, đã nhập kho hoặc đã được xử lý.
              </div>
            )
          )}
        </>
      ) : null}
    </div>
  );
}
