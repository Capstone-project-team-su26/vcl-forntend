"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import RestrictedItemFormModal, {
  type RestrictedItem,
} from "./RestrictedItemFormModal";
import * as restrictedItemService from "@/shared/services/restrictedItemService";
import { getErrorMessage } from "@/shared/utils/apiError";

const { RESTRICTION_TYPE_LABELS, formatRestrictedCountry } = restrictedItemService;

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "Tất cả loại hạn chế" },
  ...Object.entries(RESTRICTION_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

function RestrictionTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    PROHIBITED: "bg-danger/10 text-danger",
    RESTRICTED: "bg-warning-bg text-warning-text",
    CONDITIONAL: "bg-info-bg text-info-text",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        styles[type] || "bg-surface text-muted"
      }`}
    >
      {RESTRICTION_TYPE_LABELS[type] || type}
    </span>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
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

export default function RestrictedItemsPage() {
  const [items, setItems] = useState<RestrictedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<RestrictedItem | null>(null);

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
        const data = await restrictedItemService.listRestrictedItems({
          search: search || undefined,
          restrictionType: typeFilter || undefined,
        });

        const list = Array.isArray(data) ? data : data?.items ?? [];
        if (active) setItems(list);
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
  }, [search, typeFilter]);

  function openCreate() {
    setEditingItem(null);
    setModalMode("create");
  }

  function openEdit(item: RestrictedItem) {
    setEditingItem(item);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingItem(null);
  }

  function handleSaved(item: RestrictedItem, message: string) {
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

  async function handleToggleActive(item: RestrictedItem) {
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await restrictedItemService.updateRestrictedItem(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.item : entry))
      );
      setActionMessage(
        response.message ||
          (response.item.isActive ? "Đã kích hoạt mặt hàng." : "Đã vô hiệu hóa mặt hàng.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item: RestrictedItem) {
    const confirmed = window.confirm(
      `Xóa "${item.name}" khỏi danh mục? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await restrictedItemService.deleteRestrictedItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa mặt hàng.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminLayout activeNav="restricted-items">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-ink tracking-tight">
              Hàng cấm / hạn chế
            </h1>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              Quản lý danh mục dùng để kiểm tra hàng hóa khi Customer tạo yêu cầu ký gửi.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm mặt hàng
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
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên mặt hàng..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-white text-sm input-focus-ring"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border-muted bg-white text-sm font-medium input-focus-ring lg:min-w-[220px]"
          >
            {TYPE_FILTER_OPTIONS.map((option) => (
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

        <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead>
                <tr className="border-b border-border-muted bg-surface">
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Tên mặt hàng
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Quốc gia
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Loại hạn chế
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold text-faint uppercase tracking-wider text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-sm text-muted">
                        <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                        Đang tải danh mục...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted">
                      {search || typeFilter
                        ? "Không tìm thấy mặt hàng phù hợp."
                        : "Chưa có mặt hàng nào. Nhấn \"Thêm mặt hàng\" để bắt đầu."}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-ink">{item.name}</p>
                        <p className="text-[10px] text-faint mt-0.5">{item.id}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {formatRestrictedCountry(item.country)}
                      </td>
                      <td className="px-6 py-4">
                        <RestrictionTypeBadge type={item.restrictionType} />
                      </td>
                      <td className="px-6 py-4 text-sm text-muted max-w-xs truncate" title={item.notes}>
                        {item.notes || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <ActiveBadge isActive={item.isActive} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            disabled={pendingId === item.id}
                            className="p-2 text-muted hover:text-insight hover:bg-surface rounded-lg disabled:opacity-50"
                            title="Sửa"
                          >
                            <Icon icon="lucide:pencil" className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            disabled={pendingId === item.id}
                            className="p-2 text-muted hover:text-warning-text hover:bg-surface rounded-lg disabled:opacity-50"
                            title={item.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            <Icon
                              icon={item.isActive ? "lucide:ban" : "lucide:circle-check"}
                              className="w-4 h-4"
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={pendingId === item.id}
                            className="p-2 text-muted hover:text-danger hover:bg-danger/5 rounded-lg disabled:opacity-50"
                            title="Xóa"
                          >
                            <Icon icon="lucide:trash-2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <RestrictedItemFormModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        item={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
