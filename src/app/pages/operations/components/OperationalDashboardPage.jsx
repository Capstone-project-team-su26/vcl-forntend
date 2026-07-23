"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/useAuth";
import {
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_TYPE_FILTER_OPTIONS,
} from "@/modules/consignments";
import {
  buildOperationalAnalytics,
  createOperationalConsolidation,
  getOperationalDashboard,
} from "@/modules/operations";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import DataTable from "@/app/components/DataTable";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";
import OperationalConsignmentDialog from "./OperationalConsignmentDialog";
import {
  OperationsRouteRanking,
  OperationsStatusChart,
  OperationsTrendChart,
} from "./OperationsDashboardCharts";

const RANGE_OPTIONS = [
  { value: 7, label: "7 ngày" },
  { value: 30, label: "30 ngày" },
  { value: 90, label: "90 ngày" },
];

const KPI_META = {
  total: {
    label: "Tổng lô hàng",
    description: "Được tạo trong kỳ",
    icon: "lucide:package-search",
    tone: "bg-info-bg text-info-text",
  },
  ready: {
    label: "Sẵn sàng gom",
    description: "Đã duyệt, chờ consolidation",
    icon: "lucide:combine",
    tone: "bg-warning-bg text-warning-text",
  },
  moving: {
    label: "Đang vận chuyển",
    description: "Đang xử lý hoặc chờ hàng",
    icon: "lucide:truck",
    tone: "bg-primary/20 text-secondary",
  },
  completed: {
    label: "Đã hoàn tất",
    description: "Kết thúc trong kỳ",
    icon: "lucide:circle-check-big",
    tone: "bg-success-bg text-success-text",
  },
};

