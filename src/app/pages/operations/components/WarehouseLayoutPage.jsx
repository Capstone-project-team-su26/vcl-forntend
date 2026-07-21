"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";
import * as warehouseService from "@/modules/warehouses";
import { getErrorMessage } from "@/utils/apiError";

function cellTone(cell) {
  if (!cell) return "border-dashed border-border-muted bg-surface text-muted";
  if (cell.hasInventory || (cell.fillRatio != null && cell.fillRatio > 0.7)) {
    return "border-danger/40 bg-danger/10 text-danger";
  }
  if (cell.fillRatio != null && cell.fillRatio > 0.3) {
    return "border-warning/40 bg-warning-bg/50 text-warning-text";
  }
  return "border-success/30 bg-success-bg/40 text-success-text";
}

function formatVolume(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("vi-VN");
}

export default function WarehouseLayoutPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [locations, setLocations] = useState([]);
  const [cells, setCells] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const [zoneName, setZoneName] = useState("");
  const [shelfCode, setShelfCode] = useState("");
  const [binCode, setBinCode] = useState("");
  const [maxVolume, setMaxVolume] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  const [placeBinId, setPlaceBinId] = useState("");
  const [placeRow, setPlaceRow] = useState("0");
  const [placeCol, setPlaceCol] = useState("0");
  const [placeLabel, setPlaceLabel] = useState("");

  const board = useMemo(() => warehouseService.buildLayoutGrid(cells), [cells]);

  const bins = useMemo(() => {
    const placed = new Set(cells.map((cell) => cell.binId).filter(Boolean));
    return locations.filter((loc) => {
      const binId = loc.binId || loc.id;
      if (!binId) return false;
      if (loc.locationType && loc.locationType !== "BIN" && !loc.binCode) return false;
      return !placed.has(binId);
    });
  }, [locations, cells]);

  useEffect(() => {
    let active = true;
    async function loadWarehouses() {
      setIsLoading(true);
      setError("");
      try {
        const data = await warehouseService.listActiveDestinationWarehouses();
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
      setCells([]);
      return;
    }

    let active = true;
    async function loadBoard() {
      setIsBoardLoading(true);
      setError("");
      try {
        const [locs, layout] = await Promise.all([
          warehouseService.listActiveWarehouseLocations(warehouseId),
          warehouseService.getWarehouseLayoutBoard(warehouseId),
        ]);
        if (!active) return;
        setLocations(locs);
        setCells(layout);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsBoardLoading(false);
      }
    }

    loadBoard();
    return () => {
      active = false;
    };
  }, [warehouseId]);

  async function refreshBoard() {
    if (!warehouseId) return;
    const [locs, layout] = await Promise.all([
      warehouseService.listActiveWarehouseLocations(warehouseId),
      warehouseService.getWarehouseLayoutBoard(warehouseId),
    ]);
    setLocations(locs);
    setCells(layout);
  }

  async function handleCreateLocation(event) {
    event.preventDefault();
    if (!warehouseId || pending) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const response = await warehouseService.createStorageLocation(warehouseId, {
        zoneName,
        shelfCode,
        binCode,
        maxVolume,
        maxWeight,
        isActive: true,
      });
      setMessage(response.message || "Đã tạo vị trí.");
      setZoneName("");
      setShelfCode("");
      setBinCode("");
      setMaxVolume("");
      setMaxWeight("");
      await refreshBoard();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function handlePlaceCell(event) {
    event.preventDefault();
    if (!warehouseId || pending) return;
    const location = locations.find((entry) => (entry.binId || entry.id) === placeBinId);
    if (!location) {
      setError("Chọn bin chưa gắn sơ đồ.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");
    try {
      const response = await warehouseService.createWarehouseLayoutCell(warehouseId, {
        zoneId: location.zoneId,
        shelfId: location.shelfId,
        binId: location.binId || location.id,
        rowIndex: Number(placeRow),
        columnIndex: Number(placeCol),
        displayLabel: placeLabel.trim() || location.binCode || location.code || "BIN",
        layoutType: "BIN",
        status: "ACTIVE",
      });
      setMessage(response.message || "Đã gắn ô sơ đồ.");
      setPlaceBinId("");
      setPlaceLabel("");
      await refreshBoard();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function handleDeleteCell(cell) {
    if (!warehouseId || !cell?.id || pending) return;
    const ok = window.confirm(`Xóa ô "${cell.displayLabel}" khỏi sơ đồ?`);
    if (!ok) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await warehouseService.deleteWarehouseLayoutCell(warehouseId, cell.id);
      setMessage("Đã xóa ô sơ đồ.");
      await refreshBoard();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function pickEmptySlot(row, col) {
    setPlaceRow(String(row));
    setPlaceCol(String(col));
  }

  return (
    <OperationsShell activeNav="warehouse-layout">
      <div className="space-y-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
            Phân bố vị trí kho
          </h1>
          <p className="text-sm text-muted mt-1 leading-relaxed max-w-2xl">
            Tạo Zone/Shelf/Bin (sức chứa theo bin) và gắn lên sơ đồ. Admin chỉ giữ master kho.
          </p>
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

        <div className="bg-surface-elevated rounded-xl border border-border-muted p-4">
          <label htmlFor="warehouseId" className="text-sm font-semibold text-ink">
            Kho đích
          </label>
          <select
            id="warehouseId"
            value={warehouseId}
            onChange={(event) => setWarehouseId(event.target.value)}
            disabled={isLoading}
            className="mt-2 w-full max-w-md h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
          >
            <option value="">— Chọn kho —</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
                {warehouse.code ? ` (${warehouse.code})` : ""}
              </option>
            ))}
          </select>
          {!isLoading && warehouses.length === 0 ? (
            <p className="text-sm text-muted mt-2">
              Chưa có kho đích active. Nhờ Admin tạo kho loại Destination.
            </p>
          ) : null}
        </div>

        {warehouseId ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <section className="bg-surface-elevated rounded-xl border border-border-muted p-5 space-y-5">
              <div>
                <h2 className="text-base font-bold text-ink">1. Tạo vị trí lưu trữ</h2>
                <p className="text-xs text-muted mt-1">
                  Một lần tạo Zone + Shelf + Bin. Sức chứa gắn trên bin.
                </p>
              </div>

              <form onSubmit={handleCreateLocation} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    required
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder="Zone (VD: Khu A)"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                  <input
                    required
                    value={shelfCode}
                    onChange={(e) => setShelfCode(e.target.value)}
                    placeholder="Shelf (VD: SHELF-A1)"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                  <input
                    required
                    value={binCode}
                    onChange={(e) => setBinCode(e.target.value)}
                    placeholder="Bin (VD: BIN-A1-01)"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={maxVolume}
                    onChange={(e) => setMaxVolume(e.target.value)}
                    placeholder="Max volume (CBM/cm³)"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(e.target.value)}
                    placeholder="Max weight (kg)"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pending}
                  className="h-10 px-4 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold disabled:opacity-60"
                >
                  Tạo vị trí
                </button>
              </form>

              <div>
                <h3 className="text-sm font-bold text-ink mb-2">Bin đang có</h3>
                {isBoardLoading ? (
                  <p className="text-sm text-muted">Đang tải vị trí...</p>
                ) : locations.length === 0 ? (
                  <p className="text-sm text-muted">Chưa có vị trí — tạo bin bên trên.</p>
                ) : (
                  <ul className="space-y-2 max-h-56 overflow-y-auto">
                    {locations.map((loc) => (
                      <li
                        key={loc.id}
                        className="rounded-lg border border-border-muted px-3 py-2 text-sm"
                      >
                        <p className="font-semibold text-ink">
                          {loc.binCode || loc.code || loc.name}
                        </p>
                        <p className="text-xs text-muted">
                          {loc.zoneName || loc.zoneCode || "Zone?"} · {loc.shelfCode || "Shelf?"}
                          {" · "}maxV {formatVolume(loc.maxVolume ?? loc.capacity)}
                          {" · "}maxW {formatVolume(loc.maxWeight)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form onSubmit={handlePlaceCell} className="space-y-3 border-t border-border-muted pt-4">
                <div>
                  <h2 className="text-base font-bold text-ink">2. Gắn bin lên sơ đồ</h2>
                  <p className="text-xs text-muted mt-1">Chọn ô trống trên lưới hoặc nhập hàng/cột.</p>
                </div>
                <select
                  required
                  value={placeBinId}
                  onChange={(e) => setPlaceBinId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border-muted text-sm"
                >
                  <option value="">— Bin chưa gắn sơ đồ —</option>
                  {bins.map((loc) => (
                    <option key={loc.id} value={loc.binId || loc.id}>
                      {loc.binCode || loc.code}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min={0}
                    required
                    value={placeRow}
                    onChange={(e) => setPlaceRow(e.target.value)}
                    placeholder="Hàng"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    required
                    value={placeCol}
                    onChange={(e) => setPlaceCol(e.target.value)}
                    placeholder="Cột"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                  <input
                    value={placeLabel}
                    onChange={(e) => setPlaceLabel(e.target.value)}
                    placeholder="Nhãn ô"
                    className="h-10 px-3 rounded-lg border border-border-muted text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pending || bins.length === 0}
                  className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-60"
                >
                  Gắn lên sơ đồ
                </button>
              </form>
            </section>

            <section className="bg-surface-elevated rounded-xl border border-border-muted p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink">Sơ đồ kho</h2>
                  <p className="text-xs text-muted mt-1">
                    Xanh = trống · Vàng = đang chứa · Đỏ = gần đầy / có tồn. Bấm ô trống để chọn vị trí.
                  </p>
                </div>
                {isBoardLoading ? (
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin text-muted" />
                ) : null}
              </div>

              <div className="overflow-x-auto">
                <div
                  className="inline-grid gap-2 min-w-full"
                  style={{ gridTemplateColumns: `repeat(${board.cols}, minmax(4.5rem, 1fr))` }}
                >
                  {board.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        role={cell ? undefined : "button"}
                        tabIndex={cell ? undefined : 0}
                        onClick={() => {
                          if (cell) return;
                          pickEmptySlot(rowIndex, colIndex);
                        }}
                        onKeyDown={(event) => {
                          if (cell) return;
                          if (event.key !== "Enter" && event.key !== " ") return;
                          event.preventDefault();
                          pickEmptySlot(rowIndex, colIndex);
                        }}
                        className={`min-h-16 rounded-lg border px-2 py-2 text-left transition-opacity ${cellTone(cell)} ${
                          !cell ? "hover:opacity-80 cursor-pointer" : "cursor-default"
                        }`}
                        title={cell ? cell.displayLabel : `Ô trống ${rowIndex},${colIndex}`}
                      >
                        {cell ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold leading-tight">{cell.displayLabel}</p>
                            <p className="text-[10px] opacity-80">
                              {rowIndex},{colIndex}
                              {cell.fillRatio != null
                                ? ` · ${Math.round(Number(cell.fillRatio) * 100)}%`
                                : ""}
                            </p>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteCell(cell);
                              }}
                              className="text-[10px] font-semibold underline opacity-80 hover:opacity-100"
                            >
                              Gỡ ô
                            </button>
                          </div>
                        ) : (
                          <p className="text-[11px] font-medium">
                            {rowIndex},{colIndex}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </OperationsShell>
  );
}
