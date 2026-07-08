"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import { useAuth } from "@/hooks/useAuth";
import { isMockMode } from "@/utils/mocks/dataSource";

const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_TYPE_FILTER_OPTIONS,
  CONSIGNMENT_STATUS_LABELS,
  formatConsignmentDate,
  formatConsignmentDisplayCode,
} = orderConsignmentService;

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING_REVIEW", label: CONSIGNMENT_STATUS_LABELS.PENDING_REVIEW },
  { value: "QUOTATION_SENT", label: CONSIGNMENT_STATUS_LABELS.QUOTATION_SENT },
  { value: "QUOTATION_CONFIRMED", label: CONSIGNMENT_STATUS_LABELS.QUOTATION_CONFIRMED },
  { value: "QUOTATION_REJECTED", label: CONSIGNMENT_STATUS_LABELS.QUOTATION_REJECTED },
  { value: "APPROVED", label: CONSIGNMENT_STATUS_LABELS.APPROVED },
  { value: "IN_PROGRESS", label: CONSIGNMENT_STATUS_LABELS.IN_PROGRESS },
  { value: "IN_WAREHOUSE", label: CONSIGNMENT_STATUS_LABELS.IN_WAREHOUSE },
  { value: "WAREHOUSE_RECEIVED", label: CONSIGNMENT_STATUS_LABELS.WAREHOUSE_RECEIVED },
  { value: "REJECTED", label: CONSIGNMENT_STATUS_LABELS.REJECTED },
  { value: "CANCELLED", label: CONSIGNMENT_STATUS_LABELS.CANCELLED },
  { value: "COMPLETED", label: CONSIGNMENT_STATUS_LABELS.COMPLETED },
];

const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  search: "",
  consignmentType: [],
  status: [],
  dateFrom: "",
  dateTo: "",
};

const MULTI_FILTER_KEYS = ["consignmentType", "status"];

const POPOVER_INPUT_CLASS =
  "w-full h-9 px-2.5 rounded-md border border-border-muted bg-surface text-sm text-ink input-focus-ring";

function StatusBadge({ status }) {
  return <ConsignmentStatusBadge status={status} />;
}

function hasActiveFilters(filters) {
  return Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
}

function OptionRow({ label, selected, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors ${
          selected ? "text-primary font-semibold" : "text-ink hover:bg-surface-muted"
        }`}
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
            selected ? "border-primary bg-primary text-white" : "border-border-muted"
          }`}
        >
          {selected ? <Icon icon="lucide:check" className="w-3 h-3" /> : null}
        </span>
        <span className="truncate">{label}</span>
      </button>
    </li>
  );
}

function SortCarets({ direction }) {
  return (
    <span className="inline-flex flex-col items-center justify-center leading-0 -space-y-1">
      <Icon
        icon="lucide:chevron-up"
        className={`w-3 h-3 ${direction === "asc" ? "text-primary" : "text-muted/40"}`}
      />
      <Icon
        icon="lucide:chevron-down"
        className={`w-3 h-3 ${direction === "desc" ? "text-primary" : "text-muted/40"}`}
      />
    </span>
  );
}

