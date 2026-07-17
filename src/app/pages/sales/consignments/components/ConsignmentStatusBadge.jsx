import { Icon } from "@iconify/react";
import {
  CONSIGNMENT_STATUS_ICONS,
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
} from "@/utils/orderConsignmentService";
import styles from "./ConsignmentStatusBadge.module.scss";

export default function ConsignmentStatusBadge({ status, className = "" }) {
  const icon = CONSIGNMENT_STATUS_ICONS[status];
  const statusStyle =
    CONSIGNMENT_STATUS_STYLES[status] || "status-badge--muted";

  return (
    <span className={`status-badge ${styles.badge} ${statusStyle} ${className}`}>
      {icon ? <Icon icon={icon} className={styles.icon} aria-hidden /> : null}
      {CONSIGNMENT_STATUS_LABELS[status] || status}
    </span>
  );
}
