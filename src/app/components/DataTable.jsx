"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Bảng dữ liệu kiểu Ant Design (client-side): search tổng + sort theo cột +
 * filter funnel (chọn nhiều) + phân trang.
 *
 * Column config:
 * {
 *   key: string,
 *   title: string,
 *   align?: "left" | "right",
 *   sortable?: boolean,
 *   sortAccessor?: (row) => string | number,
 *   filter?: { options: { value: string, label: string }[] },
 *   filterAccessor?: (row) => string,     // giá trị so khớp với option đã chọn
 *   searchable?: boolean,
 *   searchAccessor?: (row) => string,     // text đưa vào search tổng
 *   render?: (row) => ReactNode,          // mặc định row[key]
 *   className?: string,                   // class cho <td>
 *   headerClassName?: string,             // class cho <th>
 * }
 */

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

const POPOVER_INPUT_CLASS =
  "w-full h-9 px-2.5 rounded-md border border-border-muted bg-surface text-sm text-ink input-focus-ring";

function defaultSortAccessor(column) {
  return (row) => {
    const value = row[column.key];
    return value == null ? "" : value;
  };
}

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "vi", { numeric: true, sensitivity: "base" });
}

function isDateRangeFilter(col) {
  return col?.filter?.type === "dateRange";
}

