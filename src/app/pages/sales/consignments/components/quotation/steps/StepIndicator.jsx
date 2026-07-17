import { Icon } from "@iconify/react";
import styles from "./StepIndicator.module.scss";

const WIZARD_STEPS = [
  { id: 1, label: "Thông tin hàng & kho" },
  { id: 2, label: "Tư vấn & báo giá" },
  { id: 3, label: "Xác nhận gửi" },
];

export { WIZARD_STEPS };

export default function StepIndicator({ currentStep }) {
  return (
    <ol className={styles.list}>
      {WIZARD_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;

        return (
          <li key={step.id} className={styles.item}>
            <div className={styles.stepWrap}>
              <span
                className={`${styles.badge} ${isActive ? styles.active : ""} ${isDone ? styles.done : ""}`}
              >
                {isDone ? <Icon icon="lucide:check" className={styles.iconSm} /> : step.id}
              </span>
              <span className={`${styles.label} ${isActive ? styles.active : ""}`}>{step.label}</span>
            </div>
            {index < WIZARD_STEPS.length - 1 ? <div className={styles.connector} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
