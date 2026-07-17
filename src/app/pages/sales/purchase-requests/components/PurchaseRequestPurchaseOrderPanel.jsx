"use client";
import styles from "./PurchaseRequestPurchaseOrderPanel.module.scss";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as customerService from "@/utils/customerService";
import * as purchaseRequestService from "@/utils/purchaseRequestService";
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
      className={`${styles.teb7554}  ${
        PURCHASE_REQUEST_STATUS_STYLES[status] || "status-badge--surface"
      }`}
    >
      {PURCHASE_REQUEST_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function PurchaseRequestPurchaseOrderPanel({ id, backHref }) {
  const [detail, setDetail] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
      setSubmitError("");
      setSuccessMessage("");

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
    setSubmitError("");
    setSuccessMessage("");

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

      setSuccessMessage(
        `${response.message || "Tạo đơn mua hàng thành công."} Trạng thái: ${
          PURCHASE_REQUEST_STATUS_LABELS[response.status] || response.status
        }.`
      );
    } catch (err) {
      setSubmitError(getErrorMessage(err));
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
      <div className={styles.t9ad5d8}>
        <Icon icon="lucide:loader-2" className={styles.t27b8b3} />
        <p className={styles.taaa307}>Đang tải yêu cầu mua hộ...</p>
      </div>
    );
  }

  if (loadError && !detail) {
    return (
      <div className={styles.t3e7ce5}>
        <Link
          href={resolvedBackHref}
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
          Quay lại chi tiết yêu cầu
        </Link>
        <div className={styles.tbccecd}>
          <div>
            <h1 className={styles.t4d16e2}>
              Tạo đơn mua hàng
            </h1>
            <p className={styles.t466889}>
              Mã yêu cầu:{" "}
              <span className={styles.t971bb3}>{detail.requestCode}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {!canCreate && !isReadOnly ? (
        <div className={styles.tafd124}>
          Không thể tạo đơn mua hàng. Yêu cầu phải được Customer xác nhận báo giá (
          <span className={styles.te83a70}>CONFIRMED</span>) và chưa có đơn mua hàng.
        </div>
      ) : null}

      {detail.purchaseOrder && !canCreate ? (
        <div className={styles.t688b6b}>
          Yêu cầu này đã có đơn mua hàng{" "}
          <span className={styles.t5c6c1b}>
            {detail.purchaseOrder.purchaseOrderCode}
          </span>
          . Không thể tạo trùng.
        </div>
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
      </section>

      {detail.quotation ? (
        <section className={styles.tf9320b}>
          <h2 className={styles.te817d8}>Báo giá đã xác nhận</h2>
          <p className={styles.ta7b499}>
            Tổng tiền báo giá:{" "}
            <span className={styles.t34b81e}>
              {formatQuotationAmount(detail.quotation.totalAmount)}
            </span>
          </p>
          {detail.quotation.quotationNote ? (
            <p className={styles.ta7b499}>Ghi chú báo giá: {detail.quotation.quotationNote}</p>
          ) : null}
        </section>
      ) : null}

      <form onSubmit={handleSubmit} className={styles.t793f9e}>
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
                  <th className={styles.tb2bb68}>Giá báo giá</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((product) => {
                  const unitPrice = getQuotedUnitPrice(product, detail.quotation);

                  return (
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
                      <td className={styles.t66299a}>
                        {formatQuotationAmount(unitPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.tbe759f}>
          <div className={styles.t6f7e01}>
            <label htmlFor="supplier" className={styles.tae03fc}>
              Nhà cung cấp
            </label>
            <input
              id="supplier"
              type="text"
              disabled={!canCreate || isSubmitting}
              value={supplier}
              onChange={(event) => {
                setSupplier(event.target.value);
                setSubmitError("");
                setSuccessMessage("");
              }}
              placeholder="VD: Amazon US, Apple Store Online..."
              className={`${styles.t37b5e9} input-focus-ring`}
            />
          </div>

          <div className={styles.t6f7e01}>
            <label htmlFor="purchaseNote" className={styles.tae03fc}>
              Ghi chú mua hàng
            </label>
            <textarea
              id="purchaseNote"
              rows={3}
              disabled={!canCreate || isSubmitting}
              value={purchaseNote}
              onChange={(event) => {
                setPurchaseNote(event.target.value);
                setSubmitError("");
                setSuccessMessage("");
              }}
              placeholder="Ghi chú nội bộ cho Buying Team khi đặt hàng với nhà cung cấp..."
              className={`${styles.tbf51c0} input-focus-ring`}
            />
          </div>
        </section>

        {isReadOnly && detail.purchaseOrder ? (
          <section className={styles.t5c48ed}>
            <h2 className={styles.te817d8}>Đơn mua hàng đã tạo</h2>
            <p className={styles.tfc7473}>
              <span className={styles.t9a12f0}>Mã đơn:</span>{" "}
              <span className={styles.tcaaeaf}>
                {detail.purchaseOrder.purchaseOrderCode}
              </span>
            </p>
            <p className={styles.ta7b499}>
              Ngày tạo: {formatPurchaseRequestDate(detail.purchaseOrder.createdAt)}
            </p>
            <Link
              href={ROUTES.sales.purchaseOrderStatus(detail.purchaseOrder.id)}
              className={styles.t1c97e1}
            >
              <Icon icon="lucide:refresh-cw" className={styles.t0bfbea} />
              Cập nhật trạng thái mua hàng
            </Link>
          </section>
        ) : null}

        {canCreate ? (
          <section className={styles.t2cf5f2}>
            <div>
              <p className={styles.ta7b499}>
                Xác nhận bắt đầu xử lý mua hàng với nhà cung cấp theo báo giá đã được Customer
                duyệt.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.t57dbb8}
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className={styles.tc11061} />
                  Đang tạo đơn mua hàng...
                </>
              ) : (
                <>
                  <Icon icon="lucide:shopping-cart" className={styles.t0bfbea} />
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
