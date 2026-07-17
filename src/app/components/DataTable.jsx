"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./DataTable.module.scss";

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
 *   filterAccessor?: (row) => string,
 *   searchable?: boolean,
 *   searchAccessor?: (row) => string,
 *   render?: (row) => ReactNode,
 *   className?: string,
 *   headerClassName?: string,
 * }
 */

const SEARCH_DEBOUNCE_MS = 250;

function OptionRow({ label, selected, onClick }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`${styles.optionBtn} ${selected ? styles.selected : ""}`}
      >
        <span className={styles.optionCheck}>
          {selected ? <Icon icon="lucide:check" className={styles.iconXs} /> : null}
        </span>
        <span className={styles.optionLabel}>{label}</span>
      </button>
    </li>
  );
}

function SortCarets({ direction, active }) {
  return (
    <span className={`${styles.sortCarets} ${active ? styles.active : ""}`}>
      <Icon
        icon="lucide:chevron-up"
        className={`${styles.sortCaretIcon} ${direction === "asc" ? styles.highlight : ""}`}
      />
      <Icon
        icon="lucide:chevron-down"
        className={`${styles.sortCaretIcon} ${direction === "desc" ? styles.highlight : ""}`}
      />
    </span>
  );
}

const POPOVER_INPUT_CLASS = `${styles.popoverInput} input-focus-ring`;

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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ by: "", dir: "asc" });
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [openFilter, setOpenFilter] = useState(null);
  const [popoverPos, setPopoverPos] = useState(null);
  const popoverRef = useRef(null);
  const searchRef = useRef(null);

  const hasSearch = useMemo(() => columns.some((col) => col.searchable), [columns]);
  const columnByKey = useMemo(
    () => Object.fromEntries(columns.map((col) => [col.key, col])),
    [columns]
  );
  const searchPending = searchInput !== search;

  const filtersActive =
    Boolean(search.trim()) ||
    Object.entries(filters).some(([key, value]) =>
      isFilterValueActive(columnByKey[key], value)
    );

  useEffect(() => {
    if (searchInput === search) return undefined;
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    if (!hasSearch) return undefined;
    function handleSlash(event) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener("keydown", handleSlash);
    return () => document.removeEventListener("keydown", handleSlash);
  }, [hasSearch]);

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
  const sourceCount = Array.isArray(rows) ? rows.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = processedRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  function handleSort(key) {
    setPage(1);
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
    setPage(1);
    setFilters((current) => {
      const list = Array.isArray(current[key]) ? current[key] : [];
      const next = list.includes(value)
        ? list.filter((entry) => entry !== value)
        : [...list, value];
      return { ...current, [key]: next };
    });
  }

  function setDateRange(key, part, value) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: { ...(current[key] ?? {}), [part]: value },
    }));
  }

  function resetColumnFilter(key, col) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: isDateRangeFilter(col) ? { from: "", to: "" } : [],
    }));
  }

  function clearAll() {
    setSearchInput("");
    setSearch("");
    setFilters({});
    setOpenFilter(null);
    setPage(1);
  }

  const openColumn = openFilter ? columnByKey[openFilter] : null;
  const showFilteredCount = filtersActive && !loading;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {title ? <h3 className={styles.title}>{title}</h3> : null}
          {!loading ? (
            <span className={styles.count}>
              {showFilteredCount
                ? `${totalCount} / ${sourceCount} ${countLabel}`
                : `${totalCount} ${countLabel}`}
            </span>
          ) : null}
        </div>
        <div className={styles.headerRight}>
          {hasSearch ? (
            <div className={styles.searchWrap}>
              <Icon icon="lucide:search" className={styles.searchIcon} />
              <input
                ref={searchRef}
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={searchPlaceholder}
                className={`${styles.searchInput} input-focus-ring`}
                aria-label={searchPlaceholder}
              />
              <div className={styles.searchActions}>
                {searchPending ? (
                  <Icon icon="lucide:loader-2" className={`${styles.iconMd} ${styles.spin}`} />
                ) : null}
                {searchInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                      searchRef.current?.focus();
                    }}
                    className={styles.clearSearchBtn}
                    title="Xóa tìm kiếm"
                    aria-label="Xóa tìm kiếm"
                  >
                    <Icon icon="lucide:x" className={styles.iconSm} />
                  </button>
                ) : (
                  <kbd className={styles.kbd}>/</kbd>
                )}
              </div>
            </div>
          ) : null}
          {filtersActive ? (
            <button
              type="button"
              onClick={clearAll}
              className={styles.resetFiltersBtn}
              title="Xóa bộ lọc"
            >
              <Icon icon="lucide:filter-x" className={styles.iconSm} />
              Đặt lại
            </button>
          ) : null}
          {headerRight}
        </div>
      </div>

      <div className={`${styles.tableScroll} custom-scrollbar`}>
        <table className={styles.table} style={{ minWidth }}>
          <thead className={styles.thead}>
            <tr className={styles.headerRow}>
              {columns.map((col) => {
                const isSorted = col.sortable && sort.by === col.key;
                const isOpen = openFilter === col.key;
                const isFilterActive = isFilterValueActive(col, filters[col.key]);
                return (
                  <th
                    key={col.key}
                    className={`${styles.th} ${col.align === "right" ? styles.alignRight : ""} ${
                      isSorted ? styles.sorted : ""
                    } ${col.headerClassName ?? ""}`}
                  >
                    <div
                      className={`${styles.thInner} ${
                        col.align === "right" ? styles.alignRight : ""
                      }`}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={`${styles.sortBtn} ${isSorted ? styles.active : ""}`}
                          title={
                            isSorted
                              ? sort.dir === "asc"
                                ? "Đang tăng dần — nhấn để giảm dần"
                                : "Đang giảm dần — nhấn để bỏ sắp xếp"
                              : "Sắp xếp"
                          }
                        >
                          <span className={styles.thTitle}>{col.title}</span>
                          <SortCarets direction={isSorted ? sort.dir : null} active={isSorted} />
                        </button>
                      ) : (
                        <span className={styles.thTitleStatic}>
                          <span className={styles.thTitleText}>{col.title}</span>
                        </span>
                      )}

                      {col.filter ? (
                        <button
                          type="button"
                          onClick={(event) => toggleFilter(col.key, event.currentTarget)}
                          className={`${styles.filterBtn} ${
                            isFilterActive ? styles.active : isOpen ? styles.open : ""
                          }`}
                          title={isFilterActive ? "Đang lọc — nhấn để chỉnh" : "Lọc"}
                        >
                          <Icon
                            icon="lucide:filter"
                            className={styles.iconMd}
                            fill={isFilterActive ? "currentColor" : "none"}
                          />
                          {isFilterActive ? <span className={styles.filterDot} /> : null}
                        </button>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <div className={styles.loadingInner}>
                    <Icon icon="lucide:loader-2" className={`${styles.iconLg} ${styles.spin}`} />
                    Đang tải dữ liệu...
                  </div>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  <Icon icon="lucide:inbox" className={styles.emptyIcon} />
                  <p className={styles.emptyText}>
                    {filtersActive ? emptyFilteredText : emptyText}
                  </p>
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  className={`${styles.dataRow} ${
                    index % 2 === 1 ? styles.striped : styles.plain
                  } ${onRowClick ? styles.clickable : ""}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${styles.td} ${col.align === "right" ? styles.alignRight : ""} ${
                        col.className ?? ""
                      }`}
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

      {!loading && totalCount > 0 ? (
        <div className={styles.footer}>
          <p className={styles.footerText}>
            {totalCount <= pageSize
              ? `Hiển thị ${totalCount} ${countLabel}`
              : `Hiển thị ${(safePage - 1) * pageSize + 1}–${Math.min(
                  safePage * pageSize,
                  totalCount
                )} / ${totalCount} ${countLabel}`}
          </p>
          {totalCount > pageSize ? (
            <div className={styles.pagination}>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className={styles.pageBtn}
              >
                <Icon icon="lucide:chevron-left" className={styles.iconMd} />
                Trước
              </button>
              <span className={styles.pageInfo}>
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className={styles.pageBtn}
              >
                Sau
                <Icon icon="lucide:chevron-right" className={styles.iconMd} />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {openColumn?.filter && popoverPos ? (
        <div
          ref={popoverRef}
          style={{ position: "fixed", top: popoverPos.top, left: popoverPos.left, zIndex: 50 }}
          className={styles.popover}
        >
          {isDateRangeFilter(openColumn) ? (
            <div className={styles.dateRangeForm}>
              <label className={styles.dateLabel}>Từ ngày</label>
              <input
                type="date"
                value={filters[openColumn.key]?.from ?? ""}
                onChange={(event) => setDateRange(openColumn.key, "from", event.target.value)}
                className={POPOVER_INPUT_CLASS}
              />
              <label className={styles.dateLabel}>Đến ngày</label>
              <input
                type="date"
                value={filters[openColumn.key]?.to ?? ""}
                onChange={(event) => setDateRange(openColumn.key, "to", event.target.value)}
                className={POPOVER_INPUT_CLASS}
              />
            </div>
          ) : (
            <ul className={`${styles.optionList} custom-scrollbar`}>
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
          <div className={styles.popoverFooter}>
            <button
              type="button"
              disabled={!isFilterValueActive(openColumn, filters[openColumn.key])}
              onClick={() => resetColumnFilter(openColumn.key, openColumn)}
              className={styles.popoverResetBtn}
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={() => setOpenFilter(null)}
              className={styles.popoverOkBtn}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
