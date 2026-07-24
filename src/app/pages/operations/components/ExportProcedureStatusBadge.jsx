import { Icon } from "@iconify/react";
import { getExportProcedureStatusMeta } from "@/modules/export-procedures";

const TONE_STYLES = {
  neutral: "bg-surface-muted text-ink",
  warning: "bg-warning-bg text-warning-text",
  info: "bg-info-bg text-info-text",
  success: "bg-success-bg text-success-text",
  danger: "bg-danger-bg text-danger",
};

export default function ExportProcedureStatusBadge({ status, className = "" }) {
  const meta = getExportProcedureStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
        TONE_STYLES[meta.tone] ?? TONE_STYLES.neutral
      } ${className}`}
      title={status || undefined}
    >
      <Icon icon={meta.icon} className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {meta.label}
    </span>
  );
}
