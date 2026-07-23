"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";
import * as warehouseService from "@/modules/warehouses";
import { getErrorMessage } from "@/utils/apiError";

function formatVolume(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("vi-VN");
}

function groupLocations(locations) {
  const zones = new Map();
  for (const loc of locations || []) {
    const zoneName = loc.zoneName || loc.zoneCode || "Chưa có zone";
    const shelfCode = loc.shelfCode || "Chưa có shelf";
    if (!zones.has(zoneName)) zones.set(zoneName, new Map());
    const shelves = zones.get(zoneName);
    if (!shelves.has(shelfCode)) shelves.set(shelfCode, []);
    shelves.get(shelfCode).push(loc);
  }

  return [...zones.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "vi"))
    .map(([zoneName, shelves]) => ({
      zoneName,
      shelves: [...shelves.entries()]
        .sort(([a], [b]) => a.localeCompare(b, "vi"))
        .map(([shelfCode, bins]) => ({
          shelfCode,
          bins: bins.sort((a, b) =>
            String(a.binCode || a.code || "").localeCompare(
              String(b.binCode || b.code || ""),
              "vi"
            )
          ),
        })),
    }));
}

const EMPTY_FORM = {
  zoneName: "",
  shelfCode: "",
  binCode: "",
  maxVolume: "",
  maxWeight: "",
  note: "",
};

