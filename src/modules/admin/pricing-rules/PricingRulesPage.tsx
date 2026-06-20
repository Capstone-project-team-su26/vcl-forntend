"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import PricingRuleFormModal, { type PricingRule } from "./PricingRuleFormModal";
import * as pricingRuleService from "@/shared/services/pricingRuleService";
import { getErrorMessage } from "@/shared/utils/apiError";

const {
  SHIPPING_SERVICE_TYPE_LABELS,
  CONSIGNMENT_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  formatPricingRoute,
  formatMoney,
} = pricingRuleService;

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

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

export default function PricingRulesPage() {
  const [items, setItems] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<PricingRule | null>(null);

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
        const data = await pricingRuleService.listPricingRules({
          search: search || undefined,
          isActive: statusFilter === "" ? undefined : statusFilter,
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
  }, [search, statusFilter]);

  function openCreate() {
    setEditingItem(null);
    setModalMode("create");
  }

  function openEdit(item: PricingRule) {
    setEditingItem(item);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingItem(null);
  }

  function handleSaved(item: PricingRule, message: string) {
    setItems((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      if (exists) return current.map((entry) => (entry.id === item.id ? item : entry));
      return [item, ...current];
    });
    setActionMessage(message);
    setActionError("");
  }

  async function handleToggleActive(item: PricingRule) {
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await pricingRuleService.updatePricingRule(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.item : entry))
      );
      setActionMessage(response.message || "Cập nhật trạng thái thành công.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item: PricingRule) {
    const label = SHIPPING_SERVICE_TYPE_LABELS[item.shippingServiceType] || item.shippingServiceType;
    if (!window.confirm(`Xóa cấu hình giá "${label}" (${formatPricingRoute(item.route)})?`)) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await pricingRuleService.deletePricingRule(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa cấu hình giá.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminLayout activeNav="pricing-rules">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-ink tracking-tight">
              Bảng giá ký gửi
            </h1>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              Cấu hình giá dùng cho báo giá tạm tính và báo giá chốt khi Customer tạo yêu cầu ký gửi.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm cấu hình giá
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
              placeholder="Tìm theo loại dịch vụ hoặc tuyến vận chuyển..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm input-focus-ring"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm font-medium input-focus-ring lg:min-w-[200px]"
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

        <div className="bg-surface-elevated rounded-xl border border-border-muted shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-border-muted bg-surface">
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Loại ký gửi
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Tuyến
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Đơn vị
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Giá/kg
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Giá/CBM
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Phí DV
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-sm text-muted">
                        <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                        Đang tải bảng giá...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted">
                      {search || statusFilter
                        ? "Không tìm thấy cấu hình phù hợp."
                        : "Chưa có cấu hình giá. Nhấn \"Thêm cấu hình giá\" để bắt đầu."}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/80 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-ink">
                          {SHIPPING_SERVICE_TYPE_LABELS[item.shippingServiceType] ||
                            item.shippingServiceType}
                        </p>
                        <p className="text-[10px] text-faint mt-0.5">{item.id}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {CONSIGNMENT_TYPE_LABELS[item.consignmentType] || item.consignmentType}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {formatPricingRoute(item.route)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {BILLING_UNIT_LABELS[item.billingUnit] || item.billingUnit}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {formatMoney(item.pricePerKg)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {formatMoney(item.pricePerCbm)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        {formatMoney(item.serviceFee)}
                      </td>
                      <td className="px-4 py-4">
                        <ActiveBadge isActive={item.isActive} />
                      </td>
                      <td className="px-4 py-4">
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

      <PricingRuleFormModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        item={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
