"use client";
import styles from "./PurchaseRequestDetailPanel.module.scss";

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
    <div className={styles.tf32257}>
      <dt className={styles.te7ca9b}>{label}</dt>
      <dd className={styles.t1ad995}>{value}</dd>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`${styles.teb7554}  ${
        PURCHASE_REQUEST_STATUS_STYLES[status] || "status-badge--surface"
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
      <div className={styles.t9ad5d8}>
        <Icon icon="lucide:loader-2" className={styles.t27b8b3} />
        <p className={styles.taaa307}>Đang tải yêu cầu mua hộ...</p>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className={styles.t3e7ce5}>
        <Link
          href={backHref}
          className={styles.t025913}
        >
          <Icon icon="lucide:arrow-left" className={styles.t0bfbea} />
          Quay lại danh sách
        </Link>
        <div className={styles.te12bff}>
          {error}
        </div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className={styles.t50a089}>
      <div>
        <Link
          href={backHref}
          className={styles.t197bd0}
        >
          <Icon icon="lucide:arrow-left" className={styles.t0bfbea} />
          Quay lại danh sách
        </Link>
        <div className={styles.tbccecd}>
          <div>
            <h1 className={styles.t4d16e2}>
              Yêu cầu mua hộ
            </h1>
            <p className={styles.t466889}>
              Mã yêu cầu:{" "}
              <span className={styles.t971bb3}>{detail.requestCode}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {successMessage ? (
        <div className={styles.te918f5}>
          {successMessage}
          <p className={styles.t88fac9}>
            Trạng thái mới: {PURCHASE_REQUEST_STATUS_LABELS[detail.status] || detail.status}
          </p>
        </div>
      ) : null}

      {actionError ? (
        <div className={styles.te12bff}>
          {actionError}
        </div>
      ) : null}

      <section className={styles.td78253}>
        <h2 className={styles.t0fe579}>Thông tin yêu cầu</h2>
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

      <section className={styles.t8ddf6c}>
        <div className={styles.t962254}>
          <h2 className={styles.te817d8}>Sản phẩm cần mua</h2>
        </div>
        <div className={styles.t1384f6}>
          <table className={styles.t8af758}>
            <thead>
              <tr className={styles.t25eccb}>
                <th className={styles.t4bbc2d}>Tên sản phẩm</th>
                <th className={styles.t4bbc2d}>Link mua hàng</th>
                <th className={styles.t4bbc2d}>SL</th>
                <th className={styles.t4bbc2d}>Thuộc tính</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((product) => (
                <tr
                  key={product.id}
                  className={styles.t85eb24}
                >
                  <td className={styles.t10617a}>{product.productName}</td>
                  <td className={styles.t9bba71}>
                    {product.productLink ? (
                      <a
                        href={product.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.t950be1}
                      >
                        {product.productLink}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={styles.t9bba71}>{product.quantity}</td>
                  <td className={styles.tb9c0d6}>{product.attributes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {canQuote ? (
        <section className={styles.t2cf5f2}>
          <div>
            <h2 className={styles.te817d8}>Báo giá mua hộ</h2>
            <p className={styles.tfbeb38}>
              Đã kiểm tra sản phẩm — nhập chi phí và gửi báo giá cho khách.
            </p>
          </div>
          <Link
            href={ROUTES.sales.purchaseRequestQuotation(id)}
            className={styles.t17259a}
          >
            <Icon icon="lucide:file-text" className={styles.t0bfbea} />
            Tạo báo giá
          </Link>
        </section>
      ) : null}

      {detail.status === "QUOTED" && detail.quotation ? (
        <section className={styles.t16c1be}>
          <h2 className={styles.te817d8}>Báo giá đã gửi</h2>
          <p className={styles.ta7b499}>
            Tổng tiền:{" "}
            <span className={styles.t34b81e}>
              {formatQuotationAmount(detail.quotation.totalAmount)}
            </span>
          </p>
          {detail.quotation.quotationNote ? (
            <p className={styles.ta7b499}>Ghi chú: {detail.quotation.quotationNote}</p>
          ) : null}
        </section>
      ) : null}

      {detail.status === "CONFIRMED" && detail.quotation ? (
        <section className={styles.t16c1be}>
          <h2 className={styles.te817d8}>Báo giá đã được Customer xác nhận</h2>
          <p className={styles.ta7b499}>
            Tổng tiền:{" "}
            <span className={styles.t34b81e}>
              {formatQuotationAmount(detail.quotation.totalAmount)}
            </span>
          </p>
          {detail.quotation.quotationNote ? (
            <p className={styles.ta7b499}>Ghi chú: {detail.quotation.quotationNote}</p>
          ) : null}
        </section>
      ) : null}

      {canCreatePurchaseOrder ? (
        <section className={styles.t2cf5f2}>
          <div>
            <h2 className={styles.te817d8}>Tạo đơn mua hàng</h2>
            <p className={styles.tfbeb38}>
              Customer đã xác nhận báo giá — ghi nhận bắt đầu mua hàng với nhà cung cấp.
            </p>
          </div>
          <Link
            href={ROUTES.sales.purchaseRequestPurchaseOrder(id)}
            className={styles.t17259a}
          >
            <Icon icon="lucide:shopping-cart" className={styles.t0bfbea} />
            Tạo đơn mua hàng
          </Link>
        </section>
      ) : null}

      {detail.purchaseOrder ? (
        <section className={styles.t17c58b}>
          <h2 className={styles.te817d8}>Đơn mua hàng</h2>
          <p className={styles.tfc7473}>
            <span className={styles.t9a12f0}>Mã đơn:</span>{" "}
            <span className={styles.tcaaeaf}>
              {detail.purchaseOrder.purchaseOrderCode}
            </span>
          </p>
          {detail.purchaseOrder.status ? (
            <p className={styles.tadf401}>
              <span className={styles.t9a12f0}>Trạng thái mua hàng:</span>
              <span
                className={`${styles.t5f03d3}  ${
                  PURCHASE_ORDER_STATUS_STYLES[detail.purchaseOrder.status] ||
                  "status-badge--surface"
                }`}
              >
                {PURCHASE_ORDER_STATUS_LABELS[detail.purchaseOrder.status] ||
                  detail.purchaseOrder.status}
              </span>
            </p>
          ) : null}
          {detail.purchaseOrder.supplier ? (
            <p className={styles.ta7b499}>Nhà cung cấp: {detail.purchaseOrder.supplier}</p>
          ) : null}
          {detail.purchaseOrder.purchaseNote ? (
            <p className={styles.ta7b499}>Ghi chú: {detail.purchaseOrder.purchaseNote}</p>
          ) : null}
          {detail.purchaseOrder.processingNote ? (
            <p className={styles.ta7b499}>
              Ghi chú xử lý: {detail.purchaseOrder.processingNote}
            </p>
          ) : null}
          <p className={styles.ta7b499}>
            Ngày tạo: {formatPurchaseRequestDate(detail.purchaseOrder.createdAt)}
          </p>
          <div className={styles.t5aee4c}>
            <Link
              href={ROUTES.sales.purchaseOrderStatus(detail.purchaseOrder.id)}
              className={styles.t1a0e64}
            >
              {canUpdatePurchaseOrderStatus(detail.purchaseOrder.status ?? "CREATED")
                ? "Cập nhật trạng thái mua hàng"
                : "Xem trạng thái mua hàng"}
              <Icon icon="lucide:arrow-right" className={styles.t0bfbea} />
            </Link>
          </div>
        </section>
      ) : null}

      {canProcess ? (
        <section className={styles.tbe759f}>
          <h2 className={styles.te817d8}>Xử lý yêu cầu</h2>
          <p className={styles.ta7b499}>
            Kiểm tra link sản phẩm và thông tin khách cung cấp trước khi cập nhật trạng thái.
          </p>

          <div className={styles.t6f7e01}>
            <label htmlFor="actionReason" className={styles.tae03fc}>
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
              className={`${styles.t060f71} input-focus-ring`}
            />
            {reasonValidation ? (
              <p className={styles.ta012de}>{reasonValidation}</p>
            ) : null}
          </div>

          <div className={styles.t985955}>
            {canAccept ? (
              <button
                type="button"
                disabled={Boolean(pendingAction)}
                onClick={() => handleStatusUpdate("IN_REVIEW")}
                className={styles.t32fc76}
              >
                {pendingAction === "IN_REVIEW" ? (
                  <Icon icon="lucide:loader-2" className={styles.tc11061} />
                ) : (
                  <Icon icon="lucide:play" className={styles.t0bfbea} />
                )}
                Nhận xử lý
              </button>
            ) : null}
            <button
              type="button"
              disabled={Boolean(pendingAction)}
              onClick={() => handleStatusUpdate("NEED_MORE_INFO")}
              className={styles.t96ea56}
            >
              {pendingAction === "NEED_MORE_INFO" ? (
                <Icon icon="lucide:loader-2" className={styles.tc11061} />
              ) : (
                <Icon icon="lucide:message-circle-question" className={styles.t0bfbea} />
              )}
              Yêu cầu bổ sung thông tin
            </button>
            <button
              type="button"
              disabled={Boolean(pendingAction)}
              onClick={() => handleStatusUpdate("REJECTED")}
              className={`${styles.tdf5daf} btn-destructive`}
            >
              {pendingAction === "REJECTED" ? (
                <Icon icon="lucide:loader-2" className={styles.tc11061} />
              ) : (
                <Icon icon="lucide:x-circle" className={styles.t0bfbea} />
              )}
              Từ chối yêu cầu
            </button>
          </div>
        </section>
      ) : (
        <section className={styles.t9f221d}>
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
