import { canonicalizeConsignmentStatus } from "@/modules/consignments";

/**
 * Trạng thái lô gom hàng — BE trả chuỗi tự do (DRAFT, CONSOLIDATED...),
 * FE tạo mới với "waiting" nên map không phân biệt hoa thường.
 */
const CONSOLIDATION_STATUS_META = {
  DRAFT: { label: "Nháp", tone: "neutral", icon: "lucide:circle-dashed" },
  WAITING: { label: "Chờ xử lý", tone: "warning", icon: "lucide:clock-4" },
  PENDING: { label: "Chờ xử lý", tone: "warning", icon: "lucide:clock-4" },
  PROCESSING: { label: "Đang xử lý", tone: "info", icon: "lucide:loader-circle" },
  IN_PROGRESS: { label: "Đang xử lý", tone: "info", icon: "lucide:loader-circle" },
  CONSOLIDATED: { label: "Đã gom", tone: "info", icon: "lucide:package-check" },
  IN_TRANSIT: { label: "Đang vận chuyển", tone: "info", icon: "lucide:truck" },
  SHIPPED: { label: "Đang vận chuyển", tone: "info", icon: "lucide:truck" },
  COMPLETED: { label: "Hoàn tất", tone: "success", icon: "lucide:circle-check-big" },
  DONE: { label: "Hoàn tất", tone: "success", icon: "lucide:circle-check-big" },
  CANCELLED: { label: "Đã hủy", tone: "danger", icon: "lucide:circle-x" },
};

export function getConsolidationStatusMeta(status) {
  const key = String(status ?? "").trim().toUpperCase();
  return (
    CONSOLIDATION_STATUS_META[key] ?? {
      label: key || "Không rõ",
      tone: "neutral",
      icon: "lucide:circle-dashed",
    }
  );
}

export function countConsolidationParcels(consolidation) {
  return (consolidation?.orders ?? []).reduce(
    (count, order) => count + (order?.parcels?.length ?? 0),
    0
  );
}

/** Tổng hợp KPI cho trang gom hàng từ danh sách ConsolidationResponseDto. */
export function buildConsolidationSummary(items) {
  const source = Array.isArray(items) ? items : [];
  const summary = {
    batches: source.length,
    waiting: 0,
    orders: 0,
    parcels: 0,
    totalWeight: 0,
    totalVolume: 0,
  };
  for (const item of source) {
    summary.orders += item?.orders?.length ?? 0;
    summary.parcels += countConsolidationParcels(item);
    summary.totalWeight += Number(item?.totalWeight) || 0;
    summary.totalVolume += Number(item?.totalVolume) || 0;
    if (getConsolidationStatusMeta(item?.status).tone === "warning") summary.waiting += 1;
  }
  return summary;
}

const READY_STATUSES = new Set(["APPROVED"]);
const MOVING_STATUSES = new Set(["IN_PROGRESS", "WAITING_FOR_PARCEL"]);
const COMPLETED_STATUSES = new Set(["COMPLETED"]);

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toUpperCase();
}

function isWithin(dateValue, from, to) {
  const timestamp = new Date(dateValue).getTime();
  return Number.isFinite(timestamp) && timestamp >= from.getTime() && timestamp <= to.getTime();
}

function matchesDimensions(item, { status, consignmentType }) {
  const wantedStatus = canonicalizeConsignmentStatus(status);
  const wantedType = String(consignmentType ?? "").trim().toUpperCase();
  return (
    (!wantedStatus || canonicalizeConsignmentStatus(item.status) === wantedStatus) &&
    (!wantedType || String(item.consignmentType ?? "").trim().toUpperCase() === wantedType)
  );
}

function countStatuses(items, statuses) {
  return items.reduce(
    (count, item) => count + (statuses.has(normalizeStatus(item.status)) ? 1 : 0),
    0
  );
}

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function buildKpi(key, value, previousValue) {
  return {
    key,
    value,
    previousValue,
    change: percentChange(value, previousValue),
  };
}

function toDateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildTrend(items, from, days) {
  const counts = new Map();
  for (const item of items) {
    if (!item.createdAt) continue;
    const key = toDateKey(item.createdAt);
    const bucket = counts.get(key) ?? { count: 0, totalWeight: 0 };
    bucket.count += 1;
    bucket.totalWeight += Number(item.totalWeight) || 0;
    counts.set(key, bucket);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(from, index);
    const key = toDateKey(date);
    const bucket = counts.get(key) ?? { count: 0, totalWeight: 0 };
    return {
      date: key,
      label: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      ...bucket,
    };
  });
}

function buildStatusBreakdown(items) {
  const counts = new Map();
  for (const item of items) {
    const status = canonicalizeConsignmentStatus(item.status) || "UNKNOWN";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([status, count]) => ({
      status,
      count,
      percent: items.length ? Math.round((count / items.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildTopRoutes(items) {
  const routes = new Map();
  for (const item of items) {
    const route = item.route || item.destination || "Chưa xác định";
    const current = routes.get(route) ?? { route, count: 0, totalWeight: 0 };
    current.count += 1;
    current.totalWeight += Number(item.totalWeight) || 0;
    routes.set(route, current);
  }

  return [...routes.values()]
    .sort((a, b) => b.count - a.count || b.totalWeight - a.totalWeight)
    .slice(0, 5);
}

/**
 * Tổng hợp dashboard từ danh sách consignment đã normalize.
 * ponytail: dùng tối đa 2.000 bản ghi từ facade; chuyển sang aggregate API khi BE hỗ trợ.
 */
export function buildOperationalAnalytics(
  items,
  { days = 30, status = "", consignmentType = "", now = new Date() } = {}
) {
  const safeDays = [7, 30, 90].includes(Number(days)) ? Number(days) : 30;
  const currentTo = new Date(now);
  const currentFrom = addDays(startOfDay(currentTo), -(safeDays - 1));
  const previousTo = new Date(currentFrom.getTime() - 1);
  const previousFrom = addDays(startOfDay(currentFrom), -safeDays);
  const source = Array.isArray(items) ? items : [];
  const dimensions = { status, consignmentType };

  const currentRows = source
    .filter(
      (item) =>
        matchesDimensions(item, dimensions) &&
        isWithin(item.createdAt, currentFrom, currentTo)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const previousRows = source.filter(
    (item) =>
      matchesDimensions(item, dimensions) &&
      isWithin(item.createdAt, previousFrom, previousTo)
  );

  const metric = (statuses) => [
    countStatuses(currentRows, statuses),
    countStatuses(previousRows, statuses),
  ];
  const [ready, previousReady] = metric(READY_STATUSES);
  const [moving, previousMoving] = metric(MOVING_STATUSES);
  const [completed, previousCompleted] = metric(COMPLETED_STATUSES);

  return {
    rows: currentRows,
    range: { from: currentFrom, to: currentTo, days: safeDays },
    kpis: [
      buildKpi("total", currentRows.length, previousRows.length),
      buildKpi("ready", ready, previousReady),
      buildKpi("moving", moving, previousMoving),
      buildKpi("completed", completed, previousCompleted),
    ],
    trend: buildTrend(currentRows, currentFrom, safeDays),
    statusBreakdown: buildStatusBreakdown(currentRows),
    topRoutes: buildTopRoutes(currentRows),
    totalWeight: currentRows.reduce((sum, item) => sum + (Number(item.totalWeight) || 0), 0),
  };
}
