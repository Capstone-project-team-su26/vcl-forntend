"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import DataTable from "@/app/components/DataTable";
import { useAuth } from "@/hooks/useAuth";
import {
  buildExportProcedureSummary,
  CUSTOMS_CHANNEL_LABELS,
  getExportProcedureStatusMeta,
  listExportProcedures,
  LOAD_TYPE_LABELS,
} from "@/modules/export-procedures";
import { getErrorMessage } from "@/utils/apiError";
import ExportProcedureDetailDialog from "./ExportProcedureDetailDialog";
import ExportProcedureStatusBadge from "./ExportProcedureStatusBadge";
import OperationsShell from "./OperationsShell";

const STAT_META = [
  {
    key: "total",
    label: "Tổng lô theo dõi",
    icon: "lucide:ship-wheel",
    tone: "bg-primary/20 text-secondary",
    hint: "FCL và LCL đường biển",
  },
  {
    key: "customsProcessing",
    label: "Đang thông quan",
    icon: "lucide:scan-line",
    tone: "bg-info-bg text-info-text",
    hint: "Đã truyền tờ khai hoặc kiểm tra",
  },
  {
    key: "readyToLoad",
    label: "Sẵn sàng xếp tàu",
    icon: "lucide:badge-check",
    tone: "bg-success-bg text-success-text",
    hint: "Đã thông quan, đủ điểm chặn",
  },
  {
    key: "atRisk",
    label: "Nguy cơ trễ",
    icon: "lucide:triangle-alert",
    tone: "bg-danger-bg text-danger",
    hint: "Có lỗi hoặc quá cut-off",
  },
];

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatCard({ meta, value, loading }) {
  return (
    <article className="rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{meta.label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-surface-muted" />
          ) : (
            <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-ink">{value}</p>
          )}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
          <Icon icon={meta.icon} className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">{meta.hint}</p>
    </article>
  );
}

