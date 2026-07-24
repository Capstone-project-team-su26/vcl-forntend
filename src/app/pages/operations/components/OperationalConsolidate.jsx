"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/useAuth";
import {
  buildConsolidationSummary,
  countConsolidationParcels,
  getConsolidationStatusMeta,
  listConsolidations,
} from "@/modules/operations";
import { getErrorMessage } from "@/utils/apiError";
import DataTable from "@/app/components/DataTable";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";
import ConsolidationCreateDialog from "./ConsolidationCreateDialog";
import ConsolidationDetailDialog from "./ConsolidationDetailDialog";
import ConsolidationStatusBadge from "./ConsolidationStatusBadge";

const STAT_META = [
  {
    key: "batches",
    label: "Lô gom hàng",
    icon: "lucide:layers-3",
    tone: "bg-primary/20 text-secondary",
  },
  {
    key: "orders",
    label: "Đơn trong lô",
    icon: "lucide:package",
    tone: "bg-info-bg text-info-text",
  },
  {
    key: "totalWeight",
    label: "Tổng trọng lượng",
    icon: "lucide:weight",
    tone: "bg-warning-bg text-warning-text",
    suffix: " kg",
  },
  {
    key: "totalVolume",
    label: "Tổng thể tích",
    icon: "lucide:box",
    tone: "bg-success-bg text-success-text",
    suffix: " m³",
  },
];

