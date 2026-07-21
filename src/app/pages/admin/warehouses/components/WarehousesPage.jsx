"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import WarehouseFormModal from "@/app/pages/admin/warehouses/components/WarehouseFormModal";
import * as warehouseService from "@/modules/warehouses";
import { getErrorMessage } from "@/utils/apiError";

const { formatWarehouseType } = warehouseService;

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

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [warehouseModalMode, setWarehouseModalMode] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

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
        const data = await warehouseService.listWarehouses({
          search: search || undefined,
          isActive: statusFilter || undefined,
        });
        if (active) setWarehouses(data);
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

  function openCreateWarehouse() {
    setEditingWarehouse(null);
    setWarehouseModalMode("create");
  }

  function openEditWarehouse(warehouse) {
    setEditingWarehouse(warehouse);
    setWarehouseModalMode("edit");
  }

  function closeWarehouseModal() {
    setWarehouseModalMode(null);
    setEditingWarehouse(null);
  }

  function handleWarehouseSaved(warehouse, message) {
    setWarehouses((current) => {
      const exists = current.some((entry) => entry.id === warehouse.id);
      if (exists) {
        return current.map((entry) => (entry.id === warehouse.id ? warehouse : entry));
      }
      return [warehouse, ...current];
    });
    setActionMessage(message);
    setActionError("");
  }

  async function handleToggleWarehouseActive(warehouse) {
    setPendingId(warehouse.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await warehouseService.updateWarehouse(warehouse.id, {
        isActive: !warehouse.isActive,
      });
      setWarehouses((current) =>
        current.map((entry) =>
          entry.id === warehouse.id ? response.warehouse : entry
        )
      );
      setActionMessage(
        response.message ||
          (response.warehouse.isActive ? "Đã kích hoạt kho." : "Đã vô hiệu hóa kho.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDeleteWarehouse(warehouse) {
    const confirmed = window.confirm(`Xóa kho "${warehouse.name}"?`);
    if (!confirmed) return;

    setPendingId(warehouse.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await warehouseService.deleteWarehouse(warehouse.id);
      setWarehouses((current) => current.filter((entry) => entry.id !== warehouse.id));
      setActionMessage(response.message || "Đã xóa kho.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <AdminLayout activeNav="warehouses">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Quản lý kho
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Master kho (Origin / Destination). Phân bố vị trí và sức chứa bin do Operations quản lý.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateWarehouse}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm kho
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
              placeholder="Tìm theo tên kho hoặc mã kho..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted bg-surface-elevated text-sm text-ink input-focus-ring"
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
            <h3 className="text-base font-bold text-ink">Danh sách kho</h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
              <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Đang tải danh sách kho...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted">
              Không có kho phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted">
                    <th className="px-6 py-3 font-bold">Kho</th>
                    <th className="px-4 py-3 font-bold">Loại</th>
                    <th className="px-4 py-3 font-bold">Trạng thái</th>
                    <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((warehouse) => {
                    const isPending = pendingId === warehouse.id;
                    return (
                      <tr
                        key={warehouse.id}
                        className="border-b border-border-muted/60 last:border-0"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-ink">{warehouse.name}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {warehouse.code}
                            {warehouse.region ? ` · ${warehouse.region}` : ""}
                            {warehouse.address ? ` · ${warehouse.address}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-muted font-semibold">
                          {formatWarehouseType(warehouse.warehouseType)}
                        </td>
                        <td className="px-4 py-4">
                          <ActiveBadge isActive={warehouse.isActive} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditWarehouse(warehouse)}
                              className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface"
                              title="Sửa"
                            >
                              <Icon icon="lucide:pencil" className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleToggleWarehouseActive(warehouse)}
                              className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface disabled:opacity-50"
                              title={warehouse.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                            >
                              <Icon
                                icon={warehouse.isActive ? "lucide:ban" : "lucide:check-circle"}
                                className="w-4 h-4"
                              />
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleDeleteWarehouse(warehouse)}
                              className="btn-delete-icon disabled:opacity-50"
                              title="Xóa"
                            >
                              <Icon icon="lucide:trash-2" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <WarehouseFormModal
        open={warehouseModalMode !== null}
        mode={warehouseModalMode}
        warehouse={editingWarehouse}
        onClose={closeWarehouseModal}
        onSaved={handleWarehouseSaved}
      />
    </AdminLayout>
  );
}
