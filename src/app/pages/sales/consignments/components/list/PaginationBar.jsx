import { Icon } from "@iconify/react";
import styles from "./PaginationBar.module.scss";

export default function PaginationBar({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  sticky = false,
}) {
  if (totalCount <= 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className={`${styles.bar} ${sticky ? styles.sticky : ""}`}>
      <p className={styles.meta}>
        {from}–{to} / {totalCount} · Trang {page}/{totalPages}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={styles.pageBtn}
        >
          <Icon icon="lucide:chevron-left" className={styles.icon} />
          Trước
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={styles.pageBtn}
        >
          Sau
          <Icon icon="lucide:chevron-right" className={styles.icon} />
        </button>
      </div>
    </div>
  );
}
