import { Icon } from "@iconify/react";
import styles from "./NoticeBanner.module.scss";

export default function NoticeBanner({ variant = "info", icon, children }) {
  const variantClass =
    variant === "success"
      ? styles.success
      : variant === "warning" || variant === "error"
        ? styles.warning
        : styles.info;

  return (
    <div className={`${styles.banner} ${variantClass}`}>
      <Icon icon={icon} className={styles.icon} aria-hidden />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
