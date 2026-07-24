"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/useAuth";
import {
  canonicalizeConsignmentStatus,
  getConsignmentStatusLabel,
  CONSIGNMENT_TYPE_FILTER_OPTIONS,
} from "@/modules/consignments";
import {
  buildOperationalAnalytics,
  getOperationalDashboard,
} from "@/modules/operations";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import DataTable from "@/app/components/DataTable";
import ThemeSelect from "@/app/components/ThemeSelect";
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
    const statuses = [
      ...new Set(
        sourceItems
          .map((item) => canonicalizeConsignmentStatus(item.status))
          .filter(Boolean)
      ),
    ];
    return statuses
      .sort((a, b) =>
        getConsignmentStatusLabel(a).localeCompare(getConsignmentStatusLabel(b), "vi")
      )
      .map((value) => ({ value, label: getConsignmentStatusLabel(value) }));
  }, [sourceItems]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const columns = useMemo(
    () => [
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
    []
  );

  const displayName = session?.fullName?.trim().split(/\s+/).at(-1) || "Ops";
  const closeDetail = useCallback(() => setDetailId(null), []);

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
                Theo dõi luồng hàng và nhận biết điểm nghẽn. Thao tác gom hàng thực hiện ở trang
                Gom hàng.
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
                <Icon icon="lucide:combine" className="h-4 w-4 text-secondary" aria-hidden />
                Trang gom hàng
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
          <div>
            <span className="mb-1.5 block text-xs font-bold text-muted">Khoảng thời gian</span>
            <ThemeSelect
              aria-label="Khoảng thời gian"
              value={filters.days}
              onChange={(next) => updateFilter("days", Number(next))}
              options={RANGE_OPTIONS}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-bold text-muted">Trạng thái</span>
            <ThemeSelect
              aria-label="Trạng thái"
              value={filters.status}
              onChange={(next) => updateFilter("status", next)}
              options={[{ value: "", label: "Tất cả trạng thái" }, ...statusOptions]}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-bold text-muted">Loại vận chuyển</span>
            <ThemeSelect
              aria-label="Loại vận chuyển"
              value={filters.consignmentType}
              onChange={(next) => updateFilter("consignmentType", next)}
              options={CONSIGNMENT_TYPE_FILTER_OPTIONS}
            />
          </div>
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
          minWidth={1000}
          emptyText="Chưa có lô hàng trong khoảng thời gian này."
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
