import DetailRow from "./DetailRow";
import styles from "./PartySection.module.scss";

export default function PartySection({ title, name, phone, address }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <p className={styles.title}>{title}</p>
        <p className={styles.name}>{name || "—"}</p>
      </div>
      <div className={styles.body}>
        <dl>
          <DetailRow label="Số điện thoại" value={phone || "—"} />
          <DetailRow label="Địa chỉ" value={address || "—"} />
        </dl>
      </div>
    </div>
  );
}