function formatDateRange(range) {
  const formatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" });
  return `${formatter.format(range.from)} – ${formatter.format(range.to)}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function KpiCard({ item, loading }) {
  const meta = KPI_META[item?.key] ?? KPI_META.total;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">{meta.label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-surface-muted" />
          ) : (
            <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-ink">
              {item.value.toLocaleString("vi-VN")}
            </p>
          )}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
          <Icon icon={meta.icon} className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-xs leading-5 text-muted">{meta.description}</p>
        {!loading ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold tabular-nums ${
              item.change > 0
                ? "bg-success-bg text-success-text"
                : item.change < 0
                  ? "bg-danger-bg text-danger"
                  : "bg-surface-muted text-muted"
            }`}
            title={`Kỳ trước: ${item.previousValue.toLocaleString("vi-VN")}`}
          >
            <Icon
              icon={
                item.change > 0
                  ? "lucide:trending-up"
                  : item.change < 0
                    ? "lucide:trending-down"
                    : "lucide:minus"
              }
              className="h-3 w-3"
              aria-hidden
            />
            {Math.abs(item.change)}%
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default function OperationalDashboardPage() {
  const { session, isReady } = useAuth();
  const token = session?.token;
  const [sourceItems, setSourceItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState({ days: 30, status: "", consignmentType: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const loadDashboard = useCallback(
    async ({ refresh = false } = {}) => {
      if (!token) {
        setIsLoading(false);
        setLoadError("Bạn cần đăng nhập để xem dashboard vận hành.");
        return;
      }
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setLoadError("");
      try {
        const result = await getOperationalDashboard();
        setSourceItems(result?.items ?? []);
      } catch (error) {
        setLoadError(getErrorMessage(error, "Không thể tải dữ liệu dashboard."));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (!isReady) return undefined;
    const timer = window.setTimeout(loadDashboard, 0);
    return () => window.clearTimeout(timer);
  }, [isReady, loadDashboard]);

  const analytics = useMemo(
    () => buildOperationalAnalytics(sourceItems, filters),
    [filters, sourceItems]
  );

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(sourceItems.map((item) => item.status).filter(Boolean))];
    return statuses
      .sort((a, b) =>
        String(CONSIGNMENT_STATUS_LABELS[a] || a).localeCompare(
          String(CONSIGNMENT_STATUS_LABELS[b] || b),
          "vi"
        )
      )
      .map((value) => ({ value, label: CONSIGNMENT_STATUS_LABELS[value] || value }));
  }, [sourceItems]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const eligibleIds = useMemo(
    () => analytics.rows.filter((item) => item.status === "APPROVED").map((item) => item.id),
    [analytics.rows]
  );
  const allEligibleSelected =
    eligibleIds.length > 0 && eligibleIds.every((id) => selectedSet.has(id));

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setSelectedIds([]);
    setIsConfirming(false);
    setActionNotice(null);
  }

  const toggleOne = useCallback((id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setIsConfirming(false);
    setActionNotice(null);
  }, []);

  const toggleAllEligible = useCallback(() => {
    setSelectedIds((current) => {
      if (allEligibleSelected) {
        const eligible = new Set(eligibleIds);
        return current.filter((id) => !eligible.has(id));
      }
      return [...new Set([...current, ...eligibleIds])];
    });
    setIsConfirming(false);
    setActionNotice(null);
  }, [allEligibleSelected, eligibleIds]);

  async function handleCreateConsolidation() {
    if (!selectedIds.length) return;
    setIsSubmitting(true);
    setActionNotice(null);
    try {
      await createOperationalConsolidation(selectedIds);
      setActionNotice({
        type: "success",
        message: `Đã tạo consolidation cho ${selectedIds.length} lô hàng.`,
      });
      setSelectedIds([]);
      setIsConfirming(false);
      await loadDashboard({ refresh: true });
    } catch (error) {
      setActionNotice({
        type: "error",
        message: getErrorMessage(error, "Không thể tạo consolidation."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "select",
        title: (
          <input
            type="checkbox"
            checked={allEligibleSelected}
            disabled={!eligibleIds.length}
            onChange={toggleAllEligible}
            onClick={(event) => event.stopPropagation()}
            aria-label="Chọn tất cả lô đã duyệt"
            className="h-4 w-4"
          />
        ),
        className: "w-12",
        render: (row) => (
          <input
            type="checkbox"
            checked={selectedSet.has(row.id)}
            disabled={row.status !== "APPROVED"}
            onChange={() => toggleOne(row.id)}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Chọn lô ${row.consignmentCode || row.id}`}
            title={row.status === "APPROVED" ? "Chọn để tạo consolidation" : "Lô chưa đủ điều kiện gom"}
            className="h-4 w-4 disabled:cursor-not-allowed disabled:opacity-35"
          />
        ),
      },
      {
        key: "consignmentCode",
        title: "Mã lô",
        sortable: true,
        searchable: true,
        render: (row) => (
          <span className="font-mono text-xs font-bold text-secondary">
            {row.consignmentCode || "—"}
          </span>
        ),
      },
      {
        key: "customerName",
        title: "Khách hàng",
        sortable: true,
        searchable: true,
      },
      {
        key: "route",
        title: "Tuyến",
        searchable: true,
        render: (row) => <span className="text-muted">{row.route || row.destination || "—"}</span>,
      },
      {
        key: "status",
        title: "Trạng thái",
        render: (row) => (
          <ConsignmentStatusBadge status={row.status} className="px-2.5 py-1 text-[11px]" />
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
            {row.totalWeight == null ? "—" : `${Number(row.totalWeight).toLocaleString("vi-VN")} kg`}
          </span>
        ),
      },
      {
        key: "createdAt",
        title: "Ngày tạo",
        align: "right",
        sortable: true,
        sortAccessor: (row) => new Date(row.createdAt).getTime() || 0,
        filter: { type: "dateRange" },
        render: (row) => (
          <span className="whitespace-nowrap text-xs text-muted">{formatDateTime(row.createdAt)}</span>
        ),
      },
    ],
    [allEligibleSelected, eligibleIds.length, selectedSet, toggleAllEligible, toggleOne]
  );

  const displayName = session?.fullName?.trim().split(/\s+/).at(-1) || "Ops";
  const closeDetail = useCallback(() => setDetailId(null), []);
  const tableHeaderRight = (
    <button
      type="button"
      disabled={!selectedIds.length || isSubmitting}
      onClick={() => setIsConfirming(true)}
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg bg-secondary px-3.5 text-xs font-bold text-white shadow-sm hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Icon icon="lucide:combine" className="h-4 w-4" aria-hidden />
      Gom {selectedIds.length ? `${selectedIds.length} lô` : "lô hàng"}
    </button>
  );

  return (
    <OperationsShell activeNav="dashboard">
      <div className="space-y-5 pb-8">
        <section className="relative overflow-hidden rounded-2xl border border-border-muted bg-surface-elevated px-4 py-5 shadow-sm sm:px-6 sm:py-6">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)]" />
                Trung tâm vận hành
              </div>
              <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                Chào {displayName}, tổng quan hôm nay
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Theo dõi luồng hàng, nhận biết điểm nghẽn và xử lý các lô sẵn sàng gom trên cùng
                một màn hình.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-border-muted bg-surface/80 px-3.5 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Khối lượng kỳ</p>
                <p className="mt-0.5 text-sm font-black tabular-nums text-ink">
                  {analytics.totalWeight.toLocaleString("vi-VN")} kg
                </p>
              </div>
              <Link
                href={ROUTES.operations.consolidate}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-border-muted bg-surface-elevated px-4 text-sm font-bold text-ink hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-secondary"
              >
                <Icon icon="lucide:layers-3" className="h-4 w-4 text-secondary" aria-hidden />
                Danh sách gom
              </Link>
              <button
                type="button"
                disabled={isRefreshing || isLoading}
                onClick={() => loadDashboard({ refresh: true })}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-bold text-white shadow-sm hover:bg-secondary-hover disabled:opacity-50"
              >
                <Icon
                  icon="lucide:refresh-cw"
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden
                />
                Làm mới
              </button>
            </div>
          </div>
        </section>

        <section
          aria-label="Bộ lọc dashboard"
          className="grid gap-3 rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-[1fr_1.5fr_1.5fr_auto] lg:items-end"
        >
          <label>
            <span className="mb-1.5 block text-xs font-bold text-muted">Khoảng thời gian</span>
            <select
              value={filters.days}
              onChange={(event) => updateFilter("days", Number(event.target.value))}
              className="form-select h-10"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-bold text-muted">Trạng thái</span>
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="form-select h-10"
            >
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-bold text-muted">Loại vận chuyển</span>
            <select
              value={filters.consignmentType}
              onChange={(event) => updateFilter("consignmentType", event.target.value)}
              className="form-select h-10"
            >
              {CONSIGNMENT_TYPE_FILTER_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex h-10 items-center gap-2 rounded-lg bg-surface-muted px-3 text-xs font-semibold text-muted">
            <Icon icon="lucide:calendar-range" className="h-4 w-4" aria-hidden />
            {formatDateRange(analytics.range)}
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
              onClick={() => loadDashboard()}
              className="self-start rounded-lg border border-danger-border px-3 py-1.5 text-xs font-bold hover:bg-danger-hover-bg sm:self-auto"
            >
              Thử lại
            </button>
          </div>
        ) : null}

        <section aria-label="Chỉ số vận hành" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(isLoading
            ? Object.keys(KPI_META).map((key) => ({ key }))
            : analytics.kpis
          ).map((item) => (
            <KpiCard key={item.key} item={item} loading={isLoading} />
          ))}
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <OperationsTrendChart data={analytics.trend} />
          <OperationsStatusChart
            data={analytics.statusBreakdown}
            total={analytics.rows.length}
          />
          <div className="lg:col-span-3">
            <OperationsRouteRanking data={analytics.topRoutes} />
          </div>
        </div>

        {isConfirming ? (
          <div className="flex flex-col gap-3 rounded-xl border border-primary bg-primary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Icon icon="lucide:combine" className="mt-0.5 h-5 w-5 text-secondary" aria-hidden />
              <div>
                <p className="text-sm font-bold text-ink">
                  Tạo consolidation cho {selectedIds.length} lô đã chọn?
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Hệ thống sẽ chuyển các lô này sang danh sách chờ gom.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsConfirming(false)}
                className="h-9 rounded-lg border border-border-muted bg-surface-elevated px-3 text-xs font-bold text-ink hover:bg-surface-muted disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCreateConsolidation}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-xs font-bold text-white hover:bg-secondary-hover disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Icon icon="lucide:loader-circle" className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                {isSubmitting ? "Đang tạo..." : "Xác nhận tạo"}
              </button>
            </div>
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

        <DataTable
          title="Lô hàng gần đây"
          countLabel="lô"
          columns={columns}
          rows={analytics.rows}
          loading={isLoading}
          rowKey={(row) => row.id}
          onRowClick={(row) => setDetailId(row.id)}
          searchPlaceholder="Tìm mã lô, khách hàng hoặc tuyến..."
          pageSize={10}
          minWidth={1040}
          emptyText="Chưa có lô hàng trong khoảng thời gian này."
          headerRight={tableHeaderRight}
        />
      </div>

      {detailId ? (
        <OperationalConsignmentDialog
          key={detailId}
          orderId={detailId}
          open
          onClose={closeDetail}
        />
      ) : null}
    </OperationsShell>
  );
}
