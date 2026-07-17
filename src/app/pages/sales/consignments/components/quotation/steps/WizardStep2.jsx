"use client";

import { Icon } from "@iconify/react";
import * as pricingService from "@/utils/internationalWarehousePricingService";
import QuotationFieldLabel from "@/app/pages/sales/consignments/components/quotation/QuotationFieldLabel";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationWizard.module.scss";

const { FEE_CODES, formatMoney } = pricingService;

export default function WizardStep2({
  productName,
  selectedWarehouse,
  weightKg,
  volumeCm3,
  packageCount,
  pricingMatrix,
  warehouseId,
  storageMonths,
  setStorageMonths,
  resetSuccessState,
  discountPercent,
  setDiscountPercent,
  feeLines,
  toggleFeeLine,
  updateFeeLineAmount,
  customFees,
  removeCustomFee,
  updateCustomFee,
  addCustomFee,
  QUICK_CUSTOM_FEES,
  salesNote,
  setSalesNote,
  totals,
}) {
  return (
    <div className={styles.stepContent}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tóm tắt yêu cầu</h2>
        <div className={styles.summaryGrid}>
          <div>
            <p className={styles.summaryLabel}>Hàng hóa</p>
            <p className={styles.summaryValue}>{productName}</p>
          </div>
          <div>
            <p className={styles.summaryLabel}>Kho</p>
            <p className={styles.summaryValue}>
              {selectedWarehouse?.flag} {selectedWarehouse?.name}
            </p>
          </div>
          <div>
            <p className={styles.summaryLabel}>Khối lượng</p>
            <p className={styles.summaryValue}>
              {weightKg} kg · {volumeCm3} cm³ · {packageCount} kiện
            </p>
          </div>
        </div>
      </section>

      {pricingMatrix?.allWarehouses?.length ? (
        <section className={styles.refSection}>
          <div className={styles.refHeader}>
            <h2 className={styles.sectionTitle}>Bảng giá kho quốc tế (VND) — tham chiếu</h2>
            <p className={styles.refHint}>
              Cột {selectedWarehouse?.name} được tự động áp dụng. Số tiền dưới đây có thể chỉnh tay.
            </p>
          </div>
          <div className={styles.refTableWrap}>
            <table className={styles.refTable}>
              <thead>
                <tr className={styles.refHead}>
                  <th className={styles.refCell}>Khoản phí</th>
                  <th className={styles.refCell}>Đơn vị</th>
                  {pricingMatrix.allWarehouses.map((warehouse) => (
                    <th
                      key={warehouse.id}
                      className={`${styles.refCell} ${
                        warehouse.id === warehouseId ? styles.refHeadActive : ""
                      }`}
                    >
                      {warehouse.flag} {warehouse.name.replace("Kho ", "")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(FEE_CODES).map((feeCode) => {
                  const sample = pricingMatrix.allWarehouses[0]?.pricing?.[feeCode];
                  if (!sample) return null;

                  return (
                    <tr key={feeCode} className={styles.refRow}>
                      <td className={styles.refCell}>{sample.label}</td>
                      <td className={styles.refCell}>{sample.unit}</td>
                      {pricingMatrix.allWarehouses.map((warehouse) => (
                        <td
                          key={warehouse.id}
                          className={`${styles.refCell} ${
                            warehouse.id === warehouseId ? styles.refCellActive : ""
                          }`}
                        >
                          {formatMoney(Number(warehouse.pricing?.[feeCode]?.rate ?? 0))}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Lập báo giá — chỉnh sửa từng khoản phí</h2>

        <div className={styles.grid}>
          <div className={styles.infoList}>
            <QuotationFieldLabel htmlFor="storageMonths">Số tháng lưu kho</QuotationFieldLabel>
            <input
              id="storageMonths"
              type="number"
              min="1"
              value={storageMonths}
              onChange={(event) => {
                setStorageMonths(event.target.value);
                resetSuccessState();
              }}
              className={`${styles.input} input-focus-ring`}
            />
          </div>
          <div className={styles.infoList}>
            <QuotationFieldLabel htmlFor="discountPercent">Chiết khấu (%)</QuotationFieldLabel>
            <input
              id="discountPercent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={discountPercent}
              onChange={(event) => {
                setDiscountPercent(event.target.value);
                resetSuccessState();
              }}
              className={`${styles.input} input-focus-ring`}
            />
          </div>
        </div>

        <div className={styles.feesTableWrap}>
          <table className={styles.refTable}>
            <thead>
              <tr className={styles.refHead}>
                <th className={`${styles.feesCell} ${styles.feesHeadNarrow}`} />
                <th className={styles.feesCell}>Khoản phí</th>
                <th className={styles.feesCell}>Diễn giải</th>
                <th className={`${styles.feesCell} ${styles.feesHeadRight}`}>Thành tiền (VND)</th>
              </tr>
            </thead>
            <tbody>
              {feeLines.map((line) => (
                <tr key={line.feeCode} className={styles.feesRow}>
                  <td className={styles.feesCell}>
                    <input
                      type="checkbox"
                      checked={line.enabled !== false}
                      onChange={() => toggleFeeLine(line.feeCode)}
                    />
                  </td>
                  <td className={styles.feesCell}>{line.label}</td>
                  <td className={styles.feesCell}>{line.description}</td>
                  <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={line.enabled === false}
                      value={line.amount}
                      onChange={(event) => updateFeeLineAmount(line.feeCode, event.target.value)}
                      className={`${styles.feeInput} input-focus-ring`}
                    />
                  </td>
                </tr>
              ))}
              {customFees.map((fee) => (
                <tr key={fee.id} className={styles.feesRow}>
                  <td className={styles.feesCell}>
                    <button
                      type="button"
                      onClick={() => removeCustomFee(fee.id)}
                      className="btn-delete-icon"
                      aria-label="Xóa phí"
                    >
                      <Icon icon="lucide:trash-2" className={styles.iconSm} />
                    </button>
                  </td>
                  <td className={styles.feesCell}>
                    <input
                      value={fee.label}
                      onChange={(event) => updateCustomFee(fee.id, "label", event.target.value)}
                      className={`${styles.feeInputFull} input-focus-ring`}
                    />
                  </td>
                  <td className={styles.feesCell}>Phí bổ sung</td>
                  <td className={`${styles.feesCell} ${styles.feesCellRight}`}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fee.amount}
                      onChange={(event) => updateCustomFee(fee.id, "amount", event.target.value)}
                      className={`${styles.feeInput} input-focus-ring`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.tfootRow}>
                <td colSpan={3} className={styles.tfootLabel}>
                  Tạm tính
                </td>
                <td className={styles.tfootAmount}>{formatMoney(totals.subtotal)}</td>
              </tr>
              {totals.discount > 0 ? (
                <tr className={styles.tfootRow}>
                  <td colSpan={3} className={styles.tfootLabel}>
                    Chiết khấu ({discountPercent}%)
                  </td>
                  <td className={`${styles.tfootAmount} ${styles.tfootDiscount}`}>
                    -{formatMoney(totals.discount)}
                  </td>
                </tr>
              ) : null}
              <tr className={styles.tfootTotal}>
                <td colSpan={3} className={styles.tfootGrandLabel}>
                  Tổng cộng
                </td>
                <td className={styles.tfootGrand}>{formatMoney(totals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={styles.infoList}>
          <p className={styles.resultName}>Hoặc thêm nhanh:</p>
          <div className={styles.quickActions}>
            {QUICK_CUSTOM_FEES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addCustomFee(preset)}
                className={styles.quickBtn}
              >
                <Icon icon="lucide:plus" className={styles.iconXs} />
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => addCustomFee({ label: "Phí khác", amount: 0 })}
              className={styles.quickBtnPrimary}
            >
              <Icon icon="lucide:plus" className={styles.iconXs} />
              Thêm phí tùy chỉnh
            </button>
          </div>
        </div>

        <div className={styles.infoList}>
          <QuotationFieldLabel htmlFor="salesNote">Ghi chú tư vấn</QuotationFieldLabel>
          <textarea
            id="salesNote"
            rows={3}
            value={salesNote}
            onChange={(event) => setSalesNote(event.target.value)}
            placeholder="Ghi chú gửi kèm báo giá cho khách..."
            className={`${styles.textarea} input-focus-ring`}
          />
        </div>
      </section>
    </div>
  );
}
