"use client";

import VndMoneyInput from "@/app/components/VndMoneyInput";
import QuotationFieldLabel from "@/app/pages/sales/consignments/components/quotation/QuotationFieldLabel";
import PricingFormulaBreakdown from "@/app/pages/sales/consignments/components/quotation/PricingFormulaBreakdown";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationPanel.module.scss";

export default function QuotationServiceSection({
  availableServiceTypes,
  serviceType,
  weightKg,
  volumeCm3,
  packageCount,
  declaredValue,
  formatServiceTypeLabel,
  showServiceSummary,
  displayRouteLabel,
  volumetricWeight,
  pricingBreakdown,
  chargeableWeight,
  volumetricDivisor,
  formatVolumeCm3,
  selectedServicePricing,
  UNIT_TYPE_LABELS,
  canSend,
  hasConfiguredPricing,
  detail,
  readOnly,
}) {
  return (
    <section className={styles.card}>
      <div>
        <h2 className={styles.sectionTitle}>Thông số & dịch vụ chính</h2>
        <p className={styles.sectionHint}>
          Các thông số lấy từ yêu cầu ký gửi — không chỉnh tại bước báo giá.
        </p>
      </div>
      <div className={styles.grid}>
        <div className={styles.fieldStack}>
          <QuotationFieldLabel htmlFor="serviceType" required>
            Loại dịch vụ
          </QuotationFieldLabel>
          <select
            id="serviceType"
            value={
              availableServiceTypes.some(
                (type) => String(type).toUpperCase() === String(serviceType).toUpperCase()
              )
                ? serviceType
                : availableServiceTypes[0] ?? ""
            }
            disabled
            className={`form-select input-focus-ring ${styles.formSelectDisabled}`}
          >
            {!availableServiceTypes.length ? (
              <option value="">Chưa có bảng giá phù hợp</option>
            ) : null}
            {availableServiceTypes.map((type) => (
              <option key={type} value={type}>
                {formatServiceTypeLabel(type)}
              </option>
            ))}
          </select>
          {!availableServiceTypes.length ? (
            <p className={styles.hintXs}>
              Bảng giá BE chưa có tuyến khớp đơn này — liên hệ Admin cấu hình service-pricings.
            </p>
          ) : null}
        </div>
        <div className={styles.fieldStack}>
          <QuotationFieldLabel htmlFor="weightKg" required>
            Khối lượng (kg)
          </QuotationFieldLabel>
          <input
            id="weightKg"
            type="number"
            min="0.01"
            step="0.01"
            value={weightKg}
            readOnly
            className="quotation-locked-field"
          />
        </div>
        <div className={styles.fieldStack}>
          <QuotationFieldLabel htmlFor="volumeCm3" required>
            Thể tích (cm³)
          </QuotationFieldLabel>
          <input
            id="volumeCm3"
            type="number"
            min="1"
            step="1"
            value={volumeCm3}
            readOnly
            className="quotation-locked-field"
          />
        </div>
        <div className={styles.fieldStack}>
          <QuotationFieldLabel htmlFor="packageCount" required>
            Số kiện
          </QuotationFieldLabel>
          <input
            id="packageCount"
            type="number"
            min="1"
            value={packageCount}
            readOnly
            className="quotation-locked-field"
          />
        </div>
        <div className={styles.fieldStack}>
          <QuotationFieldLabel htmlFor="declaredValue">Giá trị khai báo (VND)</QuotationFieldLabel>
          <VndMoneyInput
            id="declaredValue"
            value={declaredValue}
            disabled
            className="quotation-locked-field"
          />
        </div>
      </div>

      {showServiceSummary ? (
        <div className={styles.serviceSummary}>
          <div>
            <p className={styles.summaryLabel}>Tuyến</p>
            <p className={styles.summaryValue}>{displayRouteLabel}</p>
          </div>
          <div>
            <p className={styles.summaryLabel}>Cân thực → DIM → Tính phí</p>
            <p className={styles.summaryValue}>
              {Number(weightKg) > 0 ? `${weightKg} kg` : "—"} thực
              {volumetricWeight > 0 || pricingBreakdown.volumeCm3 != null ? (
                <>
                  {" · "}
                  <span className={styles.summaryMuted}>DIM {volumetricWeight} kg</span>
                </>
              ) : null}
              {chargeableWeight > 0 ? (
                <>
                  {" → "}
                  <span className={styles.summaryPrimary}>{chargeableWeight} kg</span> tính phí
                </>
              ) : null}
            </p>
            {pricingBreakdown.volumeCm3 != null ? (
              <p className={styles.hintXs}>
                DIM = {formatVolumeCm3(pricingBreakdown.volumeCm3)} ÷{" "}
                {volumetricDivisor.toLocaleString("vi-VN")}
              </p>
            ) : null}
          </div>
          <div>
            <p className={styles.summaryLabel}>Đơn vị tính</p>
            <p className={styles.summaryValue}>
              {selectedServicePricing?.unitType
                ? UNIT_TYPE_LABELS[selectedServicePricing.unitType] ??
                  selectedServicePricing.unitType
                : "—"}
            </p>
          </div>
        </div>
      ) : canSend ? (
        <p className={styles.errorText}>
          Chưa có giá dịch vụ chính khớp tuyến/dịch vụ của đơn. Kiểm tra cấu hình bảng giá tại Admin.
        </p>
      ) : null}

      {!hasConfiguredPricing && detail?.quotation && readOnly ? (
        <p className={styles.hintXs}>
          Đơn đã có báo giá từ hệ thống. Số tiền bên dưới lấy từ báo giá thực tế của yêu cầu.
        </p>
      ) : null}

      {pricingBreakdown.show ? <PricingFormulaBreakdown breakdown={pricingBreakdown} /> : null}
    </section>
  );
}
