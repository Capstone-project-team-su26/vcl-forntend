"use client";
import styles from "./PurchaseOrderStatusPanel.module.scss";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/utils/customerService";
import * as purchaseOrderService from "@/utils/purchaseOrderService";
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
      className={`${styles.teb7554}  ${
        PURCHASE_ORDER_STATUS_STYLES[status] || "status-badge--surface"
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
  const [detail, setDetail] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
      setSubmitError("");
      setSuccessMessage("");

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
    setSubmitError("");
    setSuccessMessage("");

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

      setSuccessMessage(
        `${response.message || "Cập nhật trạng thái mua hàng thành công."} Trạng thái mới: ${
          PURCHASE_ORDER_STATUS_LABELS[response.status] || response.status
        }.`
      );
    } catch (err) {
      setSubmitError(getErrorMessage(err));
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
      <div className={styles.t9ad5d8}>
        <Icon icon="lucide:loader-2" className={styles.t27b8b3} />
        <p className={styles.taaa307}>Đang tải đơn mua hàng...</p>
      </div>
    );
  }

  if (loadError && !detail) {
    return (
      <div className={styles.t3e7ce5}>
        <Link
          href={ROUTES.sales.purchaseRequests}
          className={styles.t025913}
        >
          <Icon icon="lucide:arrow-left" className={styles.t0bfbea} />
          Quay lại
        </Link>
        <div className={styles.te12bff}>
          {loadError}
        </div>
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className={styles.t50a089}>
      <div>
        <Link
          href={resolvedBackHref}
          className={styles.t197bd0}
        >
          <Icon icon="lucide:arrow-left" className={styles.t0bfbea} />
          Quay lại
        </Link>
        <div className={styles.tbccecd}>
          <div>
            <h1 className={styles.t4d16e2}>
              Cập nhật trạng thái mua hàng
            </h1>
            <p className={styles.t466889}>
              Mã đơn mua hàng:{" "}
              <span className={styles.t971bb3}>{detail.purchaseOrderCode}</span>
            </p>
            <p className={styles.tc214d2}>
              Mã yêu cầu mua hộ:{" "}
              <span className={styles.t971bb3}>{detail.requestCode || "—"}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      <section className={styles.t9f221d}>
        Trang này chỉ ghi nhận tiến độ mua hàng với nhà cung cấp. Không xử lý vận chuyển nội địa.
      </section>

      {isWaitingWarehouseReceive(detail.status) ? (
        <section className={styles.te918f5}>
          Đơn mua hàng đã ở trạng thái chờ kho nhận. Có thể chuyển sang quy trình nhập kho.
        </section>
      ) : null}

      {successMessage ? (
        <div className={styles.te918f5}>
          {successMessage}
        </div>
      ) : null}

      {submitError ? (
        <div className={styles.te12bff}>
          {submitError}
        </div>
      ) : null}

      <section className={styles.t726b1d}>
        <h2 className={styles.t2b0cf4}>Thông tin khách hàng</h2>
        <p className={styles.tfc7473}>
          <span className={styles.t9a12f0}>Khách hàng:</span>{" "}
          <span className={styles.t1d3e56}>{detail.customerName}</span>
        </p>
        {customerPhone ? (
          <p className={styles.tfc7473}>
            <span className={styles.t9a12f0}>SĐT:</span>{" "}
            <span className={styles.tf302d3}>{customerPhone}</span>
          </p>
        ) : null}
        {customerEmail ? (
          <p className={styles.tfc7473}>
            <span className={styles.t9a12f0}>Email:</span>{" "}
            <span className={styles.tf302d3}>{customerEmail}</span>
          </p>
        ) : null}
        {detail.supplier ? (
          <p className={styles.tfc7473}>
            <span className={styles.t9a12f0}>Nhà cung cấp:</span>{" "}
            <span className={styles.tf302d3}>{detail.supplier}</span>
          </p>
        ) : null}
        <p className={styles.ta7b499}>
          Ngày tạo đơn: {formatPurchaseOrderDate(detail.createdAt)}
        </p>
      </section>

      <section className={styles.t8ddf6c}>
        <div className={styles.t962254}>
          <h2 className={styles.te817d8}>Sản phẩm cần mua</h2>
        </div>
        <div className={styles.t1384f6}>
          <table className={styles.t8af758}>
            <thead>
              <tr className={styles.t25eccb}>
                <th className={styles.t4bbc2d}>Sản phẩm</th>
                <th className={styles.t4bbc2d}>Link</th>
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
                  <td className={styles.t64604c}>
                    {product.productLink ? (
                      <a
                        href={product.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.t6b5bf7}
                      >
                        Link
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

      <form onSubmit={handleSubmit} className={styles.tb3542e}>
        <section className={styles.tbe759f}>
          <h2 className={styles.te817d8}>Trạng thái mua hàng</h2>

          <div className={styles.t6f7e01}>
            <p className={styles.ta7b499}>Trạng thái hiện tại</p>
            <StatusBadge status={detail.status} />
          </div>

          {canUpdate ? (
            <div className={styles.t6f7e01}>
              <label htmlFor="nextStatus" className={styles.tae03fc}>
                Chuyển sang trạng thái
              </label>
              <select
                id="nextStatus"
                required
                disabled={isSubmitting}
                value={nextStatus}
                onChange={(event) => {
                  setNextStatus(event.target.value);
                  setSubmitError("");
                  setSuccessMessage("");
                }}
                className={`${styles.t37b5e9} input-focus-ring`}
              >
                {allowedStatuses.map((status) => (
                  <option key={status} value={status}>
                    {PURCHASE_ORDER_STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className={styles.ta7b499}>
              {detail.status === "CANCELLED"
                ? "Đơn mua hàng đã bị hủy, không thể cập nhật thêm."
                : "Đơn mua hàng đã hoàn tất bước mua với NCC."}
            </p>
          )}

          <div className={styles.t6f7e01}>
            <label htmlFor="processingNote" className={styles.tae03fc}>
              Ghi chú xử lý
            </label>
            <textarea
              id="processingNote"
              rows={3}
              disabled={!canUpdate || isSubmitting}
              value={processingNote}
              onChange={(event) => {
                setProcessingNote(event.target.value);
                setSubmitError("");
                setSuccessMessage("");
              }}
              placeholder="Ghi chú tiến độ mua hàng với nhà cung cấp..."
              className={`${styles.tbf51c0} input-focus-ring`}
            />
          </div>
        </section>

        {canUpdate ? (
          <section className={styles.t2cf5f2}>
            <p className={styles.ta7b499}>
              Chỉ chọn trạng thái tiếp theo hợp lệ theo quy trình mua hàng với NCC.
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !nextStatus}
              className={styles.t57dbb8}
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className={styles.tc11061} />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Icon icon="lucide:refresh-cw" className={styles.t0bfbea} />
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
