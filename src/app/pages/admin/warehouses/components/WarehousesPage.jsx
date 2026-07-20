"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import WarehouseFormModal from "@/app/pages/admin/warehouses/components/WarehouseFormModal";
import WarehouseLocationFormModal from "@/app/pages/admin/warehouses/components/WarehouseLocationFormModal";
import * as warehouseService from "@/modules/warehouses";
import { getErrorMessage } from "@/utils/apiError";

const { formatWarehouseType, formatLocationType, getParentLocationLabel } = warehouseService;

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

function LocationTypeBadge({ type }) {
  const styles = {
    ZONE: "bg-primary/15 text-primary",
    SHELF: "bg-secondary/15 text-secondary",
    BIN: "bg-accent/15 text-accent",
  };

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        styles[type] || "bg-surface text-muted"
      }`}
    >
      {formatLocationType(type)}
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
  const [expandedId, setExpandedId] = useState(null);
  const [locationsByWarehouse, setLocationsByWarehouse] = useState({});
  const [loadingLocationsId, setLoadingLocationsId] = useState(null);

  const [warehouseModalMode, setWarehouseModalMode] = useState(null);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [locationModalMode, setLocationModalMode] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationWarehouseId, setLocationWarehouseId] = useState(null);

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

  async function loadLocations(warehouseId) {
    setLoadingLocationsId(warehouseId);
    try {
      const locations = await warehouseService.listWarehouseLocations(warehouseId);
      setLocationsByWarehouse((current) => ({ ...current, [warehouseId]: locations }));
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setLoadingLocationsId(null);
    }
  }

  async function handleToggleExpand(warehouseId) {
    if (expandedId === warehouseId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(warehouseId);
    if (!locationsByWarehouse[warehouseId]) {
      await loadLocations(warehouseId);
    }
  }

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
        current.map((entry) => (entry.id === warehouse.id ? response.warehouse : entry))
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
    const confirmed = window.confirm(
      `Xóa kho "${warehouse.name}"? Tất cả vị trí lưu trữ trong kho cũng sẽ bị xóa.`
    );
    if (!confirmed) return;

    setPendingId(warehouse.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await warehouseService.deleteWarehouse(warehouse.id);
      setWarehouses((current) => current.filter((entry) => entry.id !== warehouse.id));
      setLocationsByWarehouse((current) => {
        const next = { ...current };
        delete next[warehouse.id];
        return next;
      });
      if (expandedId === warehouse.id) setExpandedId(null);
      setActionMessage(response.message || "Đã xóa kho.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  function openCreateLocation(warehouseId) {
    setLocationWarehouseId(warehouseId);
    setEditingLocation(null);
    setLocationModalMode("create");
  }

  function openEditLocation(warehouseId, location) {
    setLocationWarehouseId(warehouseId);
    setEditingLocation(location);
    setLocationModalMode("edit");
  }

  function closeLocationModal() {
    setLocationModalMode(null);
    setEditingLocation(null);
    setLocationWarehouseId(null);
  }

  function handleLocationSaved(location, message) {
    setLocationsByWarehouse((current) => {
      const list = current[location.warehouseId] ?? [];
      const exists = list.some((entry) => entry.id === location.id);
      const nextList = exists
        ? list.map((entry) => (entry.id === location.id ? location : entry))
        : [location, ...list];

      return { ...current, [location.warehouseId]: nextList };
    });
    setActionMessage(message);
    setActionError("");
  }

  async function handleToggleLocationActive(warehouseId, location) {
    setPendingId(location.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await warehouseService.updateWarehouseLocation(location.id, {
        isActive: !location.isActive,
      });
      handleLocationSaved(response.location, response.message || "Đã cập nhật vị trí.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDeleteLocation(warehouseId, location) {
    const confirmed = window.confirm(`Xóa vị trí "${location.name}"?`);
    if (!confirmed) return;

    setPendingId(location.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await warehouseService.deleteWarehouseLocation(location.id);
      await loadLocations(warehouseId);
      setActionMessage(response.message || "Đã xóa vị trí lưu trữ.");
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
              Cấu hình kho và vị trí Zone/Shelf/Bin cho nhập xuất và vận chuyển quốc tế.
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
            <div className="divide-y divide-border-muted">
              {warehouses.map((warehouse) => {
                const isExpanded = expandedId === warehouse.id;
                const locations = locationsByWarehouse[warehouse.id] ?? [];
                const isPending = pendingId === warehouse.id;

                return (
                  <div key={warehouse.id}>
                    <div className="px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(warehouse.id)}
                        className="flex items-center gap-3 text-left min-w-0 flex-1"
                      >
                        <Icon
                          icon={isExpanded ? "lucide:chevron-down" : "lucide:chevron-right"}
                          className="w-5 h-5 text-muted shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink truncate">{warehouse.name}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {warehouse.code}
                            {warehouse.region ? ` · ${warehouse.region}` : ""}
                            {warehouse.address ? ` · ${warehouse.address}` : ""}
                          </p>
                        </div>
                      </button>

                      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                        <span className="text-xs font-semibold text-muted">
                          {formatWarehouseType(warehouse.warehouseType)}
                        </span>
                        <ActiveBadge isActive={warehouse.isActive} />
                        <div className="flex items-center gap-1">
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
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="px-4 sm:px-6 pb-5 bg-surface/50">
                        <div className="rounded-lg border border-border-muted bg-surface-elevated overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-border-muted">
                            <h4 className="text-sm font-bold text-ink">
                              Zone / Shelf / Bin
                            </h4>
                            <button
                              type="button"
                              onClick={() => openCreateLocation(warehouse.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                            >
                              <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
                              Thêm vị trí
                            </button>
                          </div>

                          {loadingLocationsId === warehouse.id ? (
                            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                              Đang tải vị trí...
                            </div>
                          ) : locations.length === 0 ? (
                            <p className="px-4 py-8 text-sm text-muted text-center">
                              Chưa có vị trí lưu trữ trong kho này.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted">
                                    <th className="px-4 py-3 font-bold">Loại</th>
                                    <th className="px-4 py-3 font-bold">Mã</th>
                                    <th className="px-4 py-3 font-bold">Tên</th>
                                    <th className="px-4 py-3 font-bold">Vị trí cha</th>
                                    <th className="px-4 py-3 font-bold">Sức chứa</th>
                                    <th className="px-4 py-3 font-bold">Trạng thái</th>
                                    <th className="px-4 py-3 font-bold text-right">Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {locations.map((location) => (
                                    <tr
                                      key={location.id}
                                      className="border-b border-border-muted/60 last:border-0"
                                    >
                                      <td className="px-4 py-3">
                                        <LocationTypeBadge type={location.locationType} />
                                      </td>
                                      <td className="px-4 py-3 font-mono text-xs">{location.code}</td>
                                      <td className="px-4 py-3 font-medium">{location.name}</td>
                                      <td className="px-4 py-3 text-muted text-xs">
                                        {getParentLocationLabel(locations, location.parentId)}
                                      </td>
                                      <td className="px-4 py-3">
                                        {location.capacity != null ? location.capacity : "—"}
                                      </td>
                                      <td className="px-4 py-3">
                                        <ActiveBadge isActive={location.isActive} />
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => openEditLocation(warehouse.id, location)}
                                            className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface"
                                            title="Sửa"
                                          >
                                            <Icon icon="lucide:pencil" className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={pendingId === location.id}
                                            onClick={() =>
                                              handleToggleLocationActive(warehouse.id, location)
                                            }
                                            className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface disabled:opacity-50"
                                            title={location.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                          >
                                            <Icon
                                              icon={
                                                location.isActive
                                                  ? "lucide:ban"
                                                  : "lucide:check-circle"
                                              }
                                              className="w-4 h-4"
                                            />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={pendingId === location.id}
                                            onClick={() =>
                                              handleDeleteLocation(warehouse.id, location)
                                            }
                                            className="btn-delete-icon disabled:opacity-50"
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
                    ) : null}
                  </div>
                );
              })}
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

      <WarehouseLocationFormModal
        open={locationModalMode !== null}
        mode={locationModalMode}
        warehouseId={locationWarehouseId}
        location={editingLocation}
        locations={locationWarehouseId ? locationsByWarehouse[locationWarehouseId] ?? [] : []}
        onClose={closeLocationModal}
        onSaved={handleLocationSaved}
      />
    </AdminLayout>
  );
}
