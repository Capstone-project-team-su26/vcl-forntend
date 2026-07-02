"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as purchaseRequestService from "@/utils/purchaseRequestService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  PURCHASE_REQUEST_STATUS_LABELS,
  PURCHASE_REQUEST_STATUS_STYLES,
  formatPurchaseRequestDate,
} = purchaseRequestService;

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        PURCHASE_REQUEST_STATUS_STYLES[status] || "bg-surface text-muted"
      }`}
    >
      {PURCHASE_REQUEST_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function PurchaseRequestListPanel() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const data = await purchaseRequestService.listPurchaseRequests({
          search: search || undefined,
        });
        if (active) setItems(data);
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
  }, [search]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          Yêu cầu mua hộ
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Kiểm tra và xử lý yêu cầu mua hộ từ khách hàng. Ưu tiên{" "}
          <span className="text-warning-text font-bold">chờ xử lý</span>.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Icon
          icon="lucide:search"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
        />
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Tìm theo mã yêu cầu, khách hàng hoặc sản phẩm..."
          className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm input-focus-ring"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="bg-surface-elevated rounded-xl shadow-sm overflow-hidden border border-border-muted">
        <div className="px-6 py-4 border-b border-border-muted">
          <h3 className="text-lg font-extrabold font-['Oswald']">Danh sách yêu cầu</h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Đang tải danh sách...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted">
            Không có yêu cầu mua hộ phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                  <th className="px-6 py-3 font-bold">Mã YC</th>
                  <th className="px-6 py-3 font-bold">Khách hàng</th>
                  <th className="px-6 py-3 font-bold">Sản phẩm</th>
                  <th className="px-6 py-3 font-bold">Ngày tạo</th>
                  <th className="px-6 py-3 font-bold">Trạng thái</th>
                  <th className="px-6 py-3 font-bold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border-muted/60 last:border-0 hover:bg-surface/40"
                  >
                    <td className="px-6 py-4 font-mono text-xs">{item.requestCode}</td>
                    <td className="px-6 py-4 font-medium">{item.customerName}</td>
                    <td className="px-6 py-4 text-muted">
                      {item.items[0]?.productName || "—"}
                      {item.items.length > 1 ? ` (+${item.items.length - 1})` : ""}
                    </td>
                    <td className="px-6 py-4 text-muted whitespace-nowrap">
                      {formatPurchaseRequestDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={ROUTES.sales.purchaseRequest(item.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        Xem chi tiết
                        <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
