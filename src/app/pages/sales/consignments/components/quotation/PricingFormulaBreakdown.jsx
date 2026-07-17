import { Icon } from "@iconify/react";
import FormulaStepCard from "./FormulaStepCard";
import styles from "./PricingFormulaBreakdown.module.scss";

function formatKgLabel(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 6 })} kg`;
}

export default function PricingFormulaBreakdown({ breakdown }) {
  if (!breakdown?.show) return null;

  const numberedSteps = breakdown.steps ?? [];
  const freightStep = breakdown.freightStep;
  const allSteps = [
    ...numberedSteps.map((step) => ({ ...step, highlight: false })),
    ...(freightStep?.formula
      ? [{ ...freightStep, highlight: true }]
      : freightStep?.note
        ? [
            {
              key: "freight-note",
              title: freightStep.title,
              formula: null,
              note: freightStep.note,
              highlight: false,
            },
          ]
        : []),
  ];

  const showSummaryChips =
    breakdown.volumetricWeight > 0 &&
    breakdown.actualWeightKg != null &&
    breakdown.chargeableWeight > 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <Icon icon="lucide:calculator" className={styles.icon} />
        </div>
        <div className={styles.headerBody}>
          <p className={styles.title}>Công thức tính cước dịch vụ chính</p>
          <p className={styles.subtitle}>
            {breakdown.hasConfiguredPricing
              ? "Đơn giá từ bảng giá service-pricings trên BE."
              : "Ước tính tạm — cần cấu hình bảng giá BE để có đơn giá chính xác."}
          </p>
          {showSummaryChips ? (
            <div className={styles.chips}>
              <span className={styles.chip}>
                <Icon icon="lucide:scale" className={styles.chipIcon} />
                {formatKgLabel(breakdown.actualWeightKg)} thực
              </span>
              <span className={styles.chip}>
                <Icon icon="lucide:box" className={styles.chipIcon} />
                DIM {formatKgLabel(breakdown.volumetricWeight)}
              </span>
              <Icon icon="lucide:arrow-right" className={styles.arrowIcon} />
              <span className={`${styles.chip} ${styles.chipPrimary}`}>
                {formatKgLabel(breakdown.chargeableWeight)} tính phí
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {allSteps.length > 0 ? (
        <div className={styles.steps}>
          {allSteps.map((step, index) => (
            <FormulaStepCard
              key={step.key ?? `${step.title}-${index}`}
              index={index + 1}
              title={step.title}
              formula={step.formula}
              note={step.note}
              highlight={step.highlight}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