function withinDateRange(value, from, to) {
  if (!from && !to) return true;
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59.999`)) return false;
  return true;
}

function isFilterValueActive(col, value) {
  if (isDateRangeFilter(col)) return Boolean(value?.from || value?.to);
  return Array.isArray(value) && value.length > 0;
}

export default function DataTable({
  columns,
  rows,
  loading = false,
  rowKey = (row, index) => row.id ?? index,
  onRowClick,
  title,
  countLabel = "mục",
  searchPlaceholder = "Tìm kiếm...",
  pageSize = 10,
  emptyText = "Không có dữ liệu.",
  emptyFilteredText = "Không tìm thấy kết quả phù hợp. Thử đổi bộ lọc.",
  headerRight = null,
  minWidth = 900,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ by: "", dir: "asc" });
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null);
  const popoverRef = useRef(null);

  const hasSearch = useMemo(() => columns.some((col) => col.searchable), [columns]);
  const columnByKey = useMemo(
    () => Object.fromEntries(columns.map((col) => [col.key, col])),
    [columns]
  );

  const filtersActive =
    Boolean(search.trim()) ||
    Object.entries(filters).some(([key, value]) =>
      isFilterValueActive(columnByKey[key], value)
    );

  useEffect(() => {
    setPage(1);
  }, [search, sort, filters]);

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

  const processedRows = useMemo(() => {
    let result = Array.isArray(rows) ? [...rows] : [];

    const query = search.trim().toLowerCase();
    if (query && hasSearch) {
      result = result.filter((row) =>
        columns
          .filter((col) => col.searchable)
          .some((col) => {
            const text = col.searchAccessor ? col.searchAccessor(row) : row[col.key];
            return String(text ?? "").toLowerCase().includes(query);
          })
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      const col = columnByKey[key];
      if (!col?.filter) continue;
      const accessor = col.filterAccessor ?? ((row) => row[key]);

      if (isDateRangeFilter(col)) {
        if (!value?.from && !value?.to) continue;
        result = result.filter((row) => withinDateRange(accessor(row), value.from, value.to));
      } else {
        if (!Array.isArray(value) || !value.length) continue;
        result = result.filter((row) => value.includes(String(accessor(row))));
      }
    }

    if (sort.by) {
      const col = columnByKey[sort.by];
      if (col) {
        const accessor = col.sortAccessor ?? defaultSortAccessor(col);
        const direction = sort.dir === "desc" ? -1 : 1;
        result.sort((a, b) => compareValues(accessor(a), accessor(b)) * direction);
      }
    }

    return result;
  }, [rows, search, hasSearch, columns, filters, columnByKey, sort]);

  const totalCount = processedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = processedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleSort(key) {
    setSort((current) => {
      if (current.by !== key) return { by: key, dir: "asc" };
      if (current.dir === "asc") return { by: key, dir: "desc" };
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

  function toggleFilterValue(key, value) {
    setFilters((current) => {
      const list = Array.isArray(current[key]) ? current[key] : [];
      const next = list.includes(value)
        ? list.filter((entry) => entry !== value)
        : [...list, value];
      return { ...current, [key]: next };
    });
  }

  function setDateRange(key, part, value) {
    setFilters((current) => ({
      ...current,
      [key]: { ...(current[key] ?? {}), [part]: value },
    }));
  }

  function resetColumnFilter(key, col) {
    setFilters((current) => ({
      ...current,
      [key]: isDateRangeFilter(col) ? { from: "", to: "" } : [],
    }));
  }

  function clearAll() {
    setSearch("");
    setFilters({});
    setOpenFilter(null);
  }

  const openColumn = openFilter ? columnByKey[openFilter] : null;

  return (
    <div className="bg-surface-elevated rounded-xl shadow-sm overflow-hidden border border-border-muted">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-border-muted">
        <div className="flex items-center gap-3">
          {title ? (
            <h3 className="text-lg font-extrabold font-['Oswald']">{title}</h3>
          ) : null}
          {!loading ? (
            <span className="text-sm text-muted font-medium">
              {totalCount} {countLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {hasSearch ? (
            <div className="relative flex-1 sm:w-72">
              <Icon
                icon="lucide:search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-border-muted bg-surface-elevated text-sm text-ink input-focus-ring"
              />
            </div>
          ) : null}
          {filtersActive ? (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-border-muted text-xs font-semibold text-muted hover:text-ink hover:bg-surface-muted whitespace-nowrap"
              title="Xóa bộ lọc"
            >
              <Icon icon="lucide:filter-x" className="w-3.5 h-3.5" />
              Xóa lọc
            </button>
          ) : null}
          {headerRight}
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-border-muted bg-surface/60">
              {columns.map((col) => {
                const isSorted = col.sortable && sort.by === col.key;
                const isOpen = openFilter === col.key;
                const isFilterActive = isFilterValueActive(col, filters[col.key]);
                return (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-sm font-bold select-none ${
                      col.align === "right" ? "text-right" : ""
                    } ${col.headerClassName ?? ""}`}
                  >
                    <div
                      className={`flex items-center gap-0.5 ${
                        col.align === "right" ? "justify-end" : ""
                      }`}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="group inline-flex items-center gap-1 -mx-1 px-1 rounded transition-colors hover:bg-surface-muted/60"
                          title="Sắp xếp"
                        >
                          <span className="truncate">{col.title}</span>
                          <SortCarets direction={isSorted ? sort.dir : null} />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="truncate">{col.title}</span>
                        </span>
                      )}

                      {col.filter ? (
                        <button
                          type="button"
                          onClick={(event) => toggleFilter(col.key, event.currentTarget)}
                          className={`shrink-0 flex items-center justify-center w-6 h-6 rounded transition-colors ${
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
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-muted">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-muted">
                    <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <Icon icon="lucide:inbox" className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-sm text-muted">
                    {filtersActive ? emptyFilteredText : emptyText}
                  </p>
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  className={`transition-colors ${
                    onRowClick ? "hover:bg-surface-muted cursor-pointer" : "hover:bg-surface-muted/50"
                  }`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm ${
                        col.align === "right" ? "text-right" : ""
                      } ${col.className ?? ""}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalCount > pageSize ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border-muted">
          <p className="text-sm text-muted">
            Trang {safePage} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted"
            >
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
              Trước
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border-muted text-sm font-semibold disabled:opacity-40 hover:bg-surface-muted"
            >
              Sau
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      {openColumn?.filter && popoverPos ? (
        <div
          ref={popoverRef}
          style={{ position: "fixed", top: popoverPos.top, left: popoverPos.left, zIndex: 50 }}
          className="w-60 rounded-lg border border-border-muted bg-surface-elevated shadow-xl overflow-hidden"
        >
          {isDateRangeFilter(openColumn) ? (
            <div className="space-y-2 p-3">
              <label className="block text-[11px] font-semibold text-muted">Từ ngày</label>
              <input
                type="date"
                value={filters[openColumn.key]?.from ?? ""}
                onChange={(event) => setDateRange(openColumn.key, "from", event.target.value)}
                className={POPOVER_INPUT_CLASS}
              />
              <label className="block text-[11px] font-semibold text-muted">Đến ngày</label>
              <input
                type="date"
                value={filters[openColumn.key]?.to ?? ""}
                onChange={(event) => setDateRange(openColumn.key, "to", event.target.value)}
                className={POPOVER_INPUT_CLASS}
              />
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto custom-scrollbar py-1">
              {openColumn.filter.options.map((option) => (
                <OptionRow
                  key={option.value}
                  label={option.label}
                  selected={Boolean(filters[openColumn.key]?.includes(option.value))}
                  onClick={() => toggleFilterValue(openColumn.key, option.value)}
                />
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between border-t border-border-muted px-2 py-2">
            <button
              type="button"
              disabled={!isFilterValueActive(openColumn, filters[openColumn.key])}
              onClick={() => resetColumnFilter(openColumn.key, openColumn)}
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
