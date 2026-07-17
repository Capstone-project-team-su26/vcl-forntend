"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ConsignmentCard from "@/app/pages/sales/consignments/components/list/ConsignmentCard";
import PaginationBar from "@/app/pages/sales/consignments/components/list/PaginationBar";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import {
  clearConsignmentDetailCache,
  fetchConsignmentDetailsByIds,
  mergeSummaryWithDetail,
} from "@/utils/consignmentDetailCache";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import { useAuth } from "@/hooks/useAuth";
import { isMockMode } from "@/utils/mocks/dataSource";
import styles from "./ConsignmentListPanel.module.scss";

const { CONSIGNMENT_STATUS_LABELS } = orderConsignmentService;

const PAGE_SIZE = 5;

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  ...Object.entries(CONSIGNMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const EMPTY_FILTERS = {
  search: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

function hasActiveFilters(filters) {
  return Boolean(
    filters.search.trim() || filters.status || filters.dateFrom || filters.dateTo
  );
}

export default function ConsignmentListPanel() {
  const router = useRouter();
  const { session } = useAuth();
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

  function goToPage(nextPage) {
    setPage(Math.min(Math.max(nextPage, 1), Math.max(data?.totalPages ?? 1, 1)));
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const response = await orderConsignmentService.listStaffConsignments({
          page,
          pageSize: PAGE_SIZE,
          status: appliedFilters.status || undefined,
          search: appliedFilters.search.trim() || undefined,
          dateFrom: appliedFilters.dateFrom || undefined,
          dateTo: appliedFilters.dateTo || undefined,
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
      const details = await fetchConsignmentDetailsByIds(listItems.map((item) => item.id));
      if (!active) return;
      setDetailsById((current) => ({ ...current, ...details }));
      setDetailsLoading(false);
    }

    enrich();
    return () => {
      active = false;
    };
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
    clearConsignmentDetailCache();
    setDetailsById({});
    setRefreshKey((current) => current + 1);
  }

  function openDetail(id) {
    router.push(ROUTES.sales.consignment(id));
  }

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

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Yêu cầu ký gửi chờ duyệt</h1>
          <p className={styles.subtitle}>
            Kiểm tra các yêu cầu ký gửi mới đang chờ Sale duyệt.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href={ROUTES.sales.createConsignment} className={styles.createBtn}>
            <Icon icon="lucide:plus" className={styles.iconSm} />
            Tạo yêu cầu ký gửi
          </Link>
          <div className={styles.countCard}>
            <p className={styles.countValue}>{isLoading ? "…" : totalCount}</p>
            <p className={styles.countLabel}>Yêu cầu chờ duyệt</p>
          </div>
        </div>
      </div>

      {error ? <div className={styles.alertDanger}>{error}</div> : null}

      {showSaleApiEmptyHint ? (
        <div className={styles.alertWarning}>
          <p className={styles.warningTitle}>API trả về 0 yêu cầu cho role Sale</p>
          <p className={styles.warningBody}>
            Backend hiện chỉ trả danh sách đầy đủ cho Admin/Customer. Team BE cần mở quyền xem
            danh sách ký gửi cho Sale trên GET /api/orders/consignments.
          </p>
        </div>
      ) : null}

      <div className={styles.filters}>
        <div className={styles.filterFields}>
          <div className={styles.searchWrap}>
            <Icon icon="lucide:search" className={styles.searchIcon} />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Tìm mã vận đơn, khách hàng, sản phẩm..."
              className={`${styles.searchInput} input-focus-ring`}
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => updateFilter("status", event.target.value)}
            className={`${styles.statusSelect} input-focus-ring`}
            aria-label="Lọc theo trạng thái"
            title="Trạng thái"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className={styles.dateRow}>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => updateFilter("dateFrom", event.target.value)}
              className={`${styles.dateInput} input-focus-ring`}
              title="Từ ngày"
              aria-label="Từ ngày"
            />
            <span className={styles.dateSep}>→</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => updateFilter("dateTo", event.target.value)}
              className={`${styles.dateInput} input-focus-ring`}
              title="Đến ngày"
              aria-label="Đến ngày"
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          {filtersActive ? (
            <button type="button" onClick={clearFilters} className={styles.clearBtn}>
              <Icon icon="lucide:filter-x" className={styles.iconSm} />
              Xóa lọc
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className={styles.refreshBtn}
          >
            <Icon
              icon="lucide:refresh-cw"
              className={`${styles.iconSm} ${isLoading ? styles.spin : ""}`}
            />
            Làm mới
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingBox}>
          <div className={styles.loadingInner}>
            <Icon icon="lucide:loader-2" className={`${styles.iconMd} ${styles.spin}`} />
            Đang tải danh sách...
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyBox}>
          <Icon icon="lucide:inbox" className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Chưa có yêu cầu ký gửi nào</p>
          <p className={styles.emptyBody}>
            {filtersActive
              ? "Thử đổi bộ lọc hoặc xóa bộ lọc."
              : "Yêu cầu mới từ khách hàng sẽ hiển thị tại đây."}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <ConsignmentCard
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
