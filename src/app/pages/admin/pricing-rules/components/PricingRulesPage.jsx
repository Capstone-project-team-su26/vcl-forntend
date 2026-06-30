"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import ServicePricingFormModal from "./PricingRuleFormModal";
import * as servicePricingService from "@/utils/servicePricingService";
import { getErrorMessage } from "@/utils/apiError";

const {
  SERVICE_TYPE_LABELS,
  UNIT_TYPE_LABELS,
  formatServicePricingRoute,
  formatMoney,
  formatInternationalWarehouseLabel,
  listInternationalWarehouses,
} = servicePricingService;

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

export default function PricingRulesPage() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
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
    listInternationalWarehouses().then(setWarehouses).catch(() => setWarehouses([]));
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setActionError("");

      try {
        const data = await servicePricingService.listServicePricings({
          search: search || undefined,
          isActive: statusFilter === "" ? undefined : statusFilter,
        });
        if (active) setItems(Array.isArray(data) ? data : data?.items ?? []);
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
      if (exists) return current.map((entry) => (entry.id === item.id ? item : entry));
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
      const response = await servicePricingService.updateServicePricing(item.id, {
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

  async function handleDelete(item) {
    const label = SERVICE_TYPE_LABELS[item.serviceType] || item.serviceType;
    if (!window.confirm(`Xóa giá dịch vụ chính "${label}" (${formatServicePricingRoute(item)})?`)) {
      return;
    }

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await servicePricingService.deleteServicePricing(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa giá dịch vụ chính.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  function formatUnitPrice(item) {
    if (item.unitType === "KG_OR_CBM") {
      return `${formatMoney(item.pricePerKg)} / kg · ${formatMoney(item.pricePerCbm)} / CBM`;
    }
    if (item.unitType === "CBM") return `${formatMoney(item.price)} / CBM`;
    return `${formatMoney(item.price)} / kg`;
  }

  return (
    <AdminLayout activeNav="pricing-rules">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-ink tracking-tight">
              Giá dịch vụ chính (ký gửi)
            </h1>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              Cấu hình cước dịch vụ chính theo tuyến và đơn vị tính. Phụ phí được quản lý riêng tại
              mục Phí dịch vụ bổ sung.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm giá dịch vụ chính
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
              placeholder="Tìm theo dịch vụ, tuyến, kho..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm input-focus-ring"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="form-select input-focus-ring lg:min-w-[200px]"
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
                    Tuyến
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Kho
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Đơn vị
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Đơn giá
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold text-faint uppercase tracking-wider">
                    Hiệu lực
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
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-sm text-muted">
                        <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                        Đang tải bảng giá...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted">
                      {search || statusFilter
                        ? "Không tìm thấy cấu hình phù hợp."
                        : 'Chưa có giá dịch vụ chính. Nhấn "Thêm giá dịch vụ chính" để bắt đầu.'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const warehouse = warehouses.find((entry) => entry.id === item.warehouseId);
                    return (
                      <tr key={item.id} className="hover:bg-surface/80 transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-ink">
                            {SERVICE_TYPE_LABELS[item.serviceType] || item.serviceType}
                          </p>
                          <p className="text-[10px] text-faint mt-0.5">{item.id}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted">
                          {formatServicePricingRoute(item)}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted">
                          {warehouse ? formatInternationalWarehouseLabel(warehouse) : "—"}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted">
                          {UNIT_TYPE_LABELS[item.unitType] || item.unitType}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium">{formatUnitPrice(item)}</td>
                        <td className="px-4 py-4 text-sm text-muted">
                          {item.effectiveDate
                            ? new Date(item.effectiveDate).toLocaleDateString("vi-VN")
                            : "—"}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ServicePricingFormModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        item={editingItem}
        warehouses={warehouses}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