function ProgressCell({ progress }) {
  return (
    <div className="min-w-28">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold tabular-nums text-ink">{progress.percent}%</span>
        <span className="text-muted">
          {progress.completedCount}/{progress.applicableCount}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full ${
            progress.blockerCount ? "bg-danger" : "bg-secondary"
          }`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}

export default function ExportProceduresPage() {
  const { session, isReady } = useAuth();
  const token = session?.token;
  const [procedures, setProcedures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState(null);

  const loadProcedures = useCallback(
    async ({ refresh = false } = {}) => {
      if (!token) {
        setIsLoading(false);
        setLoadError("Bạn cần đăng nhập để xem checklist thủ tục xuất khô.");
        return;
      }

      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setLoadError("");
      try {
        setProcedures(await listExportProcedures());
      } catch (error) {
        setLoadError(getErrorMessage(error, "Không thể tải danh sách thủ tục xuất khô."));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!isReady) return undefined;
    const timer = window.setTimeout(loadProcedures, 0);
    return () => window.clearTimeout(timer);
  }, [isReady, loadProcedures]);

  const summary = useMemo(() => buildExportProcedureSummary(procedures), [procedures]);
  const hasDemoData = procedures.some((item) => item.isDemo);

  const statusFilterOptions = useMemo(() => {
    const statuses = [...new Set(procedures.map((item) => item.status))];
    return statuses.map((status) => ({
      value: status,
      label: getExportProcedureStatusMeta(status).label,
    }));
  }, [procedures]);

  const channelFilterOptions = useMemo(() => {
    const channels = [...new Set(procedures.map((item) => item.customs.channel))];
    return channels.map((channel) => ({
      value: channel,
      label: CUSTOMS_CHANNEL_LABELS[channel] ?? channel,
    }));
  }, [procedures]);

  const columns = useMemo(
    () => [
      {
        key: "jobCode",
        title: "Lô xuất",
        sortable: true,
        searchable: true,
        searchAccessor: (row) =>
          [row.jobCode, row.masterCode, row.bookingNumber, row.customerName].join(" "),
        render: (row) => (
          <div>
            <p className="font-mono text-xs font-bold text-secondary">{row.jobCode}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">{row.bookingNumber}</p>
          </div>
        ),
      },
      {
        key: "loadType",
        title: "Loại",
        filter: {
          options: Object.entries(LOAD_TYPE_LABELS).map(([value, label]) => ({ value, label })),
        },
        render: (row) => (
          <span className="inline-flex rounded-lg bg-surface-muted px-2.5 py-1 text-[11px] font-bold text-ink">
            {row.loadType}
          </span>
        ),
      },
      {
        key: "route",
        title: "Tuyến",
        searchable: true,
        searchAccessor: (row) => `${row.originPort} ${row.destinationPort} ${row.carrier}`,
        render: (row) => (
          <div className="min-w-40">
            <p className="font-semibold text-ink">{row.originPort}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <Icon icon="lucide:arrow-right" className="h-3 w-3" aria-hidden />
              {row.destinationPort}
            </p>
          </div>
        ),
      },
      {
        key: "etd",
        title: "ETD",
        sortable: true,
        filter: { type: "dateRange" },
        sortAccessor: (row) => new Date(row.etd).getTime() || 0,
        render: (row) => <span className="whitespace-nowrap tabular-nums">{formatDateTime(row.etd)}</span>,
      },
      {
        key: "nearestCutoff",
        title: "Cut-off gần nhất",
        sortable: true,
        sortAccessor: (row) => new Date(row.nearestCutoff?.dueAt ?? 0).getTime(),
        render: (row) =>
          row.nearestCutoff ? (
            <div className={row.nearestCutoff.isOverdue ? "text-danger" : ""}>
              <p className="text-xs font-bold">{row.nearestCutoff.label}</p>
              <p className="mt-1 whitespace-nowrap text-xs tabular-nums">
                {row.nearestCutoff.isOverdue ? "Quá hạn · " : ""}
                {formatDateTime(row.nearestCutoff.dueAt)}
              </p>
            </div>
          ) : (
            <span className="text-muted">Đã xong</span>
          ),
      },
      {
        key: "customsChannel",
        title: "Hải quan",
        filter: { options: channelFilterOptions },
        filterAccessor: (row) => row.customs.channel,
        render: (row) => (
          <div>
            <p className="text-xs font-bold text-ink">
              {CUSTOMS_CHANNEL_LABELS[row.customs.channel] ?? row.customs.channel}
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {row.customs.declarationNumber || "Chưa có tờ khai"}
            </p>
          </div>
        ),
      },
      {
        key: "progress",
        title: "Tiến độ",
        sortable: true,
        sortAccessor: (row) => row.progress.percent,
        render: (row) => <ProgressCell progress={row.progress} />,
      },
      {
        key: "status",
        title: "Trạng thái",
        filter: { options: statusFilterOptions },
        render: (row) => <ExportProcedureStatusBadge status={row.status} />,
      },
    ],
    [channelFilterOptions, statusFilterOptions]
  );

  const displayName = session?.fullName?.trim().split(/\s+/).at(-1) || "Ops";

  return (
    <OperationsShell activeNav="export-procedures">
      <div className="space-y-5 pb-8">
        <section className="relative overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated px-4 py-5 shadow-sm sm:px-6 sm:py-6">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)]" />
                Thủ tục xuất khô
              </div>
              <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                Chào {displayName}, kiểm soát hồ sơ trước giờ tàu chạy
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                Theo dõi bộ chứng từ thương mại, hồ sơ hải quan, SI/VGM và cut-off cho lô
                đường biển FCL/LCL trên cùng một checklist.
              </p>
            </div>
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              onClick={() => loadProcedures({ refresh: true })}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border-muted bg-surface-elevated px-4 text-sm font-bold text-ink hover:bg-surface-muted disabled:opacity-50"
            >
              <Icon
                icon="lucide:refresh-cw"
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                aria-hidden
              />
              Làm mới
            </button>
          </div>
        </section>

        {loadError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-center gap-2">
              <Icon icon="lucide:triangle-alert" className="h-4 w-4 shrink-0" aria-hidden />
              {loadError}
            </span>
            <button
              type="button"
              onClick={() => loadProcedures()}
              className="self-start rounded-lg border border-danger-border px-3 py-1.5 text-xs font-bold hover:bg-danger-hover-bg sm:self-auto"
            >
              Thử lại
            </button>
          </div>
        ) : null}

        {hasDemoData ? (
          <div
            role="note"
            className="flex flex-col gap-3 rounded-xl border border-border-muted bg-info-bg px-4 py-3 text-sm text-info-text sm:flex-row sm:items-center"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
              <Icon icon="lucide:flask-conical" className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-bold">Đang hiển thị dữ liệu mô phỏng</p>
              <p className="mt-0.5 text-xs leading-5">
                Backend chưa có API thủ tục xuất khô; các mã có chữ DEMO không phải hồ sơ thật.
              </p>
            </div>
          </div>
        ) : null}

        <section aria-label="Chỉ số thủ tục xuất khô" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_META.map((meta) => (
            <StatCard key={meta.key} meta={meta} value={summary[meta.key]} loading={isLoading} />
          ))}
        </section>

        <DataTable
          title="Checklist theo lô xuất"
          countLabel="lô"
          columns={columns}
          rows={procedures}
          loading={isLoading}
          rowKey={(row) => row.id}
          onRowClick={setSelectedProcedure}
          searchPlaceholder="Tìm mã lô, booking, khách hàng..."
          pageSize={10}
          minWidth={1280}
          emptyText="Chưa có lô xuất khô nào để theo dõi."
        />

        <aside className="flex gap-3 rounded-xl border border-border-muted bg-warning-bg px-4 py-3 text-xs leading-5 text-warning-text">
          <Icon icon="lucide:scale" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Checklist hỗ trợ điều phối, không thay thế tư vấn HS, giấy phép hoặc kiểm tra chuyên
            ngành. Cut-off phải đối chiếu booking mới nhất của hãng tàu; VGM là điều kiện xếp tàu
            đối với container đóng hàng theo SOLAS.
          </p>
        </aside>
      </div>

      {selectedProcedure ? (
        <ExportProcedureDetailDialog
          procedure={selectedProcedure}
          open
          onClose={() => setSelectedProcedure(null)}
        />
      ) : null}
    </OperationsShell>
  );
}
