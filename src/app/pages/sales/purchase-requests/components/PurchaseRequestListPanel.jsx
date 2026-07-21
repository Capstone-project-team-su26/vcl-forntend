"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as purchaseRequestService from "@/modules/purchase-requests";
import { toast } from "@/app/components/ToastProvider";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_STYLES,
  formatPurchaseRequestDate,
  getPurchaseRequest,
} = purchaseRequestService;

const PAGE_SIZE = 5;
const DETAIL_TTL_MS = 5 * 60 * 1000;
const detailCache = new Map();
const detailInflight = new Map();

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  ...Object.entries(PURCHASE_REQUEST_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const EMPTY_FILTERS = {
  search: "",
  status: "",
};

function hasActiveFilters(filters) {
  return Boolean(filters.search.trim() || filters.status);
}

function clearPurchaseRequestDetailCache() {
  detailCache.clear();
  detailInflight.clear();
}

async function getCachedPurchaseRequestDetail(id) {
  if (!id) return null;

  const hit = detailCache.get(id);
  if (hit && Date.now() - hit.at < DETAIL_TTL_MS) return hit.data;

  const pending = detailInflight.get(id);
  if (pending) return pending;

  const request = getPurchaseRequest(id)
    .then((data) => {
      detailCache.set(id, { at: Date.now(), data });
      detailInflight.delete(id);
      return data;
    })
    .catch((error) => {
      detailInflight.delete(id);
      throw error;
    });

  detailInflight.set(id, request);
  return request;
}

/** List API thiếu SĐT/địa chỉ/tuyến — gộp từ GET chi tiết. */
function mergeSummaryWithDetail(summary, detail) {
  if (!summary) return null;
  if (!detail) return summary;

  return {
    ...summary,
    customerName: detail.customerName || summary.customerName,
    receiverName: detail.receiverName ?? summary.receiverName,
    receiverPhone: detail.receiverPhone ?? summary.receiverPhone,
    receiverAddress: detail.receiverAddress ?? summary.receiverAddress,
    route: detail.route ?? summary.route,
    requiresInspection:
      detail.requiresInspection === true || summary.requiresInspection === true,
    requiresQuantityCheck:
      detail.requiresQuantityCheck === true || summary.requiresQuantityCheck === true,
    items: detail.items?.length ? detail.items : summary.items,
    totalQuantity: detail.totalQuantity ?? summary.totalQuantity,
    itemCount: detail.itemCount ?? summary.itemCount ?? detail.items?.length,
    // List status mới hơn cache detail
    status: summary.status ?? detail.status,
  };
}

async function copyText(text) {
  if (!text || typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function productNamesOf(item) {
  if (Array.isArray(item.items) && item.items.length) {
    return item.items.map((entry) => entry.productName).filter(Boolean);
  }
  return [];
}

function StatusBadge({ status, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm ${
        PURCHASE_REQUEST_STATUS_STYLES[status] ||
        "bg-surface-muted text-ink border-2 border-border"
      } ${className}`}
    >
      {PURCHASE_REQUEST_STATUS_LABELS[status] || status}
    </span>
  );
}

function PaginationBar({ page, totalPages, totalCount, pageSize, onPageChange, sticky = false }) {
  if (totalCount <= 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border-muted bg-surface-elevated px-4 py-3 shadow-sm ${
        sticky
          ? "sticky bottom-0 z-20 border-t bg-surface-elevated/95 backdrop-blur supports-backdrop-filter:bg-surface-elevated/90"
          : ""
      }`}
    >
      <p className="text-sm text-muted">
        {from}–{to} / {totalCount} · Trang {page}/{totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted"
        >
          <Icon icon="lucide:chevron-left" className="w-4 h-4" />
          Trước
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted"
        >
          Sau
          <Icon icon="lucide:chevron-right" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PurchaseRequestCard({ item, onOpen, detailLoading }) {
  const [copied, setCopied] = useState(false);
  const requestCode = item.requestCode || item.id || "—";
  const productNames = productNamesOf(item);
  const productCount = item.itemCount ?? productNames.length;
  const thumb = item.items?.find((entry) => entry.imageUrl)?.imageUrl ?? null;

  async function handleCopy(event) {
    event.stopPropagation();
    const ok = await copyText(String(requestCode));
    if (!ok) {
      toast.error("Không sao chép được mã.");
      return;
    }
    setCopied(true);
    toast.success("Đã sao chép mã.");
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item.id);
        }
      }}
      aria-label={`Xem chi tiết yêu cầu mua hộ ${requestCode}`}
      className="rounded-xl border border-border-muted bg-surface-elevated shadow-sm hover:border-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div>
                <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted">
                  Mã yêu cầu
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <strong className="text-base font-bold text-ink break-all">{requestCode}</strong>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-border-muted text-[11px] font-semibold text-muted hover:text-ink hover:bg-surface-muted"
                    title="Sao chép mã yêu cầu"
                    aria-label={`Sao chép mã yêu cầu ${requestCode}`}
                  >
                    <Icon
                      icon={copied ? "lucide:check" : "lucide:copy"}
                      className="w-3.5 h-3.5"
                    />
                    {copied ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-warning-bg/70 text-warning-text text-[11px] font-bold uppercase tracking-wide">
                  Mua hộ
                </span>
                {item.route ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-border-muted bg-info-bg text-ink text-[11px] font-semibold">
                    Tuyến {item.route}
                  </span>
                ) : null}
                <StatusBadge status={item.status} className="px-2.5 py-1 text-[11px]" />
              </div>
            </div>

            <Link
              href={ROUTES.sales.purchaseRequest(item.id)}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex items-center gap-1.5 shrink-0 text-sm font-bold text-primary hover:text-secondary"
            >
              Xem chi tiết
              <Icon icon="lucide:arrow-right" className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted">
            <span>
              Khách hàng: <strong className="text-ink">{item.customerName || "—"}</strong>
            </span>
            <span>
              Người nhận:{" "}
              <strong className="text-ink">{item.receiverName || item.customerName || "—"}</strong>
            </span>
            <span>
              Ngày tạo:{" "}
              <strong className="text-ink">{formatPurchaseRequestDate(item.createdAt)}</strong>
            </span>
            <span className="sm:ml-auto">
              KIỂM HÀNG:{" "}
              <strong className={item.requiresInspection ? "text-success-text" : "text-ink"}>
                {detailLoading ? "…" : item.requiresInspection ? "Có" : "Không"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-0 border-t border-border-muted lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex gap-3 p-5 bg-surface/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-primary/10 text-secondary border border-border-muted">
            {thumb ? (
              <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <Icon icon="lucide:shopping-bag" className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted">
                  Sản phẩm
                </span>
                {productCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-white text-xs font-extrabold shadow-sm ring-1 ring-primary/30">
                    <Icon icon="lucide:package" className="w-3.5 h-3.5 shrink-0" aria-hidden />
                    {productCount} sản phẩm
                  </span>
                ) : detailLoading ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                    <Icon icon="lucide:loader-2" className="w-3 h-3 animate-spin" />
                    Đang tải…
                  </span>
                ) : null}
              </div>
              {productNames.length > 0 ? (
                <ol className="space-y-1">
                  {productNames.map((name, index) => (
                    <li key={`${item.id}-${name}-${index}`} className="flex gap-2 text-sm text-ink">
                      <span className="text-muted font-semibold tabular-nums">{index + 1}.</span>
                      <strong className="font-semibold truncate" title={name}>
                        {name}
                      </strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm font-medium text-muted">
                  {detailLoading ? "Đang tải sản phẩm…" : "Chưa có tên sản phẩm"}
                </p>
              )}
            </div>

            <div className="inline-flex max-w-full items-center px-2.5 py-1 rounded-md bg-warning-bg text-warning-text text-xs font-bold truncate">
              Mã YC: {requestCode}
            </div>

            <div className="space-y-1 text-sm text-muted">
              <p>
                Số điện thoại:{" "}
                <strong className="text-ink">
                  {item.receiverPhone || (detailLoading ? "…" : "—")}
                </strong>
              </p>
              <p>
                Địa chỉ:{" "}
                <strong className="text-ink wrap-break-word">
                  {item.receiverAddress || (detailLoading ? "…" : "—")}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-t border-border-muted p-5 lg:border-t-0 lg:border-l bg-surface-elevated">
          <StatusBadge status={item.status} />
          <div className="text-center">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted mb-1">
              Loại yêu cầu
            </p>
            <p className="text-sm font-bold text-ink uppercase">Mua hộ</p>
          </div>
          <div className="w-full space-y-1 text-sm text-muted">
            <p className="flex justify-between gap-3">
              <span>Số SP</span>
              <strong className="text-ink">{productCount || "—"}</strong>
            </p>
            <p className="flex justify-between gap-3">
              <span>Tổng SL</span>
              <strong className="text-ink">
                {item.totalQuantity != null
                  ? item.totalQuantity
                  : productNames.length
                    ? item.items.reduce((sum, entry) => sum + (Number(entry.quantity) || 0), 0)
                    : "—"}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PurchaseRequestListPanel() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsById, setDetailsById] = useState({});
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedFilters(filters), 300);
    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [appliedFilters, refreshKey]);

  useEffect(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const response = await purchaseRequestService.listPurchaseRequests({
          page,
          pageSize: PAGE_SIZE,
          status: appliedFilters.status || undefined,
          search: appliedFilters.search.trim() || undefined,
        });
        if (active) setData(response);
      } catch (err) {
        if (active) {
          setData(null);
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [page, appliedFilters, refreshKey]);

  const listItems = data?.items ?? [];
  const listItemIds = listItems.map((item) => item.id).join(",");

  useEffect(() => {
    if (!listItems.length) {
      setDetailsLoading(false);
      return;
    }

    let active = true;
    setDetailsLoading(true);

    async function enrich() {
      const entries = await Promise.all(
        listItems.map(async (item) => {
          try {
            const detail = await getCachedPurchaseRequestDetail(item.id);
            return [item.id, detail];
          } catch {
            return [item.id, null];
          }
        })
      );
      if (!active) return;

      const next = {};
      for (const [id, detail] of entries) {
        if (detail) next[id] = detail;
      }
      setDetailsById((current) => ({ ...current, ...next }));
      setDetailsLoading(false);
    }

    enrich();
    return () => {
      active = false;
    };
    // listItemIds + refreshKey: đổi trang / làm mới → hydrate lại SĐT + địa chỉ
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [listItemIds, refreshKey]);

  const items = useMemo(
    () => listItems.map((item) => mergeSummaryWithDetail(item, detailsById[item.id])),
    [listItems, detailsById]
  );

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function handleRefresh() {
    clearPurchaseRequestDetailCache();
    setDetailsById({});
    setRefreshKey((current) => current + 1);
  }

  function openDetail(id) {
    if (!id) return;
    router.push(ROUTES.sales.purchaseRequest(id));
  }

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(nextPage, 1), Math.max(data?.totalPages ?? 1, 1)));
  }

  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const filtersActive = hasActiveFilters(appliedFilters);
  const pendingCount = items.filter((item) => item.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink uppercase">
            Yêu cầu mua hộ chờ xử lý
          </h1>
          <p className="text-muted text-sm font-medium mt-2">
            Kiểm tra và xử lý yêu cầu mua hộ từ khách hàng. Ưu tiên{" "}
            <span className="text-warning-text font-bold">chờ xử lý</span>.
          </p>
        </div>

        <div className="rounded-xl border border-border-muted bg-surface-elevated px-4 py-2.5 text-center shadow-sm shrink-0">
          <p className="text-2xl font-black text-ink tabular-nums leading-none">
            {isLoading ? "…" : totalCount}
          </p>
          <p className="text-[11px] font-semibold text-muted mt-1">
            {filtersActive ? "Kết quả lọc" : "Tổng yêu cầu"}
            {!filtersActive && !isLoading && pendingCount > 0
              ? ` · ${pendingCount} chờ xử lý (trang này)`
              : ""}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border-muted bg-surface-elevated p-3 shadow-sm">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 min-w-0">
            <Icon
              icon="lucide:search"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Tìm mã yêu cầu, khách hàng, sản phẩm..."
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-border-muted bg-surface text-sm text-ink input-focus-ring"
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className="h-10 min-w-[180px] px-3 rounded-lg border border-border-muted bg-surface text-sm text-ink input-focus-ring"
            aria-label="Lọc theo trạng thái"
            title="Trạng thái"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {filtersActive ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border-muted text-xs font-semibold text-muted hover:text-ink hover:bg-surface-muted"
            >
              <Icon icon="lucide:filter-x" className="w-3.5 h-3.5" />
              Xóa lọc
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border-muted text-xs font-bold uppercase tracking-wide text-ink hover:bg-surface-muted disabled:opacity-50"
          >
            <Icon
              icon="lucide:refresh-cw"
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border-muted bg-surface-elevated py-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted">
            <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
            Đang tải danh sách...
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border-muted bg-surface-elevated py-16 text-center px-6">
          <Icon icon="lucide:inbox" className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink">Chưa có yêu cầu mua hộ nào</p>
          <p className="text-sm text-muted mt-1">
            {filtersActive
              ? "Thử đổi bộ lọc hoặc xóa bộ lọc."
              : "Yêu cầu mới từ khách hàng sẽ hiển thị tại đây."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <PurchaseRequestCard
              key={item.id}
              item={item}
              onOpen={openDetail}
              detailLoading={detailsLoading && !detailsById[item.id]}
            />
          ))}
        </div>
      )}

      {!isLoading && totalCount > 0 ? (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={goToPage}
          sticky
        />
      ) : null}
    </div>
  );
}
