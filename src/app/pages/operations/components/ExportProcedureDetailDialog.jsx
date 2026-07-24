"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import {
  CUSTOMS_CHANNEL_LABELS,
  CUSTOMS_STATUS_LABELS,
  DOCUMENT_GROUPS,
  getDocumentStatusMeta,
  getRequirementMeta,
  LOAD_TYPE_LABELS,
} from "@/modules/export-procedures";
import ExportProcedureStatusBadge from "./ExportProcedureStatusBadge";

const TONE_STYLES = {
  neutral: "bg-surface-muted text-muted",
  warning: "bg-warning-bg text-warning-text",
  info: "bg-info-bg text-info-text",
  success: "bg-success-bg text-success-text",
  danger: "bg-danger-bg text-danger",
};

const REQUIREMENT_STYLES = {
  neutral: "border-border-muted text-muted",
  warning: "border-border-muted text-warning-text",
  info: "border-border-muted text-info-text",
  danger: "border-danger-border text-danger",
};

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function SummaryItem({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-border-muted bg-surface p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Icon icon={icon} className="h-3.5 w-3.5" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold text-ink">{value || "—"}</p>
    </div>
  );
}

function DocumentStatus({ status }) {
  const meta = getDocumentStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
        TONE_STYLES[meta.tone] ?? TONE_STYLES.neutral
      }`}
    >
      <Icon icon={meta.icon} className="h-3.5 w-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

function RequirementBadge({ requirement }) {
  const meta = getRequirementMeta(requirement);
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        REQUIREMENT_STYLES[meta.tone] ?? REQUIREMENT_STYLES.neutral
      }`}
    >
      {meta.label}
    </span>
  );
}

