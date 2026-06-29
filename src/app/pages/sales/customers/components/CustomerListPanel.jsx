"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CustomerFormModal from "@/app/pages/sales/customers/components/CustomerFormModal";
import * as customerService from "@/utils/customerService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const { CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_STYLES, buildCreateConsignmentUrl } =
  customerService;

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        CUSTOMER_STATUS_STYLES[status] || "bg-surface text-muted"
      }`}
    >
      {CUSTOMER_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function CustomerListPanel() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState(null);

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
        const data = await customerService.listCustomers({ search: search || undefined });
        if (active) setCustomers(data);
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

  function handleCreated(customer, message) {
    setCustomers((current) => [customer, ...current]);
    setSuccessMessage(message);
    setError("");
    router.push(ROUTES.sales.customer(customer.id));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
            Hồ sơ khách hàng
          </h1>
          <p className="text-muted text-sm font-medium mt-2">
            Tìm kiếm, tạo mới và quản lý thông tin khách để phục vụ ký gửi hoặc mua hộ thay khách.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalMode("create")}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shrink-0"
        >
          <Icon icon="lucide:user-plus" className="w-4 h-4" />
          Thêm khách hàng
        </button>
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
          placeholder="Tìm theo tên, số điện thoại hoặc email..."
          className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm input-focus-ring"
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
          {successMessage}
        </div>
      ) : null}

      <div className="bg-surface-elevated rounded-xl shadow-sm overflow-hidden border border-border-muted">
        <div className="px-6 py-4 border-b border-border-muted">
          <h3 className="text-lg font-extrabold font-['Oswald']">Danh sách khách hàng</h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
            <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Đang tải danh sách...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted">
            Không tìm thấy khách hàng phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                  <th className="px-6 py-3 font-bold">Mã KH</th>
                  <th className="px-6 py-3 font-bold">Họ tên</th>
                  <th className="px-6 py-3 font-bold">Điện thoại</th>
                  <th className="px-6 py-3 font-bold">Email</th>
                  <th className="px-6 py-3 font-bold hidden lg:table-cell">Địa chỉ</th>
                  <th className="px-6 py-3 font-bold">Trạng thái</th>
                  <th className="px-6 py-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border-muted/60 last:border-0 hover:bg-surface/40"
                  >
                    <td className="px-6 py-4 font-mono text-xs">{customer.customerCode}</td>
                    <td className="px-6 py-4 font-semibold text-ink">{customer.fullName}</td>
                    <td className="px-6 py-4 text-muted">{customer.phone || "—"}</td>
                    <td className="px-6 py-4 text-muted">{customer.email || "—"}</td>
                    <td className="px-6 py-4 text-muted hidden lg:table-cell max-w-xs truncate">
                      {customer.address || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={buildCreateConsignmentUrl(customer.id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                          title="Tạo ký gửi thay khách"
                        >
                          <Icon icon="lucide:package-plus" className="w-4 h-4" />
                        </Link>
                        <Link
                          href={buildCreateConsignmentUrl(customer.id, "PURCHASE_ORDER")}
                          className="p-2 text-secondary hover:bg-secondary/10 rounded-lg"
                          title="Mua hộ thay khách"
                        >
                          <Icon icon="lucide:shopping-cart" className="w-4 h-4" />
                        </Link>
                        <Link
                          href={ROUTES.sales.customer(customer.id)}
                          className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg"
                          title="Xem chi tiết / chỉnh sửa"
                        >
                          <Icon icon="lucide:eye" className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerFormModal
        open={modalMode === "create"}
        mode="create"
        customer={null}
        onClose={() => setModalMode(null)}
        onSaved={handleCreated}
      />
    </div>
  );
}
