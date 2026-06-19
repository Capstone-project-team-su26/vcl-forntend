"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as orderConsignmentService from "@/shared/services/orderConsignmentService";
import { getErrorMessage } from "@/shared/utils/apiError";

const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
  formatConsignmentDate,
} = orderConsignmentService;

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING_REVIEW", label: CONSIGNMENT_STATUS_LABELS.PENDING_REVIEW },
  { value: "IN_PROGRESS", label: CONSIGNMENT_STATUS_LABELS.IN_PROGRESS },
  { value: "IN_WAREHOUSE", label: CONSIGNMENT_STATUS_LABELS.IN_WAREHOUSE },
  { value: "CANCELLED", label: CONSIGNMENT_STATUS_LABELS.CANCELLED },
  { value: "APPROVED", label: CONSIGNMENT_STATUS_LABELS.APPROVED },
  { value: "REJECTED", label: CONSIGNMENT_STATUS_LABELS.REJECTED },
  { value: "COMPLETED", label: CONSIGNMENT_STATUS_LABELS.COMPLETED },
];

const PAGE_SIZE = 10;

type ConsignmentItem = {
  id: string;
  customerName: string;
  consignmentType: string;
  status: string;
  createdAt: string;
};

type ListResponse = {
  items: ConsignmentItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold ${
        CONSIGNMENT_STATUS_STYLES[status] || "bg-surface text-muted"
      }`}
    >
      {CONSIGNMENT_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function ConsignmentListPanel() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const response = await orderConsignmentService.listStaffConsignments({
          page,
          pageSize: PAGE_SIZE,
          status: statusFilter || undefined,
          search: search || undefined,
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
  }, [page, statusFilter, search]);

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight font-['Oswald']">
          Quản lý ký gửi
        </h2>
        <p className="text-muted text-sm font-medium mt-2">
          Xem và xử lý yêu cầu ký gửi từ khách hàng. Ưu tiên{" "}
          <span className="text-warning-text font-bold">chờ duyệt</span>.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Icon
            icon="lucide:search"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã yêu cầu hoặc tên khách hàng..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-surface-muted bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-lg border border-surface-muted bg-white text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 lg:min-w-[200px]"
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] overflow-hidden border border-surface-muted/50">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="text-lg font-extrabold font-['Oswald']">Danh sách yêu cầu</h3>
          {!isLoading && (
            <span className="text-sm text-muted font-medium">{totalCount} yêu cầu</span>
          )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4 text-sm font-bold">Mã yêu cầu</th>
                <th className="px-6 py-4 text-sm font-bold">Tên khách hàng</th>
                <th className="px-6 py-4 text-sm font-bold">Loại ký gửi</th>
                <th className="px-6 py-4 text-sm font-bold">Trạng thái</th>
                <th className="px-6 py-4 text-sm font-bold">Ngày tạo</th>
                <th className="px-6 py-4 text-sm font-bold text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
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
                      {search || statusFilter
                        ? "Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                        : "Yêu cầu mới từ khách hàng sẽ hiển thị tại đây."}
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/staff/consignments/${item.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-secondary">{item.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{item.customerName}</td>
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
                        href={`/staff/consignments/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary/30 text-secondary text-sm font-bold hover:bg-gray-50 transition-colors"
                      >
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalCount > 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-50">
            <p className="text-sm text-muted">
              Trang {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-surface-muted text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
              >
                <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-surface-muted text-sm font-semibold disabled:opacity-40 hover:bg-gray-50"
              >
                Sau
                <Icon icon="lucide:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