function DocumentRow({ document }) {
  return (
    <li className="grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink">{document.label}</p>
          <RequirementBadge requirement={document.requirement} />
          {document.blocking && document.status !== "NOT_APPLICABLE" ? (
            <span className="text-[10px] font-bold uppercase tracking-wide text-danger">
              Điểm chặn
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {document.owner ? <span>Phụ trách: {document.owner}</span> : null}
          {document.reference ? <span>Tham chiếu: {document.reference}</span> : null}
          {document.dueAt ? (
            <span className={document.isOverdue ? "font-bold text-danger" : ""}>
              {document.isOverdue ? "Quá hạn: " : "Hạn: "}
              {formatDateTime(document.dueAt)}
            </span>
          ) : null}
        </div>
        {document.note ? (
          <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs leading-5 text-muted">
            {document.note}
          </p>
        ) : null}
      </div>
      <DocumentStatus status={document.status} />
    </li>
  );
}

export default function ExportProcedureDetailDialog({ procedure, open, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose, open]);

  if (!open || !procedure) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-procedure-detail-title"
        className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border-muted bg-surface-elevated shadow-2xl sm:max-h-[90vh] sm:rounded-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border-muted px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
              Checklist thủ tục xuất khô
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2
                id="export-procedure-detail-title"
                className="font-mono text-lg font-black text-ink sm:text-xl"
              >
                {procedure.jobCode}
              </h2>
              <ExportProcedureStatusBadge status={procedure.status} />
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-muted text-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label="Đóng chi tiết thủ tục xuất khô"
          >
            <Icon icon="lucide:x" className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="space-y-5">
            {procedure.isDemo ? (
              <div
                role="note"
                className="flex gap-3 rounded-xl border border-border-muted bg-info-bg px-4 py-3 text-sm text-info-text"
              >
                <Icon icon="lucide:flask-conical" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>
                  Đây là dữ liệu mô phỏng để duyệt luồng nghiệp vụ. Trạng thái chưa được lưu hoặc
                  đồng bộ với hệ thống hải quan/hãng tàu.
                </p>
              </div>
            ) : null}

            <section aria-label="Tổng quan lô hàng" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem label="Booking" value={procedure.bookingNumber} icon="lucide:ticket-check" />
              <SummaryItem label="Loại lô" value={LOAD_TYPE_LABELS[procedure.loadType]} icon="lucide:container" />
              <SummaryItem label="ETD" value={formatDateTime(procedure.etd)} icon="lucide:calendar-clock" />
              <SummaryItem
                label="Tuyến"
                value={`${procedure.originPort} → ${procedure.destinationPort}`}
                icon="lucide:route"
              />
              <SummaryItem label="Hãng tàu" value={procedure.carrier} icon="lucide:ship" />
              <SummaryItem label="Khách hàng" value={procedure.customerName} icon="lucide:building-2" />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-xl border border-border-muted p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">
                      Tiến độ chứng từ
                    </p>
                    <p className="mt-1 text-2xl font-black tabular-nums text-ink">
                      {procedure.progress.percent}%
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    {procedure.progress.completedCount}/{procedure.progress.applicableCount} mục hoàn thành
                  </p>
                </div>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
                  role="progressbar"
                  aria-label="Tiến độ chứng từ"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={procedure.progress.percent}
                >
                  <div
                    className="h-full rounded-full bg-secondary transition-[width]"
                    style={{ width: `${procedure.progress.percent}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <span className="text-muted">{procedure.progress.missingCount} mục còn xử lý</span>
                  {procedure.progress.overdueCount ? (
                    <span className="font-bold text-danger">
                      {procedure.progress.overdueCount} mục quá hạn
                    </span>
                  ) : null}
                  {procedure.progress.issueCount ? (
                    <span className="font-bold text-danger">
                      {procedure.progress.issueCount} mục có vướng mắc
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-border-muted p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">Hải quan</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-info-bg px-2.5 py-1 text-xs font-bold text-info-text">
                    {CUSTOMS_STATUS_LABELS[procedure.customs.status] ?? procedure.customs.status}
                  </span>
                  <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-bold text-ink">
                    {CUSTOMS_CHANNEL_LABELS[procedure.customs.channel] ?? procedure.customs.channel}
                  </span>
                </div>
                <p className="mt-3 font-mono text-xs text-muted">
                  Tờ khai: {procedure.customs.declarationNumber || "Chưa có"}
                </p>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Icon icon="lucide:alarm-clock" className="h-4 w-4 text-secondary" aria-hidden />
                Các mốc cut-off theo booking
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {procedure.cutoffs.map((cutoff) => (
                  <article
                    key={cutoff.id}
                    className={`rounded-xl border p-3.5 ${
                      cutoff.isOverdue
                        ? "border-danger-border bg-danger-bg"
                        : "border-border-muted bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-ink">{cutoff.label}</p>
                      <Icon
                        icon={cutoff.completed ? "lucide:circle-check" : "lucide:clock-3"}
                        className={`h-4 w-4 ${
                          cutoff.completed
                            ? "text-success-text"
                            : cutoff.isOverdue
                              ? "text-danger"
                              : "text-muted"
                        }`}
                        aria-hidden
                      />
                    </div>
                    <p
                      className={`mt-2 text-xs tabular-nums ${
                        cutoff.isOverdue ? "font-bold text-danger" : "text-muted"
                      }`}
                    >
                      {formatDateTime(cutoff.dueAt)}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {DOCUMENT_GROUPS.map((group) => {
              const documents = procedure.documents.filter((item) => item.group === group.key);
              if (!documents.length) return null;
              return (
                <section key={group.key}>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <Icon icon={group.icon} className="h-4 w-4 text-secondary" aria-hidden />
                    {group.label}
                  </h3>
                  <ul className="mt-3 divide-y divide-border-muted overflow-hidden rounded-xl border border-border-muted">
                    {documents.map((document) => (
                      <DocumentRow key={document.id} document={document} />
                    ))}
                  </ul>
                </section>
              );
            })}

            <aside className="rounded-xl border border-border-muted bg-warning-bg px-4 py-3 text-xs leading-5 text-warning-text">
              Checklist này hỗ trợ điều phối, không thay thế tư vấn phân loại HS, giấy phép hoặc
              kiểm tra chuyên ngành. Đối chiếu hồ sơ theo{" "}
              <a
                href="https://thuvienphapluat.vn/van-ban/Xuat-nhap-khau/Thong-tu-121-2025-TT-BTC-sua-doi-cac-Thong-tu-ve-thu-tuc-hai-quan-giam-sat-hai-quan-633118.aspx"
                target="_blank"
                rel="noreferrer"
                className="font-bold underline underline-offset-2"
              >
                Thông tư 121/2025/TT-BTC
              </a>{" "}
              và xác nhận cut-off trên booking mới nhất của hãng tàu.
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
