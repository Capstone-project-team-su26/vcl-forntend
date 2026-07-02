"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import AdditionalServiceFeeFormModal from "@/app/pages/admin/additional-service-fees/components/AdditionalServiceFeeFormModal";
import * as feeService from "@/utils/additionalServiceFeeService";
import { getErrorMessage } from "@/utils/apiError";

const {
  formatFeeAmount,
  formatFeeCalculationType,
} = feeService;

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

export default function AdditionalServiceFeesPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setActionError("");

      try {
        const data = await feeService.listAdditionalServiceFees({
          isActive: statusFilter || undefined,
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
  }, [statusFilter]);

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
      const response = await feeService.updateAdditionalServiceFee(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.fee : entry))
      );
      setActionMessage(
        response.message ||
          (response.fee.isActive ? "Đã kích hoạt loại phí." : "Đã vô hiệu hóa loại phí.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Xóa loại phí "${item.name}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await feeService.deleteAdditionalServiceFee(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa loại phí.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminLayout activeNav="additional-service-fees">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
              Phí dịch vụ bổ sung
            </h1>
            <p className="text-muted text-sm font-medium mt-2">
              Cấu hình bảo hiểm, đóng thùng gỗ, gia cố, kiểm hàng, lưu kho… dùng khi Staff/Sales báo giá.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm loại phí
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:max-w-xs">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm font-medium text-ink input-focus-ring w-full"
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
              Danh sách phí dịch vụ bổ sung
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
              <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Đang tải danh sách...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted">
              Không có loại phí phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                    <th className="px-6 py-3 font-bold">Mã</th>
                    <th className="px-6 py-3 font-bold">Tên loại phí</th>
                    <th className="px-6 py-3 font-bold">Cách tính</th>
                    <th className="px-6 py-3 font-bold">Mức phí</th>
                    <th className="px-6 py-3 font-bold hidden md:table-cell">Đơn vị</th>
                    <th className="px-6 py-3 font-bold hidden lg:table-cell">Mô tả</th>
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
                      <td className="px-6 py-4 font-semibold text-ink">{item.name}</td>
                      <td className="px-6 py-4 text-muted">
                        {formatFeeCalculationType(item.feeCalculationType)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-ink">
                        {formatFeeAmount(item)}
                      </td>
                      <td className="px-6 py-4 text-muted hidden md:table-cell">
                        {item.unit || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted hidden lg:table-cell max-w-xs">
                        <span className="line-clamp-2">{item.description || "—"}</span>
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

      <AdditionalServiceFeeFormModal
        open={modalMode !== null}
        mode={modalMode}
        fee={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
