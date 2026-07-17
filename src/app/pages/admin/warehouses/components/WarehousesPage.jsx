"use client";
import styles from "./WarehousesPage.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import WarehouseFormModal from "@/app/pages/admin/warehouses/components/WarehouseFormModal";
import WarehouseLocationFormModal from "@/app/pages/admin/warehouses/components/WarehouseLocationFormModal";
import * as warehouseService from "@/utils/warehouseService";
import { getErrorMessage } from "@/utils/apiError";

const { formatWarehouseType, formatLocationType, getParentLocationLabel } = warehouseService;

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

function ActiveBadge({ isActive }) {
  return (
    <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
      {isActive ? "Hoạt động" : "Vô hiệu"}
    </span>
  );
}

function LocationTypeBadge({ type }) {
  const statusTone = {
    ZONE: styles.badgeZone,
    SHELF: styles.badgeShelf,
    BIN: styles.badgeBin,
  };

  return (
    <span className={`${styles.badgePillSm} ${statusTone[type] || styles.badgeDefault}`}>
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
      <div className={styles.tb43b4c}>
        <div className={styles.tbccecd}>
          <div>
            <h1 className={styles.teed4df}>
              Quản lý kho
            </h1>
            <p className={styles.ta0ff26}>
              Cấu hình kho và vị trí Zone/Shelf/Bin cho nhập xuất và vận chuyển quốc tế.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateWarehouse}
            className={styles.t7fa39f}
          >
            <Icon icon="lucide:plus" className={styles.t0bfbea} />
            Thêm kho
          </button>
        </div>

        <div className={styles.t0afe45}>
          <div className={styles.t71d3c8}>
            <Icon
              icon="lucide:search"
              className={styles.t338195}
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm theo tên kho hoặc mã kho..."
              className={`${styles.t58c71d} input-focus-ring`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${styles.t7cd1e9} input-focus-ring`}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {actionError ? (
          <div className={styles.te12bff}>
            {actionError}
          </div>
        ) : null}

        {actionMessage ? (
          <div className={styles.te918f5}>
            {actionMessage}
          </div>
        ) : null}

        <div className={styles.tbf44fc}>
          <div className={styles.t962254}>
            <h3 className={styles.t3c6280}>Danh sách kho</h3>
          </div>

          {isLoading ? (
            <div className={styles.t8eade0}>
              <Icon icon="lucide:loader-2" className={styles.t27b8b3} />
              <p className={styles.taaa307}>Đang tải danh sách kho...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className={styles.t9ff2c9}>
              Không có kho phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className={styles.divideY}>
              {warehouses.map((warehouse) => {
                const isExpanded = expandedId === warehouse.id;
                const locations = locationsByWarehouse[warehouse.id] ?? [];
                const isPending = pendingId === warehouse.id;

                return (
                  <div key={warehouse.id}>
                    <div className={styles.t740d9d}>
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(warehouse.id)}
                        className={styles.tc48d8c}
                      >
                        <Icon
                          icon={isExpanded ? "lucide:chevron-down" : "lucide:chevron-right"}
                          className={styles.t4cf3c6}
                        />
                        <div className={styles.t7e0b7c}>
                          <p className={styles.te3f1fd}>{warehouse.name}</p>
                          <p className={styles.t5e4cbe}>
                            {warehouse.code}
                            {warehouse.address ? ` · ${warehouse.address}` : ""}
                          </p>
                        </div>
                      </button>

                      <div className={styles.tf2e8e8}>
                        <span className={styles.t74e489}>
                          {formatWarehouseType(warehouse.warehouseType)}
                        </span>
                        <ActiveBadge isActive={warehouse.isActive} />
                        <div className={styles.t416811}>
                          <button
                            type="button"
                            onClick={() => openEditWarehouse(warehouse)}
                            className={styles.tcddb14}
                            title="Sửa"
                          >
                            <Icon icon="lucide:pencil" className={styles.t0bfbea} />
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleToggleWarehouseActive(warehouse)}
                            className={styles.t182631}
                            title={warehouse.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                          >
                            <Icon
                              icon={warehouse.isActive ? "lucide:ban" : "lucide:check-circle"}
                              className={styles.t0bfbea}
                            />
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDeleteWarehouse(warehouse)}
                            className={`${styles.t52c30e} btn-delete-icon`}
                            title="Xóa"
                          >
                            <Icon icon="lucide:trash-2" className={styles.t0bfbea} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className={styles.t47a764}>
                        <div className={styles.t0007de}>
                          <div className={styles.tc27428}>
                            <h4 className={styles.t7a4a1b}>
                              Zone / Shelf / Bin
                            </h4>
                            <button
                              type="button"
                              onClick={() => openCreateLocation(warehouse.id)}
                              className={styles.t7519ef}
                            >
                              <Icon icon="lucide:plus" className={styles.tb41c1b} />
                              Thêm vị trí
                            </button>
                          </div>

                          {loadingLocationsId === warehouse.id ? (
                            <div className={styles.t8e5093}>
                              <Icon icon="lucide:loader-2" className={styles.tc11061} />
                              Đang tải vị trí...
                            </div>
                          ) : locations.length === 0 ? (
                            <p className={styles.t992512}>
                              Chưa có vị trí lưu trữ trong kho này.
                            </p>
                          ) : (
                            <div className={styles.t1384f6}>
                              <table className={styles.t8af758}>
                                <thead>
                                  <tr className={styles.t78e7c2}>
                                    <th className={styles.ta0086c}>Loại</th>
                                    <th className={styles.ta0086c}>Mã</th>
                                    <th className={styles.ta0086c}>Tên</th>
                                    <th className={styles.ta0086c}>Vị trí cha</th>
                                    <th className={styles.ta0086c}>Sức chứa</th>
                                    <th className={styles.ta0086c}>Trạng thái</th>
                                    <th className={styles.t76501a}>Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {locations.map((location) => (
                                    <tr
                                      key={location.id}
                                      className={styles.t85eb24}
                                    >
                                      <td className={styles.t0e9cd2}>
                                        <LocationTypeBadge type={location.locationType} />
                                      </td>
                                      <td className={styles.t3feb8c}>{location.code}</td>
                                      <td className={styles.t584f53}>{location.name}</td>
                                      <td className={styles.te6a652}>
                                        {getParentLocationLabel(locations, location.parentId)}
                                      </td>
                                      <td className={styles.t0e9cd2}>
                                        {location.capacity != null ? location.capacity : "—"}
                                      </td>
                                      <td className={styles.t0e9cd2}>
                                        <ActiveBadge isActive={location.isActive} />
                                      </td>
                                      <td className={styles.t0e9cd2}>
                                        <div className={styles.t0bd0c1}>
                                          <button
                                            type="button"
                                            onClick={() => openEditLocation(warehouse.id, location)}
                                            className={styles.tcddb14}
                                            title="Sửa"
                                          >
                                            <Icon icon="lucide:pencil" className={styles.t0bfbea} />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={pendingId === location.id}
                                            onClick={() =>
                                              handleToggleLocationActive(warehouse.id, location)
                                            }
                                            className={styles.t182631}
                                            title={location.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                          >
                                            <Icon
                                              icon={
                                                location.isActive
                                                  ? "lucide:ban"
                                                  : "lucide:check-circle"
                                              }
                                              className={styles.t0bfbea}
                                            />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={pendingId === location.id}
                                            onClick={() =>
                                              handleDeleteLocation(warehouse.id, location)
                                            }
                                            className={`${styles.t52c30e} btn-delete-icon`}
                                            title="Xóa"
                                          >
                                            <Icon icon="lucide:trash-2" className={styles.t0bfbea} />
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
