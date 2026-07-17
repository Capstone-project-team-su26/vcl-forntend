"use client";

import { formatFeeAmount } from "@/utils/additionalServiceFeeService";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationPanel.module.scss";

export default function QuotationReferencePricingSection({
  hasConfiguredPricing,
  selectedServicePricing,
  formatMainServiceUnitPrice,
  surchargeFeeCatalog,
  volumetricDivisor,
  volumetricDivisorRule,
  VOLUMETRIC_DIVISOR_CM3,
}) {
  return (
    <section className={styles.refSection}>
      <div className={styles.refHeader}>
        <h2 className={styles.sectionTitle}>Bảng giá tham chiếu (VND)</h2>
        <p className={styles.sectionHint}>
          Đơn giá cấu hình trên hệ thống cho tuyến/dịch vụ này. Số tiền ở bảng lập báo giá bên dưới
          có thể chỉnh tay.
        </p>
      </div>
      <div className={styles.refTableWrap}>
        <table className={styles.refTable}>
          <thead>
            <tr className={styles.refHead}>
              <th className={styles.refCell}>Khoản phí</th>
              <th className={styles.refCell}>Đơn vị</th>
              <th className={`${styles.refCell} ${styles.refHeadRight}`}>Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            {hasConfiguredPricing ? (
              (() => {
                const ref = formatMainServiceUnitPrice(selectedServicePricing);
                return (
                  <tr className={`${styles.refRow} ${styles.refRowHighlight}`}>
                    <td className={styles.refCell}>Dịch vụ chính (cước ký gửi)</td>
                    <td className={styles.refCell}>{ref.unit}</td>
                    <td className={`${styles.refCell} ${styles.refCellPrimary}`}>{ref.rate}</td>
                  </tr>
                );
              })()
            ) : null}
            {surchargeFeeCatalog.map((fee) => (
              <tr key={fee.id} className={styles.refRow}>
                <td className={styles.refCell}>{fee.name}</td>
                <td className={styles.refCell}>{fee.unit || "—"}</td>
                <td className={`${styles.refCell} ${styles.refCellRight}`}>
                  {formatFeeAmount(fee)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.refFooter}>
        <p className={styles.summaryValue}>Hệ số quy đổi thể tích</p>
        <p className={styles.summaryLabel}>
          DIM = thể tích (cm³) ÷{" "}
          <span className={styles.summaryValue}>{volumetricDivisor.toLocaleString("vi-VN")}</span>
          {volumetricDivisorRule ? (
            <span className={styles.hintXs}>
              {" "}
              · từ quy tắc {volumetricDivisorRule.code || "VOLUMETRIC_DIVISOR"}
            </span>
          ) : (
            <span className={styles.hintXs}>
              {" "}
              · mặc định IATA {VOLUMETRIC_DIVISOR_CM3.toLocaleString("vi-VN")}
            </span>
          )}
        </p>
      </div>
    </section>
  );
}