function ColumnHeader({
  title,
  align = "left",
  sortKey,
  sort,
  onSort,
  filterKey,
  isFilterActive,
  openKey,
  onToggleFilter,
}) {
  const buttonRef = useRef(null);
  const isSorted = sortKey && sort.by === sortKey;
  const isOpen = filterKey && openKey === filterKey;
  const direction = isSorted ? sort.dir : null;

  const titleContent = (
    <>
      <span className="truncate">{title}</span>
      {sortKey ? <SortCarets direction={direction} /> : null}
    </>
  );

  return (
    <th className={`px-6 py-4 text-sm font-bold select-none ${align === "right" ? "text-right" : ""}`}>
      <div className={`flex items-stretch gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {sortKey ? (
          <button
            type="button"
            onClick={() => onSort(sortKey)}
            className="group flex flex-1 items-center gap-1.5 -mx-1 px-1 rounded transition-colors hover:bg-surface-muted/60"
            title="Sắp xếp"
          >
            {titleContent}
          </button>
        ) : (
          <span className="flex flex-1 items-center gap-1.5">{titleContent}</span>
        )}

        {filterKey ? (
          <button
            ref={buttonRef}
            type="button"
            onClick={() => onToggleFilter(filterKey, buttonRef.current)}
            className={`shrink-0 flex items-center justify-center w-6 rounded transition-colors ${
              isFilterActive
                ? "text-primary bg-primary/10"
                : isOpen
                  ? "text-ink bg-surface-muted"
                  : "text-muted/60 hover:text-ink hover:bg-surface-muted/60"
            }`}
            title="Lọc"
          >
            <Icon
              icon="lucide:filter"
              className="w-3.5 h-3.5"
              fill={isFilterActive ? "currentColor" : "none"}
            />
          </button>
        ) : null}
      </div>
    </th>
  );
}

export default function ConsignmentListPanel() {
  const router = useRouter();
  const { session } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState({ by: "", dir: "asc" });
  const [openFilter, setOpenFilter] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null);
  const popoverRef = useRef(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedFilters(filters), 300);
    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [appliedFilters, sort]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const response = await orderConsignmentService.listStaffConsignments({
          page,
          pageSize: PAGE_SIZE,
          status: appliedFilters.status.length ? appliedFilters.status : undefined,
          search: appliedFilters.search.trim() || undefined,
          consignmentType: appliedFilters.consignmentType.length
            ? appliedFilters.consignmentType
            : undefined,
          dateFrom: appliedFilters.dateFrom || undefined,
          dateTo: appliedFilters.dateTo || undefined,
          sortBy: sort.by || undefined,
          sortDir: sort.by ? sort.dir : undefined,
        });
        if (active) setData(response);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [page, appliedFilters, sort]);

  useEffect(() => {
    if (!openFilter) return undefined;

    function handleOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    }
    function handleClose() {
      setOpenFilter(null);
    }

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("resize", handleClose);
    window.addEventListener("scroll", handleClose, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("resize", handleClose);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [openFilter]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleArrayFilter(key, value) {
    setFilters((current) => {
      const list = Array.isArray(current[key]) ? current[key] : [];
      const next = list.includes(value)
        ? list.filter((entry) => entry !== value)
        : [...list, value];
      return { ...current, [key]: next };
    });
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setOpenFilter(null);
  }

  function resetColumnFilter(key) {
    if (key === "dateRange") {
      setFilters((current) => ({ ...current, dateFrom: "", dateTo: "" }));
    } else if (MULTI_FILTER_KEYS.includes(key)) {
      setFilters((current) => ({ ...current, [key]: [] }));
    } else {
      setFilters((current) => ({ ...current, [key]: "" }));
    }
  }

  function isColumnFilterDirty(key) {
    if (key === "dateRange") return Boolean(filters.dateFrom || filters.dateTo);
    if (MULTI_FILTER_KEYS.includes(key)) return filters[key].length > 0;
    return Boolean(filters[key]);
  }

  function handleSort(sortKey) {
    setSort((current) => {
      if (current.by !== sortKey) return { by: sortKey, dir: "asc" };
      if (current.dir === "asc") return { by: sortKey, dir: "desc" };
      return { by: "", dir: "asc" };
    });
  }

  function toggleFilter(key, anchorEl) {
    if (openFilter === key) {
      setOpenFilter(null);
      return;
    }
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPopoverPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpenFilter(key);
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;
  const filtersActive = hasActiveFilters(appliedFilters);

  const showSaleApiEmptyHint =
    process.env.NODE_ENV === "development" &&
    !isMockMode() &&
    session?.role === "Sale" &&
    !isLoading &&
    !error &&
    totalCount === 0 &&
    !filtersActive;

  const columnHeaderProps = {
    sort,
    onSort: handleSort,
    openKey: openFilter,
    onToggleFilter: toggleFilter,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          Quản lý ký gửi
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Xem và xử lý yêu cầu ký gửi từ khách hàng. Ưu tiên{" "}
          <span className="text-warning-text font-bold">chờ duyệt</span>.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {showSaleApiEmptyHint ? (
        <div className="rounded-lg border border-warning-bg bg-warning-bg/40 px-4 py-3 text-sm text-ink">
          <p className="font-semibold">API trả về 0 yêu cầu cho role Sale</p>
          <p className="text-muted mt-1">
            Backend hiện chỉ trả danh sách đầy đủ cho Admin/Customer. Team BE cần mở quyền xem
            danh sách ký gửi cho Sale trên GET /api/orders/consignments.
          </p>
        </div>
      ) : null}

      <div className="bg-surface-elevated rounded-xl shadow-sm overflow-hidden border border-border-muted">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-border-muted">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-extrabold font-['Oswald']">Danh sách yêu cầu</h3>
            {!isLoading ? (
              <span className="text-sm text-muted font-medium">{totalCount} yêu cầu</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Icon
                icon="lucide:search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
              />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Tìm theo mã yêu cầu hoặc tên khách..."
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-border-muted bg-surface-elevated text-sm text-ink input-focus-ring"
              />
            </div>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border-muted text-xs font-semibold text-muted hover:text-ink hover:bg-surface-muted whitespace-nowrap"
                title="Xóa bộ lọc"
              >
                <Icon icon="lucide:filter-x" className="w-3.5 h-3.5" />
                Xóa lọc
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border-muted bg-surface/60">
                <ColumnHeader {...columnHeaderProps} title="Mã yêu cầu" sortKey="code" />
                <ColumnHeader
                  {...columnHeaderProps}
                  title="Người nhận"
                  sortKey="receiverName"
                />
                <ColumnHeader
                  {...columnHeaderProps}
                  title="Loại ký gửi"
                  sortKey="consignmentType"
                  filterKey="consignmentType"
                  isFilterActive={filters.consignmentType.length > 0}
                />
                <ColumnHeader
                  {...columnHeaderProps}
                  title="Trạng thái"
                  sortKey="status"
                  filterKey="status"
                  isFilterActive={filters.status.length > 0}
                />
                <ColumnHeader
                  {...columnHeaderProps}
                  title="Ngày tạo"
                  sortKey="createdAt"
                  filterKey="dateRange"
                  isFilterActive={Boolean(filters.dateFrom || filters.dateTo)}
                />
                <th className="px-6 py-4 text-sm font-bold text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted">
                      <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                      Đang tải danh sách...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Icon icon="lucide:inbox" className="w-10 h-10 text-muted mx-auto mb-3" />
                    <p className="text-sm font-semibold text-ink">Chưa có yêu cầu ký gửi nào</p>
                    <p className="text-sm text-muted mt-1">
                      {filtersActive
                        ? "Thử đổi bộ lọc hoặc xóa bộ lọc."
                        : "Yêu cầu mới từ khách hàng sẽ hiển thị tại đây."}
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-muted transition-colors cursor-pointer"
                    onClick={() => router.push(ROUTES.sales.consignment(item.id))}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-secondary">
                      {formatConsignmentDisplayCode(item) ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{item.receiverName || "—"}</td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {CONSIGNMENT_TYPE_LABELS[item.consignmentType] || item.consignmentType}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {formatConsignmentDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={ROUTES.sales.consignment(item.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center justify-center p-2 rounded-lg border border-secondary/30 text-secondary hover:bg-surface-muted transition-colors"
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết"
                      >
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalCount > 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border-muted">
            <p className="text-sm text-muted">
              Trang {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted"
              >
                Sau
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {openFilter && popoverPos ? (
        <div
          ref={popoverRef}
          style={{ position: "fixed", top: popoverPos.top, left: popoverPos.left, zIndex: 50 }}
          className="w-60 rounded-lg border border-border-muted bg-surface-elevated shadow-xl overflow-hidden"
        >
          <div className="p-2">
            {openFilter === "consignmentType" ? (
              <ul className="max-h-64 overflow-y-auto custom-scrollbar -m-2 py-1">
                {CONSIGNMENT_TYPE_FILTER_OPTIONS.filter((option) => option.value).map((option) => (
                  <OptionRow
                    key={option.value}
                    label={option.label}
                    selected={filters.consignmentType.includes(option.value)}
                    onClick={() => toggleArrayFilter("consignmentType", option.value)}
                  />
                ))}
              </ul>
            ) : null}

            {openFilter === "status" ? (
              <ul className="max-h-64 overflow-y-auto custom-scrollbar -m-2 py-1">
                {STATUS_FILTER_OPTIONS.filter((option) => option.value).map((option) => (
                  <OptionRow
                    key={option.value}
                    label={option.label}
                    selected={filters.status.includes(option.value)}
                    onClick={() => toggleArrayFilter("status", option.value)}
                  />
                ))}
              </ul>
            ) : null}

            {openFilter === "dateRange" ? (
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) => updateFilter("dateFrom", event.target.value)}
                  className={POPOVER_INPUT_CLASS}
                  title="Từ ngày"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) => updateFilter("dateTo", event.target.value)}
                  className={POPOVER_INPUT_CLASS}
                  title="Đến ngày"
                />
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-border-muted px-2 py-2">
            <button
              type="button"
              disabled={!isColumnFilterDirty(openFilter)}
              onClick={() => resetColumnFilter(openFilter)}
              className="text-xs font-semibold text-muted hover:text-ink disabled:opacity-40 disabled:hover:text-muted"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => setOpenFilter(null)}
              className="h-7 px-4 rounded-md bg-primary text-white text-xs font-bold hover:opacity-90"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
