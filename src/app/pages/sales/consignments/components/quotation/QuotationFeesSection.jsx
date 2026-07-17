"use client";

import { Icon } from "@iconify/react";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import QuotationFieldLabel from "@/app/pages/sales/consignments/components/quotation/QuotationFieldLabel";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationPanel.module.scss";

export default function QuotationFeesSection({
  canSend,
  reloadBasePricing,
  discountPercent,
  setDiscountPercent,
  resetSubmitState,
  hasConfiguredPricing,
  selectedServicePricing,
  formatMainServiceUnitPrice,
  chargeableWeight,
  formatKgLabel,
  formatMoney,
  mainServiceAmount,
  additionalFeeLines,
  toggleAdditionalFee,
  updateAdditionalFeeQuantity,
  customFees,
  removeCustomFee,
  updateCustomFee,
  totals,
  formatVatRatePercent,
  vatRate,
  addCustomFee,
  QUICK_CUSTOM_FEES,
}) {
  return (
    <section className={styles.card}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle}>Lập báo giá — chỉnh sửa từng khoản phí</h2>
          <p className={styles.sectionHint}>
            Dịch vụ chính và phí bắt buộc bị khóa. Sales bật/tắt phụ phí và chỉnh{" "}
            <strong>số lượng</strong> — thành tiền tự tính theo đơn giá.
          </p>
        </div>
        {canSend ? (
          <button type="button" onClick={reloadBasePricing} className={styles.reloadBtn}>
            <Icon icon="lucide:rotate-ccw" className={styles.iconXs} />
            Tải lại biểu phí gốc
          </button>
        ) : null}
      </div>

      <div className={styles.grid}>
        <div className={styles.fieldStack}>
          <QuotationFieldLabel htmlFor="discountPercent">Chiết khấu (%)</QuotationFieldLabel>
          <input
            id="discountPercent"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={discountPercent}
            disabled={!canSend}
            onChange={(e) => {
              setDiscountPercent(e.target.value);
              resetSubmitState();
            }}
            className={`${styles.input} input-focus-ring ${styles.disabledField}`}
          />
        </div>
      </div>

      <div className={styles.feesTableWrap}>
        <table className={styles.feesTable}>
          <thead>
            <tr className={styles.refHead}>
              <th className={`${styles.feesCell} ${styles.feesHeadNarrow}`} />
              <th className={styles.feesCell}>Khoản phí</th>
              <th className={`${styles.feesCell} ${styles.feesCellRight}`}>Đơn giá</th>
              <th className={`${styles.feesCell} ${styles.feesCellCenter}`}>Số lượng</th>
              <th className={`${styles.feesCell} ${styles.feesCellRight}`}>Thành tiền (VND)</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`${styles.feesRow} ${styles.feesRowHighlight}`}>
              <td className={styles.feesCell}>
                <Icon icon="lucide:lock" className={styles.iconXs} />
              </td>
              <td className={styles.feesCell}>
                <p className={styles.feeTitle}>Dịch vụ chính (cước ký gửi)</p>
                <span className={styles.feeBadge}>Bắt buộc · khóa</span>
              </td>
              <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                {hasConfiguredPricing
                  ? formatMainServiceUnitPrice(selectedServicePricing).rate
                  : "—"}
              </td>
              <td className={`${styles.feesCell} ${styles.feesCellCenter}`}>
                {chargeableWeight > 0 ? formatKgLabel(chargeableWeight) : "—"}
              </td>
              <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                {formatMoney(mainServiceAmount)}
              </td>
            </tr>
            {additionalFeeLines.map((line) => {
              const isPercentage = line.feeCalculationType === "PERCENTAGE";
              const locked = line.isRequired || !line.quantityEditable;
              const disabled = line.enabled === false;
              return (
                <tr key={line.feeId} className={styles.feesRow}>
                  <td className={styles.feesCell}>
                    <input
                      type="checkbox"
                      checked={!disabled}
                      disabled={line.isRequired || !canSend}
                      onChange={() => toggleAdditionalFee(line.feeId)}
                    />
                  </td>
                  <td className={styles.feesCell}>
                    <p className={styles.feeTitle}>{line.label}</p>
                    {line.isRequired ? (
                      <span className={styles.feeBadge}>Bắt buộc · khóa</span>
                    ) : line.description ? (
                      <p className={styles.feeDesc}>{line.description}</p>
                    ) : null}
                  </td>
                  <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                    {isPercentage
                      ? `${line.unitPrice}%`
                      : line.unitPrice != null
                        ? `${formatMoney(line.unitPrice)}/${line.unitNoun || "đv"}`
                        : "—"}
                  </td>
                  <td className={`${styles.feesCell} ${styles.feesCellCenter}`}>
                    {disabled ? (
                      <span className={styles.summaryLabel}>—</span>
                    ) : isPercentage ? (
                      <span className={styles.hintXs}>theo %</span>
                    ) : canSend && !locked ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={line.quantity ?? ""}
                        onChange={(e) => updateAdditionalFeeQuantity(line.feeId, e.target.value)}
                        className={`${styles.input} ${styles.inputCenter} input-focus-ring`}
                      />
                    ) : (
                      <span className={styles.summaryValue}>
                        {line.quantity ?? "—"} {line.unitNoun || ""}
                      </span>
                    )}
                  </td>
                  <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                    {disabled ? "—" : formatMoney(line.amount)}
                  </td>
                </tr>
              );
            })}
            {customFees.map((fee) => (
              <tr key={fee.id} className={styles.feesRow}>
                <td className={styles.feesCell}>
                  {canSend ? (
                    <button
                      type="button"
                      onClick={() => removeCustomFee(fee.id)}
                      className="btn-delete-icon"
                      aria-label="Xóa phí"
                    >
                      <Icon icon="lucide:trash-2" className={styles.iconSm} />
                    </button>
                  ) : null}
                </td>
                <td className={styles.feesCell}>
                  {canSend ? (
                    <input
                      value={fee.label}
                      onChange={(e) => updateCustomFee(fee.id, "label", e.target.value)}
                      className={`${styles.inputFull} input-focus-ring`}
                    />
                  ) : (
                    <p className={styles.feeTitle}>{fee.label}</p>
                  )}
                  <span className={styles.feeCustomBadge}>Tùy chỉnh</span>
                </td>
                <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                  {canSend ? (
                    <VndMoneyInput
                      value={fee.unitPrice}
                      onChange={(value) => updateCustomFee(fee.id, "unitPrice", value)}
                      className={`${styles.input} ${styles.inputRight} input-focus-ring`}
                    />
                  ) : (
                    <span className={styles.feesCellRight}>{formatMoney(fee.unitPrice)}</span>
                  )}
                </td>
                <td className={`${styles.feesCell} ${styles.feesCellCenter}`}>
                  {canSend ? (
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={fee.quantity ?? ""}
                      onChange={(e) => updateCustomFee(fee.id, "quantity", e.target.value)}
                      className={`${styles.input} ${styles.inputCenter} input-focus-ring`}
                    />
                  ) : (
                    <span className={styles.summaryValue}>{fee.quantity}</span>
                  )}
                </td>
                <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                  {formatMoney((Number(fee.unitPrice) || 0) * (Number(fee.quantity) || 0))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={styles.tfootRow}>
              <td colSpan={4} className={styles.tfootLabel}>
                Tạm tính (cước + phí dịch vụ)
              </td>
              <td className={styles.tfootAmount}>{formatMoney(totals.subtotal)}</td>
            </tr>
            {totals.discount > 0 ? (
              <tr className={styles.tfootRow}>
                <td colSpan={4} className={styles.tfootLabel}>
                  Chiết khấu ({discountPercent}%)
                </td>
                <td className={`${styles.tfootAmount} ${styles.tfootDiscount}`}>
                  -{formatMoney(totals.discount)}
                </td>
              </tr>
            ) : null}
            {totals.importTax > 0 ? (
              <tr className={styles.tfootRow}>
                <td colSpan={4} className={styles.tfootLabel}>
                  Thuế nhập khẩu
                </td>
                <td className={styles.tfootAmount}>{formatMoney(totals.importTax)}</td>
              </tr>
            ) : null}
            {totals.vat > 0 ? (
              <tr className={styles.tfootRow}>
                <td colSpan={4} className={styles.tfootLabel}>
                  VAT ({formatVatRatePercent(totals.vatRate ?? vatRate)})
                </td>
                <td className={styles.tfootAmount}>{formatMoney(totals.vat)}</td>
              </tr>
            ) : null}
            <tr className={styles.tfootTotal}>
              <td colSpan={4} className={styles.tfootTotalLabel}>
                Tổng cộng
              </td>
              <td className={styles.tfootGrand}>{formatMoney(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {canSend ? (
        <div className={styles.feeActions}>
          <button type="button" onClick={() => addCustomFee()} className={styles.addFeeBtn}>
            <Icon icon="lucide:plus" className={styles.iconXs} />
            Thêm khoản phí trống
          </button>
          <span className={styles.quickLabel}>Hoặc thêm nhanh:</span>
          {QUICK_CUSTOM_FEES.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => addCustomFee(label, 0)}
              className={styles.quickFeeBtn}
            >
              <Icon icon="lucide:plus" className={styles.iconXs} />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