export default function WarehouseLayoutPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editLoc, setEditLoc] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editGroup, setEditGroup] = useState(null); // { type: 'zone'|'shelf', zoneName, shelfCode? }
  const [editGroupName, setEditGroupName] = useState("");
  const [expandedZones, setExpandedZones] = useState(() => new Set());

  const tree = useMemo(() => groupLocations(locations), [locations]);
  const binCount = locations.length;
  const zoneCount = tree.length;
  const shelfCount = tree.reduce((sum, zone) => sum + zone.shelves.length, 0);

  const existingZones = useMemo(
    () => tree.map((zone) => zone.zoneName).filter((name) => name !== "Chưa có zone"),
    [tree]
  );

  const shelvesForCreateZone = useMemo(() => {
    const zone = tree.find((entry) => entry.zoneName === createForm.zoneName.trim());
    if (!zone) return [];
    return zone.shelves
      .map((shelf) => shelf.shelfCode)
      .filter((code) => code !== "Chưa có shelf");
  }, [tree, createForm.zoneName]);

  useEffect(() => {
    let active = true;
    async function loadWarehouses() {
      setIsLoading(true);
      setError("");
      try {
        const data = await warehouseService.listActiveWarehouses();
        if (!active) return;
        setWarehouses(data);
        if (data.length === 1) setWarehouseId(data[0].id);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadWarehouses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!warehouseId) {
      setLocations([]);
      return;
    }
    let active = true;
    async function loadLocations() {
      setIsListLoading(true);
      setError("");
      try {
        const locs = await warehouseService.listActiveWarehouseLocations(warehouseId);
        if (!active) return;
        setLocations(locs);
        setExpandedZones(new Set(locs.map((loc) => loc.zoneName || loc.zoneCode).filter(Boolean)));
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsListLoading(false);
      }
    }
    loadLocations();
    return () => {
      active = false;
    };
  }, [warehouseId]);

  function toggleZone(zoneName) {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(zoneName)) next.delete(zoneName);
      else next.add(zoneName);
      return next;
    });
  }

  async function refreshLocations() {
    if (!warehouseId) return;
    const locs = await warehouseService.listActiveWarehouseLocations(warehouseId);
    setLocations(locs);
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!warehouseId || pending) return;

    const zoneName = createForm.zoneName.trim();
    const shelfCode = createForm.shelfCode.trim();
    const binCode = createForm.binCode.trim();
    if (!zoneName || !shelfCode || !binCode) {
      setError("Nhập đủ Zone, Shelf và mã Bin.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");
    try {
      await warehouseService.createStorageLocation(warehouseId, {
        zoneName,
        shelfCode,
        binCode,
        maxVolume: createForm.maxVolume,
        maxWeight: createForm.maxWeight,
        isActive: true,
        note: createForm.note || "",
      });
      await refreshLocations();
      setExpandedZones((prev) => new Set([...prev, zoneName]));
      setCreateForm((prev) => ({
        ...EMPTY_FORM,
        zoneName: prev.zoneName,
        shelfCode: prev.shelfCode,
      }));
      setMessage(`Đã thêm vị trí ${zoneName} / ${shelfCode} / ${binCode}.`);
      setShowCreate(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function openEdit(loc) {
    setEditLoc(loc);
    setEditForm({
      zoneName: loc.zoneName || loc.zoneCode || "",
      shelfCode: loc.shelfCode || "",
      binCode: loc.binCode || loc.code || "",
      maxVolume:
        loc.maxVolume != null
          ? String(loc.maxVolume)
          : loc.capacity != null
            ? String(loc.capacity)
            : "",
      maxWeight: loc.maxWeight != null ? String(loc.maxWeight) : "",
      note: loc.note || "",
    });
    setError("");
  }

  function closeEdit() {
    setEditLoc(null);
    setEditForm(EMPTY_FORM);
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    if (!editLoc || pending) return;
    const binCode = editForm.binCode.trim();
    if (!binCode) {
      setError("Nhập mã ô.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");
    try {
      await warehouseService.updateWarehouseLocation(editLoc.id, {
        zoneName: editForm.zoneName.trim() || editLoc.zoneName,
        shelfCode: editForm.shelfCode.trim() || editLoc.shelfCode,
        binCode,
        maxVolume: editForm.maxVolume === "" ? null : Number(editForm.maxVolume),
        maxWeight: editForm.maxWeight === "" ? null : Number(editForm.maxWeight),
        isActive: editLoc.isActive !== false,
        note: editForm.note || "",
      });
      await refreshLocations();
      setMessage(`Đã cập nhật ${binCode}.`);
      closeEdit();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function openEditGroup(type, zoneName, shelfCode = "") {
    setEditGroup({ type, zoneName, shelfCode });
    setEditGroupName(type === "zone" ? zoneName : shelfCode);
    setError("");
    setMessage("");
  }

  function closeEditGroup() {
    setEditGroup(null);
    setEditGroupName("");
  }

  function locationsInZone(zoneName) {
    return locations.filter((loc) => (loc.zoneName || loc.zoneCode) === zoneName);
  }

  function locationsInShelf(zoneName, shelfCode) {
    return locations.filter(
      (loc) =>
        (loc.zoneName || loc.zoneCode) === zoneName && loc.shelfCode === shelfCode
    );
  }

  async function handleSaveEditGroup(event) {
    event.preventDefault();
    if (!editGroup || pending) return;
    const nextName = editGroupName.trim();
    if (!nextName) {
      setError(editGroup.type === "zone" ? "Nhập tên khu." : "Nhập mã kệ.");
      return;
    }

    const targets =
      editGroup.type === "zone"
        ? locationsInZone(editGroup.zoneName)
        : locationsInShelf(editGroup.zoneName, editGroup.shelfCode);

    if (!targets.length) {
      setError("Không có ô nào để đổi tên.");
      return;
    }

    if (
      editGroup.type === "zone" &&
      nextName === editGroup.zoneName
    ) {
      closeEditGroup();
      return;
    }
    if (
      editGroup.type === "shelf" &&
      nextName === editGroup.shelfCode
    ) {
      closeEditGroup();
      return;
    }

    setPending(true);
    setError("");
    setMessage("");
    try {
      for (const loc of targets) {
        await warehouseService.updateWarehouseLocation(loc.id, {
          zoneName:
            editGroup.type === "zone"
              ? nextName
              : loc.zoneName || loc.zoneCode || editGroup.zoneName,
          shelfCode:
            editGroup.type === "shelf" ? nextName : loc.shelfCode || editGroup.shelfCode,
          binCode: loc.binCode || loc.code,
          maxVolume: loc.maxVolume ?? loc.capacity ?? null,
          maxWeight: loc.maxWeight ?? null,
          isActive: loc.isActive !== false,
          note: loc.note || "",
        });
      }
      await refreshLocations();
      if (editGroup.type === "zone") {
        setExpandedZones((prev) => {
          const next = new Set(prev);
          next.delete(editGroup.zoneName);
          next.add(nextName);
          return next;
        });
        setMessage(`Đã đổi khu "${editGroup.zoneName}" → "${nextName}" (${targets.length} ô).`);
      } else {
        setMessage(
          `Đã đổi kệ "${editGroup.shelfCode}" → "${nextName}" trong ${editGroup.zoneName} (${targets.length} ô).`
        );
      }
      closeEditGroup();
    } catch (err) {
      setError(getErrorMessage(err));
      try {
        await refreshLocations();
      } catch {
        // giữ lỗi chính
      }
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(loc) {
    if (!loc || pending) return;
    const label = loc.binCode || loc.code || "ô";
    const ok = window.confirm(
      `Xóa ô "${label}" (${loc.zoneName || "?"} / ${loc.shelfCode || "?"})?\nWarehouse staff sẽ không put-away vào ô này nữa.`
    );
    if (!ok) return;

    setPending(true);
    setError("");
    setMessage("");
    try {
      await warehouseService.deleteWarehouseLocation(loc.id);
      await refreshLocations();
      if (editLoc?.id === loc.id) closeEdit();
      setMessage(`Đã xóa ${label}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function deleteLocationsBatch(targets, successMessage) {
    setPending(true);
    setError("");
    setMessage("");
    try {
      for (const loc of targets) {
        await warehouseService.deleteWarehouseLocation(loc.id);
      }
      await refreshLocations();
      if (editLoc && targets.some((loc) => loc.id === editLoc.id)) closeEdit();
      if (editGroup) closeEditGroup();
      setMessage(successMessage);
    } catch (err) {
      setError(getErrorMessage(err));
      try {
        await refreshLocations();
      } catch {
        // giữ lỗi chính
      }
    } finally {
      setPending(false);
    }
  }

  async function handleDeleteZone(zoneName) {
    if (!zoneName || pending) return;
    const targets = locationsInZone(zoneName);
    const ok = window.confirm(
      targets.length
        ? `Xóa khu "${zoneName}" và ${targets.length} ô bên trong?`
        : `Xóa khu "${zoneName}"?`
    );
    if (!ok) return;
    if (!targets.length) {
      setMessage(`Khu "${zoneName}" không còn ô.`);
      return;
    }
    await deleteLocationsBatch(targets, `Đã xóa khu "${zoneName}" (${targets.length} ô).`);
  }

  async function handleDeleteShelf(zoneName, shelfCode) {
    if (!zoneName || !shelfCode || pending) return;
    const targets = locationsInShelf(zoneName, shelfCode);
    const ok = window.confirm(
      targets.length
        ? `Xóa kệ "${shelfCode}" trong ${zoneName} và ${targets.length} ô?`
        : `Xóa kệ "${shelfCode}"?`
    );
    if (!ok) return;
    if (!targets.length) {
      setMessage(`Kệ "${shelfCode}" không còn ô.`);
      return;
    }
    await deleteLocationsBatch(
      targets,
      `Đã xóa kệ "${shelfCode}" trong ${zoneName} (${targets.length} ô).`
    );
  }

  return (
    <OperationsShell activeNav="warehouse-layout">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Bố trí vị trí kho
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed max-w-2xl">
              Ops tạo Zone → Shelf → Bin (địa chỉ lưu trữ). Xếp kiện lên kệ do Warehouse Staff
              put-away — không làm trên trang này.
            </p>
          </div>
          <button
            type="button"
            disabled={!warehouseId || pending}
            onClick={() => {
              setShowCreate(true);
              setError("");
              setMessage("");
            }}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-insight px-4 text-sm font-bold text-on-solid hover:bg-secondary disabled:opacity-50"
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            Thêm vị trí
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
            {message}
          </div>
        ) : null}

        <div className="rounded-xl border border-border-muted bg-surface-elevated p-4">
          <label htmlFor="warehouseId" className="text-sm font-semibold text-ink">
            Kho
          </label>
          <select
            id="warehouseId"
            value={warehouseId}
            onChange={(event) => {
              setWarehouseId(event.target.value);
              setMessage("");
              setError("");
              setShowCreate(false);
              closeEdit();
              closeEditGroup();
            }}
            disabled={isLoading}
            className="mt-2 h-11 w-full max-w-md rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
          >
            <option value="">— Chọn kho —</option>
            {warehouses.map((warehouse) => {
              const typeLabel = warehouseService.formatWarehouseType(warehouse.warehouseType);
              return (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                  {warehouse.code ? ` (${warehouse.code})` : ""}
                  {typeLabel && typeLabel !== "—" ? ` · ${typeLabel}` : ""}
                </option>
              );
            })}
          </select>
          {!isLoading && warehouses.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              Chưa có kho active. Nhờ Admin tạo kho trước.
            </p>
          ) : null}
        </div>

        {warehouseId ? (
          <section className="space-y-4 rounded-xl border border-border-muted bg-surface-elevated p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">Cây vị trí lưu trữ</h2>
                <p className="mt-1 text-xs text-muted">
                  {zoneCount} khu · {shelfCount} kệ · {binCount} ô
                </p>
              </div>
              {isListLoading || pending ? (
                <Icon icon="lucide:loader-2" className="h-5 w-5 animate-spin text-muted" />
              ) : null}
            </div>

            {!isListLoading && locations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border-muted px-4 py-10 text-center">
                <Icon icon="lucide:map-pin" className="mx-auto h-8 w-8 text-muted" />
                <p className="mt-2 text-sm font-semibold text-ink">Chưa có vị trí nào</p>
                <p className="mt-1 text-xs text-muted">
                  Bấm Thêm vị trí để tạo Zone / Shelf / Bin cho kho này.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              {tree.map((zone) => {
                const open = expandedZones.has(zone.zoneName);
                const binTotal = zone.shelves.reduce((sum, shelf) => sum + shelf.bins.length, 0);
                return (
                  <div
                    key={zone.zoneName}
                    className="overflow-hidden rounded-lg border border-border-muted"
                  >
                    <div className="flex w-full items-center gap-2 bg-surface-muted/60 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleZone(zone.zoneName)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left hover:opacity-90"
                      >
                        <Icon
                          icon={open ? "lucide:chevron-down" : "lucide:chevron-right"}
                          className="h-4 w-4 shrink-0 text-muted"
                        />
                        <Icon icon="lucide:layers" className="h-4 w-4 shrink-0 text-secondary" />
                        <span className="truncate text-sm font-bold text-ink">
                          {zone.zoneName}
                        </span>
                        <span className="ml-auto shrink-0 text-[11px] text-muted">
                          {zone.shelves.length} kệ · {binTotal} ô
                        </span>
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        title="Sửa tên khu"
                        aria-label="Sửa tên khu"
                        onClick={() => openEditGroup("zone", zone.zoneName)}
                        className="shrink-0 rounded-md p-1.5 text-muted hover:bg-surface hover:text-ink disabled:opacity-50"
                      >
                        <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        title="Xóa khu"
                        aria-label="Xóa khu"
                        onClick={() => handleDeleteZone(zone.zoneName)}
                        className="shrink-0 rounded-md p-1.5 text-danger hover:bg-danger/10 disabled:opacity-50"
                      >
                        <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {open ? (
                      <div className="divide-y divide-border-muted/70">
                        {zone.shelves.map((shelf) => (
                          <div key={`${zone.zoneName}-${shelf.shelfCode}`} className="bg-surface">
                            <div className="flex items-center gap-2 px-3 py-2 pl-9">
                              <Icon
                                icon="lucide:layout-list"
                                className="h-3.5 w-3.5 shrink-0 text-muted"
                              />
                              <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">
                                {shelf.shelfCode}
                              </span>
                              <span className="text-[11px] text-muted">
                                {shelf.bins.length} ô
                              </span>
                              <button
                                type="button"
                                disabled={pending}
                                title="Sửa mã kệ"
                                aria-label="Sửa mã kệ"
                                onClick={() =>
                                  openEditGroup("shelf", zone.zoneName, shelf.shelfCode)
                                }
                                className="rounded-md p-1.5 text-muted hover:bg-surface-muted hover:text-ink disabled:opacity-50"
                              >
                                <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={pending}
                                title="Xóa kệ"
                                aria-label="Xóa kệ"
                                onClick={() =>
                                  handleDeleteShelf(zone.zoneName, shelf.shelfCode)
                                }
                                className="rounded-md p-1.5 text-danger hover:bg-danger/10 disabled:opacity-50"
                              >
                                <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <ul className="pb-2">
                              {shelf.bins.map((loc) => (
                                <li
                                  key={loc.id}
                                  className="flex items-center gap-2 px-3 py-1.5 pl-14 hover:bg-surface-muted/40"
                                >
                                  <Icon
                                    icon="lucide:box"
                                    className="h-3.5 w-3.5 shrink-0 text-muted"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-ink">
                                      {loc.binCode || loc.code || loc.name}
                                    </p>
                                    <p className="truncate text-[11px] text-muted">
                                      maxV {formatVolume(loc.maxVolume ?? loc.capacity)} · maxW{" "}
                                      {formatVolume(loc.maxWeight)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={pending}
                                    title="Sửa"
                                    aria-label="Sửa vị trí"
                                    onClick={() => openEdit(loc)}
                                    className="rounded-md p-1.5 text-muted hover:bg-surface-muted hover:text-ink disabled:opacity-50"
                                  >
                                    <Icon icon="lucide:pencil" className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={pending}
                                    title="Xóa"
                                    aria-label="Xóa vị trí"
                                    onClick={() => handleDelete(loc)}
                                    className="rounded-md p-1.5 text-danger hover:bg-danger/10 disabled:opacity-50"
                                  >
                                    <Icon icon="lucide:trash-2" className="h-3.5 w-3.5" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
            aria-label="Đóng"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-loc-title"
            className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border-muted px-6 py-4">
              <div>
                <h3 id="create-loc-title" className="text-lg font-bold text-ink">
                  Thêm vị trí lưu trữ
                </h3>
                <p className="mt-1 text-xs text-muted">
                  Tạo Zone + Shelf + Bin một lần. Có thể tái dùng Zone/Shelf đã có.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="p-2 text-muted hover:text-ink"
                aria-label="Đóng"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 p-6">
              <div className="space-y-2">
                <label htmlFor="create-zone" className="text-sm font-semibold text-ink">
                  Khu <span className="text-danger">*</span>
                </label>
                <input
                  id="create-zone"
                  list="existing-zones"
                  required
                  value={createForm.zoneName}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, zoneName: e.target.value }))
                  }
                  placeholder="VD: Khu A, Receiving, Bulk"
                  className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                />
                <datalist id="existing-zones">
                  {existingZones.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label htmlFor="create-shelf" className="text-sm font-semibold text-ink">
                  Kệ <span className="text-danger">*</span>
                </label>
                <input
                  id="create-shelf"
                  list="existing-shelves"
                  required
                  value={createForm.shelfCode}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, shelfCode: e.target.value }))
                  }
                  placeholder="VD: SHELF-A1"
                  className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                />
                <datalist id="existing-shelves">
                  {shelvesForCreateZone.map((code) => (
                    <option key={code} value={code} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <label htmlFor="create-bin" className="text-sm font-semibold text-ink">
                  Mã ô <span className="text-danger">*</span>
                </label>
                <input
                  id="create-bin"
                  required
                  value={createForm.binCode}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, binCode: e.target.value }))
                  }
                  placeholder="VD: BIN-A1-01"
                  className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="create-max-v" className="text-sm font-semibold text-ink">
                    Max volume
                  </label>
                  <input
                    id="create-max-v"
                    type="number"
                    min={0}
                    step="any"
                    value={createForm.maxVolume}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, maxVolume: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="create-max-w" className="text-sm font-semibold text-ink">
                    Max weight
                  </label>
                  <input
                    id="create-max-w"
                    type="number"
                    min={0}
                    step="any"
                    value={createForm.maxWeight}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, maxWeight: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="create-note" className="text-sm font-semibold text-ink">
                  Ghi chú
                </label>
                <input
                  id="create-note"
                  value={createForm.note}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="Tuỳ chọn"
                  className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="h-11 rounded-lg border border-border-muted px-5 text-sm font-semibold text-muted hover:bg-surface-elevated"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="h-11 rounded-lg bg-insight px-5 text-sm font-bold text-on-solid hover:bg-secondary disabled:opacity-60"
                >
                  {pending ? "Đang lưu..." : "Tạo vị trí"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editLoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={closeEdit}
            aria-label="Đóng"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-loc-title"
            className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border-muted px-6 py-4">
              <h3 id="edit-loc-title" className="text-lg font-bold text-ink">
                Sửa vị trí
              </h3>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 text-muted hover:text-ink"
                aria-label="Đóng"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="edit-zone" className="text-sm font-semibold text-ink">
                    Khu
                  </label>
                  <input
                    id="edit-zone"
                    value={editForm.zoneName}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, zoneName: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-shelf" className="text-sm font-semibold text-ink">
                    Kệ
                  </label>
                  <input
                    id="edit-shelf"
                    value={editForm.shelfCode}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, shelfCode: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-bin" className="text-sm font-semibold text-ink">
                  Mã ô <span className="text-danger">*</span>
                </label>
                <input
                  id="edit-bin"
                  required
                  value={editForm.binCode}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, binCode: e.target.value }))
                  }
                  className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="edit-max-v" className="text-sm font-semibold text-ink">
                    Max volume
                  </label>
                  <input
                    id="edit-max-v"
                    type="number"
                    min={0}
                    step="any"
                    value={editForm.maxVolume}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, maxVolume: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-max-w" className="text-sm font-semibold text-ink">
                    Max weight
                  </label>
                  <input
                    id="edit-max-w"
                    type="number"
                    min={0}
                    step="any"
                    value={editForm.maxWeight}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, maxWeight: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-note" className="text-sm font-semibold text-ink">
                  Ghi chú
                </label>
                <input
                  id="edit-note"
                  value={editForm.note}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                />
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(editLoc)}
                  className="h-11 rounded-lg border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-60"
                >
                  Xóa
                </button>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={closeEdit}
                    className="h-11 rounded-lg border border-border-muted px-5 text-sm font-semibold text-muted hover:bg-surface-elevated"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-11 rounded-lg bg-insight px-5 text-sm font-bold text-on-solid hover:bg-secondary disabled:opacity-60"
                  >
                    {pending ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editGroup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={closeEditGroup}
            aria-label="Đóng"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-group-title"
            className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border-muted px-6 py-4">
              <div>
                <h3 id="edit-group-title" className="text-lg font-bold text-ink">
                  {editGroup.type === "zone" ? "Sửa tên khu" : "Sửa mã kệ"}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {editGroup.type === "zone"
                    ? `Đổi tên cho mọi ô trong khu "${editGroup.zoneName}".`
                    : `Đổi mã kệ trong khu ${editGroup.zoneName}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditGroup}
                className="p-2 text-muted hover:text-ink"
                aria-label="Đóng"
              >
                <Icon icon="lucide:x" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditGroup} className="space-y-4 p-6">
              <div className="space-y-2">
                <label htmlFor="edit-group-name" className="text-sm font-semibold text-ink">
                  {editGroup.type === "zone" ? "Tên khu" : "Mã kệ"}{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  id="edit-group-name"
                  required
                  autoFocus
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border-muted px-4 text-sm input-focus-ring"
                />
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    editGroup.type === "zone"
                      ? handleDeleteZone(editGroup.zoneName)
                      : handleDeleteShelf(editGroup.zoneName, editGroup.shelfCode)
                  }
                  className="h-11 rounded-lg border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-60"
                >
                  {editGroup.type === "zone" ? "Xóa khu" : "Xóa kệ"}
                </button>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={closeEditGroup}
                    className="h-11 rounded-lg border border-border-muted px-5 text-sm font-semibold text-muted hover:bg-surface-elevated"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-11 rounded-lg bg-insight px-5 text-sm font-bold text-on-solid hover:bg-secondary disabled:opacity-60"
                  >
                    {pending ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </OperationsShell>
  );
}
