"use client";
import styles from "./PurchaseRequestQuotationPanel.module.scss";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as purchaseRequestService from "@/utils/purchaseRequestService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import VndMoneyInput from "@/app/components/VndMoneyInput";

const {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_STYLES,
  canStaffCreateQuotation,
  calculateQuotationTotal,
  formatQuotationAmount,
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

export default function PurchaseRequestQuotationPanel({
  id,
  backHref,
}) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [itemPrices, setItemPrices] = useState({});
  const [purchaseServiceFee, setPurchaseServiceFee] = useState("");
  const [estimatedShippingFee, setEstimatedShippingFee] = useState("");
  const [quotationNote, setQuotationNote] = useState("");

  const canCreate = detail ? canStaffCreateQuotation(detail.status) : false;

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
        const prices = {};
        for (const item of data.items) {
          const quotedLine = data.quotation?.items?.find((row) => row.itemId === item.id);
          const price = quotedLine?.unitPrice ?? item.unitPrice;
          prices[item.id] =
            price != null && price !== "" ? String(price) : "";
        }
        setItemPrices(prices);
        setPurchaseServiceFee(
          data.quotation?.purchaseServiceFee != null
            ? String(data.quotation.purchaseServiceFee)
            : ""
        );
        setEstimatedShippingFee(
          data.quotation?.estimatedShippingFee != null
            ? String(data.quotation.estimatedShippingFee)
            : ""
        );
        setQuotationNote(data.quotation?.quotationNote ?? "");
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

  const quotationItems = useMemo(() => {
    if (!detail) return [];
    return detail.items.map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
      unitPrice: itemPrices[item.id] ?? "",
    }));
  }, [detail, itemPrices]);

  const totalAmount = useMemo(
    () =>
      calculateQuotationTotal({
        items: quotationItems,
        purchaseServiceFee,
        estimatedShippingFee,
      }),
    [quotationItems, purchaseServiceFee, estimatedShippingFee]
  );

  function updateItemPrice(itemId, value) {
    setItemPrices((current) => ({ ...current, [itemId]: value }));
    setSubmitError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!detail || !canCreate || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const response = await purchaseRequestService.createPurchaseRequestQuotation(detail.id, {
        items: quotationItems,
        purchaseServiceFee,
        estimatedShippingFee,
        quotationNote,
      });

      const updated = response.purchaseRequest;
      if (updated) {
        setDetail(updated);
        if (updated.quotation) {
          setPurchaseServiceFee(String(updated.quotation.purchaseServiceFee ?? ""));
          setEstimatedShippingFee(
            updated.quotation.estimatedShippingFee != null
              ? String(updated.quotation.estimatedShippingFee)
              : ""
          );
          setQuotationNote(updated.quotation.quotationNote ?? "");
        }
      }

      setSuccessMessage(
        `${response.message || "Gửi báo giá thành công."} Trạng thái: ${
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
              Tạo báo giá mua hộ
            </h1>
            <p className={styles.t466889}>
              Mã yêu cầu:{" "}
              <span className={styles.t971bb3}>{detail.requestCode}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {!canCreate && detail.status !== "QUOTED" ? (
        <div className={styles.tafd124}>
          Yêu cầu không ở trạng thái hợp lệ để tạo báo giá. Cần nhận xử lý yêu cầu (
          <span className={styles.te83a70}>IN_REVIEW</span>) trước khi báo giá.
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

      <section className={styles.td78253}>
        <h2 className={styles.tdc4033}>Thông tin khách hàng</h2>
        <p className={styles.tfc7473}>
          <span className={styles.t9a12f0}>Khách hàng:</span>{" "}
          <span className={styles.t1d3e56}>{detail.customerName}</span>
        </p>
      </section>

      <form onSubmit={handleSubmit} className={styles.t793f9e}>
        <section className={styles.t8ddf6c}>
          <div className={styles.t962254}>
            <h2 className={styles.te817d8}>Chi phí sản phẩm</h2>
          </div>
          <div className={styles.t1384f6}>
            <table className={styles.t8af758}>
              <thead>
                <tr className={styles.t25eccb}>
                  <th className={styles.t4bbc2d}>Sản phẩm</th>
                  <th className={styles.t4bbc2d}>Link</th>
                  <th className={styles.t4bbc2d}>SL</th>
                  <th className={styles.t4bbc2d}>Giá/SP (VND)</th>
                  <th className={styles.tb2bb68}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((product) => {
                  const unitPrice = Number(itemPrices[product.id]) || 0;
                  const lineTotal = unitPrice * (product.quantity || 0);

                  return (
                    <tr
                      key={product.id}
                      className={styles.t85eb24}
                    >
                      <td className={styles.t9bba71}>
                        <p className={styles.t1d3e56}>{product.productName}</p>
                        {product.attributes ? (
                          <p className={styles.t5e4cbe}>{product.attributes}</p>
                        ) : null}
                      </td>
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
                      <td className={styles.t9bba71}>
                        <VndMoneyInput
                          required
                          disabled={!canCreate || isSubmitting || detail.status === "QUOTED"}
                          value={itemPrices[product.id] ?? ""}
                          onChange={(value) => updateItemPrice(product.id, value)}
                          placeholder="0"
                          className={`${styles.t5c08af} input-focus-ring`}
                        />
                      </td>
                      <td className={styles.t66299a}>
                        {formatQuotationAmount(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.tac7f04}>
          <div className={styles.t6f7e01}>
            <label htmlFor="purchaseServiceFee" className={styles.tae03fc}>
              Phí mua hộ (VND)
            </label>
            <VndMoneyInput
              id="purchaseServiceFee"
              value={purchaseServiceFee}
              required
              disabled={!canCreate || isSubmitting || detail.status === "QUOTED"}
              onChange={(value) => {
                setPurchaseServiceFee(value);
                setSubmitError("");
                setSuccessMessage("");
              }}
              placeholder="VD: 150.000"
            />
          </div>
          <div className={styles.t6f7e01}>
            <label htmlFor="estimatedShippingFee" className={styles.tae03fc}>
              Phí vận chuyển dự kiến (VND)
            </label>
            <VndMoneyInput
              id="estimatedShippingFee"
              value={estimatedShippingFee}
              disabled={!canCreate || isSubmitting || detail.status === "QUOTED"}
              onChange={(value) => {
                setEstimatedShippingFee(value);
                setSubmitError("");
                setSuccessMessage("");
              }}
              placeholder="Tùy chọn"
            />
          </div>
        </section>

        <section className={styles.tbe29b7}>
          <label htmlFor="quotationNote" className={styles.tae03fc}>
            Ghi chú báo giá
          </label>
          <textarea
            id="quotationNote"
            rows={3}
            disabled={!canCreate || isSubmitting || detail.status === "QUOTED"}
            value={quotationNote}
            onChange={(event) => {
              setQuotationNote(event.target.value);
              setSubmitError("");
              setSuccessMessage("");
            }}
            placeholder="Ghi chú gửi kèm báo giá cho Customer..."
            className={`${styles.tbf51c0} input-focus-ring`}
          />
        </section>

        <section className={styles.t2cf5f2}>
          <div>
            <p className={styles.ta7b499}>Tổng tiền báo giá</p>
            <p className={styles.t334ead}>
              {formatQuotationAmount(totalAmount)}
            </p>
          </div>
          <button
            type="submit"
            disabled={!canCreate || isSubmitting || detail.status === "QUOTED"}
            className={styles.tdb7e95}
          >
            {isSubmitting ? (
              <>
                <Icon icon="lucide:loader-2" className={styles.tc11061} />
                Đang gửi báo giá...
              </>
            ) : (
              <>
                <Icon icon="lucide:send" className={styles.t0bfbea} />
                Gửi báo giá
              </>
            )}
          </button>
        </section>
      </form>
    </div>
  );
}
