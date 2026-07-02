"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import ShippingMethodFormModal from "@/app/pages/admin/shipping-methods/components/ShippingMethodFormModal";
import * as shippingMethodService from "@/utils/shippingMethodService";
import { getErrorMessage } from "@/utils/apiError";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

function ActiveBadge({ isActive }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        isActive ? "bg-success-bg text-success-text" : "bg-surface text-muted"
      }`}
    >
      {isActive ? "Hoạt động" : "Vô hiệu"}
    </span>
  );
}

export default function ShippingMethodsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setActionError("");

      try {
        const data = await shippingMethodService.listShippingMethods({
          search: search || undefined,
          isActive: statusFilter || undefined,
          activeOnly: false,
        });
        if (active) setItems(data);
      } catch (err) {
        if (active) setActionError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [search, statusFilter]);

  function openCreate() {
    setEditingItem(null);
    setModalMode("create");
  }

  function openEdit(item) {
    setEditingItem(item);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingItem(null);
  }

  function handleSaved(item, message) {
    setItems((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      if (exists) {
        return current.map((entry) => (entry.id === item.id ? item : entry));
      }
      return [item, ...current];
    });
    setActionMessage(message);
    setActionError("");
  }

  async function handleToggleActive(item) {
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await shippingMethodService.updateShippingMethod(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.shippingMethod : entry))
      );
      setActionMessage(
        response.message ||
          (response.shippingMethod.isActive
            ? "Đã kích hoạt phương thức vận chuyển."
            : "Đã vô hiệu hóa phương thức vận chuyển.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Xóa phương thức "${item.name}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await shippingMethodService.deleteShippingMethod(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa phương thức vận chuyển.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminLayout activeNav="shipping-methods">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
              Phương thức vận chuyển
            </h1>
            <p className="text-muted text-sm font-medium mt-2">
              Cấu hình lựa chọn vận chuyển cho yêu cầu ký gửi, báo giá và điều phối logistics.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm phương thức
          </button>
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
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên hoặc mã phương thức..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm input-focus-ring"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm font-medium text-ink input-focus-ring lg:min-w-[200px]"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {actionError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {actionError}
          </div>
        ) : null}

        {actionMessage ? (
          <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
            {actionMessage}
          </div>
        ) : null}

        <div className="bg-surface-elevated rounded-xl shadow-sm overflow-hidden border border-border-muted">
          <div className="px-6 py-4 border-b border-border-muted">
            <h3 className="text-lg font-extrabold font-['Oswald']">
              Danh sách phương thức vận chuyển
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
              <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Đang tải danh sách...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted">
              Không có phương thức vận chuyển phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                    <th className="px-6 py-3 font-bold">Mã</th>
                    <th className="px-6 py-3 font-bold">Tên</th>
                    <th className="px-6 py-3 font-bold hidden md:table-cell">Mô tả</th>
                    <th className="px-6 py-3 font-bold hidden lg:table-cell">Thời gian dự kiến</th>
                    <th className="px-6 py-3 font-bold hidden xl:table-cell">Điều kiện</th>
                    <th className="px-6 py-3 font-bold">Trạng thái</th>
                    <th className="px-6 py-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border-muted/60 last:border-0 hover:bg-surface/40"
                    >
                      <td className="px-6 py-4 font-mono text-xs">{item.code}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{item.name}</p>
                        {item.internalNotes ? (
                          <p className="text-xs text-muted mt-1 line-clamp-1" title={item.internalNotes}>
                            Ghi chú: {item.internalNotes}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-muted hidden md:table-cell max-w-xs">
                        <span className="line-clamp-2">{item.description || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-muted hidden lg:table-cell whitespace-nowrap">
                        {item.estimatedDeliveryTime || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted hidden xl:table-cell max-w-xs">
                        <span className="line-clamp-2">{item.applicableConditions || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <ActiveBadge isActive={item.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface"
                            title="Sửa"
                          >
                            <Icon icon="lucide:pencil" className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={pendingId === item.id}
                            onClick={() => handleToggleActive(item)}
                            className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface disabled:opacity-50"
                            title={item.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            <Icon
                              icon={item.isActive ? "lucide:ban" : "lucide:check-circle"}
                              className="w-4 h-4"
                            />
                          </button>
                          <button
                            type="button"
                            disabled={pendingId === item.id}
                            onClick={() => handleDelete(item)}
                            className="p-2 text-danger hover:bg-danger/10 rounded-lg disabled:opacity-50"
                            title="Xóa"
                          >
                            <Icon icon="lucide:trash-2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ShippingMethodFormModal
        open={modalMode !== null}
        mode={modalMode}
        shippingMethod={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
