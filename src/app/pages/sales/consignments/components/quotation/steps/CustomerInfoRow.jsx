import styles from "./CustomerInfoRow.module.scss";

export default function CustomerInfoRow({ label, value }) {
  return (
    <div className={styles.row}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value || "—"}</dd>
    </div>
  );
}
