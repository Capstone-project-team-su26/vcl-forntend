"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as purchaseRequestService from "@/modules/purchase-requests";
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
      className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${
        PURCHASE_REQUEST_STATUS_STYLES[status] || "bg-surface text-muted"
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
              Tạo báo giá mua hộ
            </h1>
            <p className="text-muted text-sm font-medium mt-2">
              Mã yêu cầu:{" "}
              <span className="font-mono text-ink">{detail.requestCode}</span>
            </p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {!canCreate && detail.status !== "QUOTED" ? (
        <div className="rounded-lg border border-warning/30 bg-warning-bg/40 px-4 py-3 text-sm text-ink">
          Yêu cầu không ở trạng thái hợp lệ để tạo báo giá. Cần nhận xử lý yêu cầu (
          <span className="font-semibold">IN_REVIEW</span>) trước khi báo giá.
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
          {successMessage}
        </div>
      ) : null}

      {submitError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      ) : null}

      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6">
        <h2 className="text-lg font-bold text-ink mb-3">Thông tin khách hàng</h2>
        <p className="text-sm">
          <span className="text-muted">Khách hàng:</span>{" "}
          <span className="font-semibold text-ink">{detail.customerName}</span>
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-xl border border-border-muted bg-surface-elevated overflow-hidden">
          <div className="px-6 py-4 border-b border-border-muted">
            <h2 className="text-lg font-bold text-ink">Chi phí sản phẩm</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                  <th className="px-6 py-3 font-bold">Sản phẩm</th>
                  <th className="px-6 py-3 font-bold">Link</th>
                  <th className="px-6 py-3 font-bold">SL</th>
                  <th className="px-6 py-3 font-bold">Giá/SP (VND)</th>
                  <th className="px-6 py-3 font-bold text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {detail.items.map((product) => {
                  const unitPrice = Number(itemPrices[product.id]) || 0;
                  const lineTotal = unitPrice * (product.quantity || 0);

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-border-muted/60 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{product.productName}</p>
                        {product.attributes ? (
                          <p className="text-xs text-muted mt-0.5">{product.attributes}</p>
                        ) : null}
                      </td>
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
                      <td className="px-6 py-4">
                        <VndMoneyInput
                          required
                          disabled={!canCreate || isSubmitting || detail.status === "QUOTED"}
                          value={itemPrices[product.id] ?? ""}
                          onChange={(value) => updateItemPrice(product.id, value)}
                          placeholder="0"
                          className="w-28 h-10 px-3 rounded-lg border border-border-muted text-sm input-focus-ring disabled:opacity-60"
                        />
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatQuotationAmount(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="purchaseServiceFee" className="text-sm font-semibold text-ink">
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
          <div className="space-y-2">
            <label htmlFor="estimatedShippingFee" className="text-sm font-semibold text-ink">
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

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-3">
          <label htmlFor="quotationNote" className="text-sm font-semibold text-ink">
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
            className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring min-h-[88px] disabled:opacity-60"
          />
        </section>

        <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Tổng tiền báo giá</p>
            <p className="text-3xl font-black text-ink font-['Oswald']">
              {formatQuotationAmount(totalAmount)}
            </p>
          </div>
          <button
            type="submit"
            disabled={!canCreate || isSubmitting || detail.status === "QUOTED"}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                Đang gửi báo giá...
              </>
            ) : (
              <>
                <Icon icon="lucide:send" className="w-4 h-4" />
                Gửi báo giá
              </>
            )}
          </button>
        </section>
      </form>
    </div>
  );
}
