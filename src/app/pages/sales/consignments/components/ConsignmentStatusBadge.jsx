import { Icon } from "@iconify/react";
import {
  CONSIGNMENT_STATUS_ICONS,
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
} from "@/modules/consignments";

export default function ConsignmentStatusBadge({ status, className = "" }) {
  const icon = CONSIGNMENT_STATUS_ICONS[status];

  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm ${
        CONSIGNMENT_STATUS_STYLES[status] ||
        "bg-surface-muted text-ink border-2 border-border"
      } ${className}`}
    >
      {icon ? <Icon icon={icon} className="w-4 h-4 shrink-0" aria-hidden /> : null}
      {CONSIGNMENT_STATUS_LABELS[status] || status}
    </span>
  );
}