function formatNumber(value, suffix = "") {
  if (value == null || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toLocaleString("vi-VN")}${suffix}` : "—";
}

function normalizeStatusKey(status) {
  return String(status ?? "").trim().toUpperCase();
}

function StatCard({ meta, value, hint, loading }) {
  return (
    <article className="rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{meta.label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-surface-muted" />
          ) : (
            <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-ink">
              {value}
            </p>
          )}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}
        >
          <Icon icon={meta.icon} className="h-5 w-5" aria-hidden />
        </span>
      </div>
      {hint ? <p className="mt-4 text-xs leading-5 text-muted">{hint}</p> : null}
    </article>
  );
}

export default function OperationalConsolidate() {
  const { session, isReady } = useAuth();
  const token = session?.token;
  const [consolidations, setConsolidations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [detailId, setDetailId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  const loadConsolidations = useCallback(
    async ({ refresh = false } = {}) => {
      if (!token) {
        setIsLoading(false);
        setLoadError("Bạn cần đăng nhập để xem danh sách gom hàng.");
        return;
      }
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setLoadError("");
      try {
        setConsolidations(await listConsolidations());
      } catch (error) {
        setLoadError(getErrorMessage(error, "Không thể tải danh sách lô gom hàng."));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!isReady) return undefined;
    const timer = window.setTimeout(loadConsolidations, 0);
    return () => window.clearTimeout(timer);
  }, [isReady, loadConsolidations]);

  const summary = useMemo(() => buildConsolidationSummary(consolidations), [consolidations]);

  const statusFilterOptions = useMemo(() => {
    const seen = new Map();
    for (const item of consolidations) {
      const key = normalizeStatusKey(item.status);
      if (key && !seen.has(key)) seen.set(key, getConsolidationStatusMeta(item.status).label);
    }
    return [...seen].map(([value, label]) => ({ value, label }));
  }, [consolidations]);

  const columns = useMemo(
    () => [
      {
        key: "masterCode",
        title: "Mã master",
        sortable: true,
        searchable: true,
        render: (row) => (
          <span className="font-mono text-xs font-bold text-secondary">
            {row.masterCode || "—"}
          </span>
        ),
      },
      {
        key: "status",
        title: "Trạng thái",
        filter: { options: statusFilterOptions },
        filterAccessor: (row) => normalizeStatusKey(row.status),
        render: (row) => <ConsolidationStatusBadge status={row.status} />,
      },
      {
        key: "orders",
        title: "Số đơn",
        align: "right",
        sortable: true,
        sortAccessor: (row) => row.orders?.length ?? 0,
        render: (row) => (
          <span className="tabular-nums">{formatNumber(row.orders?.length ?? 0)}</span>
        ),
      },
      {
        key: "parcels",
        title: "Số kiện",
        align: "right",
        sortable: true,
        sortAccessor: countConsolidationParcels,
        render: (row) => (
          <span className="tabular-nums">{formatNumber(countConsolidationParcels(row))}</span>
        ),
      },
      {
        key: "totalWeight",
        title: "Trọng lượng",
        align: "right",
        sortable: true,
        sortAccessor: (row) => Number(row.totalWeight) || 0,
        render: (row) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatNumber(row.totalWeight, " kg")}
          </span>
        ),
      },
      {
        key: "totalVolume",
        title: "Thể tích",
        align: "right",
        sortable: true,
        sortAccessor: (row) => Number(row.totalVolume) || 0,
        render: (row) => (
          <span className="whitespace-nowrap tabular-nums">
            {formatNumber(row.totalVolume, " m³")}
          </span>
        ),
      },
    ],
    [statusFilterOptions]
  );

  const displayName = session?.fullName?.trim().split(/\s+/).at(-1) || "Ops";
  const closeDetail = useCallback(() => setDetailId(null), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const handleCreated = useCallback(
    (count) => {
      setIsCreateOpen(false);
      setActionNotice({
        type: "success",
        message: `Đã tạo lô gom hàng từ ${count} lô đã duyệt.`,
      });
      loadConsolidations({ refresh: true });
    },
    [loadConsolidations]
  );

  return (
    <OperationsShell activeNav="consolidation">
      <div className="space-y-5 pb-8">
        <section className="relative overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated px-4 py-5 shadow-sm sm:px-6 sm:py-6">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)]" />
                Gom hàng
              </div>
              <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                Chào {displayName}, danh sách lô gom hàng
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Theo dõi các lô master, kiểm tra đơn và kiện bên trong từng lô, xuất phiếu
                manifest PDF khi cần bàn giao.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {summary.waiting > 0 && !isLoading ? (
                <div className="rounded-xl border border-border-muted bg-surface/80 px-3.5 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                    Chờ xử lý
                  </p>
                  <p className="mt-0.5 text-sm font-black tabular-nums text-warning-text">
                    {summary.waiting} lô
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                disabled={isRefreshing || isLoading}
                onClick={() => loadConsolidations({ refresh: true })}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-muted bg-surface-elevated px-4 text-sm font-bold text-ink hover:bg-surface-muted disabled:opacity-50"
              >
                <Icon
                  icon="lucide:refresh-cw"
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden
                />
                Làm mới
              </button>
              <button
                type="button"
                disabled={!token}
                onClick={() => {
                  setActionNotice(null);
                  setIsCreateOpen(true);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-bold text-white shadow-sm hover:bg-secondary-hover disabled:opacity-50"
              >
                <Icon icon="lucide:combine" className="h-4 w-4" aria-hidden />
                Tạo lô gom mới
              </button>
            </div>
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
              onClick={() => loadConsolidations()}
              className="self-start rounded-lg border border-danger-border px-3 py-1.5 text-xs font-bold hover:bg-danger-hover-bg sm:self-auto"
            >
              Thử lại
            </button>
          </div>
        ) : null}

        {actionNotice ? (
          <div
            role="status"
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
              actionNotice.type === "success"
                ? "border-primary bg-success-bg text-success-text"
                : "border-danger-border bg-danger-bg text-danger"
            }`}
          >
            <Icon
              icon={actionNotice.type === "success" ? "lucide:circle-check" : "lucide:circle-alert"}
              className="h-4 w-4 shrink-0"
              aria-hidden
            />
            {actionNotice.message}
          </div>
        ) : null}

        <section aria-label="Chỉ số gom hàng" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_META.map((meta) => (
            <StatCard
              key={meta.key}
              meta={meta}
              value={formatNumber(summary[meta.key], meta.suffix ?? "")}
              hint={
                meta.key === "batches"
                  ? `${formatNumber(summary.waiting)} lô chờ xử lý`
                  : meta.key === "orders"
                    ? `${formatNumber(summary.parcels)} kiện hàng bên trong`
                    : "Tính trên toàn bộ lô gom"
              }
              loading={isLoading}
            />
          ))}
        </section>

        <DataTable
          title="Lô gom hàng"
          countLabel="lô gom"
          columns={columns}
          rows={consolidations}
          loading={isLoading}
          rowKey={(row) => row.id}
          onRowClick={(row) => setDetailId(row.id)}
          searchPlaceholder="Tìm theo mã master..."
          pageSize={10}
          minWidth={880}
          emptyText="Chưa có lô gom hàng nào. Nhấn “Tạo lô gom mới” để chọn các lô đã duyệt."
        />
      </div>

      {isCreateOpen ? (
        <ConsolidationCreateDialog open onClose={closeCreate} onCreated={handleCreated} />
      ) : null}

      {detailId ? (
        <ConsolidationDetailDialog
          key={detailId}
          consolidationId={detailId}
          open
          onClose={closeDetail}
        />
      ) : null}
    </OperationsShell>
  );
}
