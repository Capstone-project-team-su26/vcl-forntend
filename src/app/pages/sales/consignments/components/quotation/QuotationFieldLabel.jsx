import styles from "./QuotationFieldLabel.module.scss";

export default function QuotationFieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
      {required ? <span className={styles.required}> *</span> : null}
    </label>
  );
}