import {
  formatQuotationMoney,
  getQuotationDisplayLines,
  getConsignmentQuotationHeading,
  isDraftConsignmentQuotation,
} from "@/utils/consignmentQuotationService";
import { formatConsignmentDate } from "@/utils/orderConsignmentService";
import { VOLUMETRIC_DIVISOR_CM3 } from "@/utils/servicePricingService";
import styles from "./QuotationSummary.module.scss";

export default function QuotationSummary({
  quotation,
  volumetricDivisor = VOLUMETRIC_DIVISOR_CM3,
  volumetricDivisorRule = null,
}) {
  if (!quotation) return null;

  const lines = getQuotationDisplayLines(quotation);
  const heading = getConsignmentQuotationHeading(quotation);
  const isDraft = isDraftConsignmentQuotation(quotation);
  const actualWeight = Number(quotation.totalWeight);
  const volumetricWeight = Number(quotation.volumetricWeight);
  const chargeableWeight = Number(quotation.chargeableWeight);
  const hasWeightSummary =
    (Number.isFinite(actualWeight) && actualWeight > 0) ||
    (Number.isFinite(volumetricWeight) && volumetricWeight > 0) ||
    (Number.isFinite(chargeableWeight) && chargeableWeight > 0);

  const formatKg = (value) =>
    `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 6 })} kg`;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{heading}</h3>
          {isDraft && quotation.expiredAt ? (
            <p className={styles.expiry}>
              Hết hạn tạm tính: {formatConsignmentDate(quotation.expiredAt)}
            </p>
          ) : null}
        </div>
        <p className={styles.total}>{formatQuotationMoney(quotation)}</p>
      </div>

      {hasWeightSummary ? (
        <div className={styles.weightBox}>
          <p className={styles.weightLabel}>Cân thực → DIM → Tính phí</p>
          <p className={styles.weightValue}>
            {Number.isFinite(actualWeight) && actualWeight > 0
              ? `${formatKg(actualWeight)} thực`
              : "— thực"}
            {Number.isFinite(volumetricWeight) && volumetricWeight >= 0 ? (
              <>
                {" · "}
                <span className={styles.weightMuted}>DIM {formatKg(volumetricWeight)}</span>
              </>
            ) : null}
            {Number.isFinite(chargeableWeight) && chargeableWeight > 0 ? (
              <>
                {" → "}
                <span className={styles.weightPrimary}>{formatKg(chargeableWeight)}</span> tính phí
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {lines.length ? (
        <ul className={styles.lines}>
          {lines.map((line, index) => (
            <li key={`${line.label}-${index}`} className={styles.lineItem}>
              <span className={styles.lineLabel}>{line.label}</span>
              <span className={styles.lineAmount}>
                {formatQuotationMoney(quotation, line.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.divisorBox}>
        <p className={styles.divisorTitle}>Hệ số quy đổi thể tích</p>
        <p className={styles.divisorText}>
          DIM = thể tích (cm³) ÷{" "}
          <span className={styles.divisorMono}>
            {Number(volumetricDivisor).toLocaleString("vi-VN")}
          </span>
          {volumetricDivisorRule ? (
            <span className={styles.divisorHint}>
              {" "}
              · từ quy tắc {volumetricDivisorRule.code || "VOLUMETRIC_DIVISOR"}
            </span>
          ) : (
            <span className={styles.divisorHint}>
              {" "}
              · mặc định IATA {VOLUMETRIC_DIVISOR_CM3.toLocaleString("vi-VN")}
            </span>
          )}
        </p>
      </div>

      {quotation.salesNote ? (
        <p className={styles.note}>
          <span className={styles.noteLabel}>Ghi chú tư vấn:</span> {quotation.salesNote}
        </p>
      ) : null}
      {quotation.rejectionReason ? (
        <p className={styles.rejection}>
          <span className={styles.rejectionLabel}>Lý do khách từ chối:</span>{" "}
          {quotation.rejectionReason}
        </p>
      ) : null}
    </div>
  );
}
