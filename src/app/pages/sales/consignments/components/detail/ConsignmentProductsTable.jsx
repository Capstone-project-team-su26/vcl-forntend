import { Icon } from "@iconify/react";
import { isImageReferenceUrl } from "@/utils/orderConsignmentService";
import {
  formatItemDimensions,
  calculateItemDimWeightKg,
  VOLUMETRIC_DIVISOR_CM3,
} from "@/utils/servicePricingService";
import { formatProductTypeLabel } from "@/utils/productTypeService";
import { formatMoney } from "@/utils/consignmentQuotationService";
import styles from "./ConsignmentProductsTable.module.scss";

function shortenReferenceId(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length <= 18) return trimmed;
  return `${trimmed.slice(0, 8)}…${trimmed.slice(-4)}`;
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
  const value = `${dimKg.toLocaleString("vi-VN", { maximumFractionDigits: 6 })} kg`;
  const formula = `(${l}×${w}×${h}) / ${dim.toLocaleString("vi-VN")}`;

  return { value, formula };
}

function ProductColumnHeader({ title, hint, alignRight = false }) {
  return (
    <th className={`${styles.th} ${alignRight ? styles.thRight : ""}`}>
      <span>{title}</span>
      {hint ? <span className={styles.thHint}>{hint}</span> : null}
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

export default function ConsignmentProductsTable({
  items,
  volumetricDivisor = VOLUMETRIC_DIVISOR_CM3,
}) {
  if (!items?.length) return null;

  return (
    <div className={styles.panel}>
      <div>
        <div className={styles.header}>
          <Icon icon="lucide:package" className={styles.headerIcon} />
          <h3 className={styles.title}>Danh sách sản phẩm</h3>
        </div>
        <p className={styles.intro}>
          Có {items.length} dòng sản phẩm trong lô hàng. Trọng lượng là{" "}
          <strong className={styles.ink}>tổng dòng</strong>; kích thước và DIM tính theo{" "}
          <strong className={styles.ink}>từng kiện</strong> (÷{" "}
          {Number(volumetricDivisor).toLocaleString("vi-VN")}).
        </p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headRow}>
              <ProductColumnHeader title="STT" />
              <ProductColumnHeader title="Ảnh" />
              <ProductColumnHeader title="Sản phẩm" />
              <ProductColumnHeader title="SL" hint="kiện" alignRight />
              <ProductColumnHeader title="TL" hint="tổng dòng" alignRight />
              <ProductColumnHeader title="Kích thước" hint="mỗi kiện" alignRight />
              <ProductColumnHeader title="DIM" hint="mỗi kiện" alignRight />
              <ProductColumnHeader title="Giá khai báo" hint="tổng dòng" alignRight />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const thumbUrl =
                item.imageUrls?.[0] ??
                (isImageReferenceUrl(item.referenceUrl) ? item.referenceUrl : null);
              const dimensions = formatItemDimensions(item.length, item.width, item.height);
              const dimDisplay = formatDimDisplay(
                item.length,
                item.width,
                item.height,
                volumetricDivisor
              );
              const weightDisplay = formatItemWeightDisplay(item.weight, item.quantity);
              const productLink =
                item.referenceUrl && !isImageReferenceUrl(item.referenceUrl)
                  ? item.referenceUrl
                  : null;
              const skuLabel = item.domesticTrackingCode
                ? shortenReferenceId(item.domesticTrackingCode)
                : null;
              const productTypeLabel = formatProductTypeLabel(item.productType);
              const showProductType = Boolean(productTypeLabel);

              return (
                <tr key={item.id ?? `${item.productName}-${index}`} className={styles.bodyRow}>
                  <td className={`${styles.cell} ${styles.cellMuted}`}>{index + 1}</td>
                  <td className={styles.cell}>
                    {thumbUrl ? (
                      <a
                        href={thumbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.thumbLink}
                      >
                        <img
                          src={thumbUrl}
                          alt={item.productName || "Ảnh sản phẩm"}
                          className={styles.thumbImg}
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        <Icon icon="lucide:image-off" className={styles.placeholderIcon} />
                      </div>
                    )}
                  </td>
                  <td className={`${styles.cell} ${styles.productCell}`}>
                    <p className={styles.productName}>{item.productName || "—"}</p>
                    {skuLabel ? (
                      <p className={styles.sku} title={item.domesticTrackingCode}>
                        Mã: {skuLabel}
                      </p>
                    ) : null}
                    {showProductType ? (
                      <span className={styles.typeBadge}>{productTypeLabel}</span>
                    ) : null}
                    {productLink ? (
                      <a
                        href={productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.productLink}
                      >
                        <Icon icon="lucide:external-link" className={styles.linkIcon} />
                        Link tham chiếu
                      </a>
                    ) : null}
                  </td>
                  <td className={`${styles.cell} ${styles.textRight} ${styles.ink} ${styles.tabular}`}>
                    {item.quantity ?? "—"}
                  </td>
                  <td className={`${styles.cell} ${styles.textRight}`}>
                    {weightDisplay ? (
                      <div>
                        <p className={`${styles.ink} ${styles.nowrap} ${styles.tabular}`}>
                          {weightDisplay.totalLabel}
                        </p>
                        {weightDisplay.perUnitLabel ? (
                          <p className={`${styles.weightSub} ${styles.nowrap} ${styles.tabular}`}>
                            ≈ {weightDisplay.perUnitLabel}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${styles.cell} ${styles.textRight} ${styles.ink} ${styles.nowrap} ${styles.tabular}`}>
                    {dimensions ?? "—"}
                  </td>
                  <td className={`${styles.cell} ${styles.textRight}`}>
                    {dimDisplay ? (
                      <div>
                        <p className={`${styles.ink} ${styles.tabular}`}>{dimDisplay.value}</p>
                        <p className={styles.dimFormula}>{dimDisplay.formula}</p>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${styles.cell} ${styles.textRight} ${styles.ink} ${styles.nowrap} ${styles.tabular}`}>
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
