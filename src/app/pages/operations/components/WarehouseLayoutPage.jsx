"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";
import * as warehouseService from "@/modules/warehouses";
import { getErrorMessage } from "@/utils/apiError";

const DRAG_BIN = "application/x-vcl-bin";
const DRAG_NEW_BIN = "application/x-vcl-new-bin";
const DRAG_CELL = "application/x-vcl-layout-cell";

const ZONE_PALETTE = [
  {
    chip: "bg-info-bg text-info-text border-secondary/35",
    rack: "border-secondary/45 bg-info-bg text-ink",
  },
  {
    chip: "bg-success-bg text-success-text border-success/35",
    rack: "border-success/40 bg-success-bg/80 text-success-text",
  },
  {
    chip: "bg-warning-bg text-warning-text border-warning/35",
    rack: "border-warning/40 bg-warning-bg/70 text-warning-text",
  },
  {
    chip: "bg-surface-alt/40 text-ink border-primary/35",
    rack: "border-primary/45 bg-surface-alt/50 text-ink",
  },
  {
    chip: "bg-surface-tint text-ink border-border",
    rack: "border-border bg-surface-tint text-ink",
  },
];

function colLabel(index) {
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

function formatVolume(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("vi-VN");
}

function fillLevel(cell) {
  if (!cell) return "aisle";
  if (cell.hasInventory || (cell.fillRatio != null && cell.fillRatio > 0.7)) return "full";
  if (cell.fillRatio != null && cell.fillRatio > 0.3) return "mid";
  return "empty";
}

function fillBarClass(level) {
  if (level === "full") return "bg-danger";
  if (level === "mid") return "bg-warning-text";
  return "bg-success";
}

function readDragPayload(event) {
  const tryParse = (raw) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const newBinRaw = event.dataTransfer.getData(DRAG_NEW_BIN);
  if (newBinRaw) {
    const data = tryParse(newBinRaw);
    if (data) return { type: "new-bin", ...data };
  }
  const binRaw = event.dataTransfer.getData(DRAG_BIN);
  if (binRaw) {
    const data = tryParse(binRaw);
    if (data) return { type: "bin", ...data };
  }
  const cellRaw = event.dataTransfer.getData(DRAG_CELL);
  if (cellRaw) {
    const data = tryParse(cellRaw);
    if (data) return { type: "cell", ...data };
  }

  const plain = tryParse(event.dataTransfer.getData("text/plain"));
  if (plain?.kind === "new-bin") return { type: "new-bin", ...plain };
  if (plain?.kind === "bin" && plain.binId) return { type: "bin", ...plain };
  if (plain?.kind === "cell" && plain.cellId) return { type: "cell", ...plain };
  return null;
}

function isDraftCellId(id) {
  return !id || String(id).startsWith("draft-");
}

function isDraftLocId(id) {
  return !id || String(id).startsWith("draft-loc-");
}

function nextDraftCellId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextDraftLocId() {
  return `draft-loc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneCells(list) {
  return (list || []).map((cell) => ({ ...cell }));
}

function cloneLocations(list) {
  return (list || []).map((loc) => ({ ...loc }));
}

function layoutFingerprint(list) {
  return (list || [])
    .map(
      (cell) =>
        `${cell.id ?? ""}|${cell.binId ?? ""}|${cell.rowIndex}|${cell.columnIndex}|${cell.displayLabel ?? ""}`
    )
    .sort()
    .join(";");
}

function locationFingerprint(list) {
  return (list || [])
    .map((loc) =>
      [
        loc.id ?? "",
        loc.binId ?? "",
        loc.binCode || loc.code || "",
        loc.zoneName || loc.zoneCode || "",
        loc.shelfCode || "",
        loc.maxVolume ?? loc.capacity ?? "",
        loc.maxWeight ?? "",
      ].join("|")
    )
    .sort()
    .join(";");
}

function nextBinCode(locations, draftCells) {
  const used = new Set();
  for (const loc of locations || []) {
    const code = (loc.binCode || loc.code || "").trim().toUpperCase();
    if (code) used.add(code);
  }
  for (const cell of draftCells || []) {
    const label = (cell.displayLabel || "").trim().toUpperCase();
    if (label) used.add(label);
  }
  let n = 1;
  while (n < 10000) {
    const code = `BIN-${String(n).padStart(3, "0")}`;
    if (!used.has(code)) return code;
    n += 1;
  }
  return `BIN-${Date.now()}`;
}

export default function WarehouseLayoutPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [mode, setMode] = useState("view");
  const [locations, setLocations] = useState([]);
  const [savedLocations, setSavedLocations] = useState([]);
  const [cells, setCells] = useState([]);
  const [draftCells, setDraftCells] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [dragOverKey, setDragOverKey] = useState(null);
  const [draggingKind, setDraggingKind] = useState(null);
  const [unplaceHot, setUnplaceHot] = useState(false);
  const [activeZone, setActiveZone] = useState("");
  const [activeShelf, setActiveShelf] = useState("");
  const [extraZones, setExtraZones] = useState([]);
  const [extraShelves, setExtraShelves] = useState([]); // { zone, shelf }
  const [addingZone, setAddingZone] = useState(false);
  const [addingShelf, setAddingShelf] = useState(false);
  const [newZoneInput, setNewZoneInput] = useState("");
  const [newShelfInput, setNewShelfInput] = useState("");
  const [editLoc, setEditLoc] = useState(null);
  const [editForm, setEditForm] = useState({
    binCode: "",
    maxVolume: "",
    maxWeight: "",
  });
  const [editGroup, setEditGroup] = useState(null); // { type: 'zone'|'shelf', name: string }
  const [editGroupName, setEditGroupName] = useState("");

  const isEdit = mode === "edit";
  const workingCells = isEdit ? draftCells : cells;
  const isDirty =
    isEdit &&
    (layoutFingerprint(draftCells) !== layoutFingerprint(cells) ||
      locationFingerprint(locations) !== locationFingerprint(savedLocations));
  const board = useMemo(
    () => warehouseService.buildLayoutGrid(workingCells),
    [workingCells]
  );

  const existingZones = useMemo(() => {
    const names = new Set(extraZones);
    for (const loc of locations) {
      const name = loc.zoneName || loc.zoneCode;
      if (name) names.add(name);
    }
    for (const cell of workingCells) {
      if (cell.zoneName) names.add(cell.zoneName);
    }
    return [...names].sort((a, b) => a.localeCompare(b, "vi"));
  }, [locations, workingCells, extraZones]);

  const shelvesForActiveZone = useMemo(() => {
    const codes = new Set();
    for (const entry of extraShelves) {
      if (!activeZone || entry.zone === activeZone) codes.add(entry.shelf);
    }
    for (const loc of locations) {
      const zone = loc.zoneName || loc.zoneCode;
      if (activeZone && zone !== activeZone) continue;
      if (loc.shelfCode) codes.add(loc.shelfCode);
    }
    for (const cell of workingCells) {
      if (activeZone && cell.zoneName !== activeZone) continue;
      if (cell.shelfCode) codes.add(cell.shelfCode);
    }
    return [...codes].sort((a, b) => a.localeCompare(b, "vi"));
  }, [locations, workingCells, extraShelves, activeZone]);

  const locationByBinId = useMemo(() => {
    const map = new Map();
    for (const loc of locations) {
      const binId = loc.binId || loc.id;
      if (binId) map.set(binId, loc);
    }
    return map;
  }, [locations]);

  const enrichedCells = useMemo(
    () =>
      workingCells.map((cell) => {
        const loc = cell.binId ? locationByBinId.get(cell.binId) : null;
        return {
          ...cell,
          zoneName: loc?.zoneName || loc?.zoneCode || cell.zoneName || null,
          shelfCode: loc?.shelfCode || cell.shelfCode || null,
        };
      }),
    [workingCells, locationByBinId]
  );

  const zoneToneById = useMemo(() => {
    const map = new Map();
    let i = 0;
    for (const cell of enrichedCells) {
      const key = cell.zoneId || cell.zoneName || "_";
      if (!map.has(key)) {
        map.set(key, ZONE_PALETTE[i % ZONE_PALETTE.length]);
        i += 1;
      }
    }
    return map;
  }, [enrichedCells]);

  const zoneLegend = useMemo(() => {
    const seen = new Map();
    for (const cell of enrichedCells) {
      const key = cell.zoneId || cell.zoneName || "_";
      if (seen.has(key)) continue;
      seen.set(key, {
        key,
        label: cell.zoneName || "Zone",
        tone: zoneToneById.get(key),
      });
    }
    return [...seen.values()];
  }, [enrichedCells, zoneToneById]);

  const bins = useMemo(() => {
    const placed = new Set(workingCells.map((cell) => cell.binId).filter(Boolean));
    return locations.filter((loc) => {
      const binId = loc.binId || loc.id;
      if (!binId) return false;
      if (loc.locationType && loc.locationType !== "BIN" && !loc.binCode) return false;
      return !placed.has(binId);
    });
  }, [locations, workingCells]);

  const cellByKey = useMemo(() => {
    const map = new Map();
    for (const cell of enrichedCells) {
      map.set(`${cell.rowIndex}:${cell.columnIndex}`, cell);
    }
    return map;
  }, [enrichedCells]);

  const canDragNewBin = Boolean(activeZone && activeShelf) && !pending;

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
      setSavedLocations([]);
      setCells([]);
      setDraftCells([]);
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
        setLocations(cloneLocations(locs));
        setSavedLocations(cloneLocations(locs));
        setCells(layout);
        setDraftCells(cloneCells(layout));
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

  useEffect(() => {
    setDraggingKind(null);
    setDragOverKey(null);
    setUnplaceHot(false);
    setActiveZone("");
    setActiveShelf("");
    setExtraZones([]);
    setExtraShelves([]);
    setAddingZone(false);
    setAddingShelf(false);
    setNewZoneInput("");
    setNewShelfInput("");
  }, [mode, warehouseId]);

  useEffect(() => {
    if (!activeZone) {
      setActiveShelf("");
      return;
    }
    if (activeShelf && !shelvesForActiveZone.includes(activeShelf)) {
      setActiveShelf("");
    }
  }, [activeZone, activeShelf, shelvesForActiveZone]);

  function enterEditMode() {
    setDraftCells(cloneCells(cells));
    setLocations(cloneLocations(savedLocations));
    setMode("edit");
    setMessage("");
    setError("");
  }

  function leaveEditMode({ force = false } = {}) {
    if (!force && isDirty) {
      const ok = window.confirm("Có thay đổi chưa lưu. Hủy và quay lại chế độ Xem?");
      if (!ok) return false;
    }
    setDraftCells(cloneCells(cells));
    setLocations(cloneLocations(savedLocations));
    setMode("view");
    setMessage("");
    return true;
  }

  function switchMode(next) {
    if (next === mode) return;
    if (next === "edit") enterEditMode();
    else leaveEditMode();
  }

  function discardDraft() {
    if (!isDirty) {
      setDraftCells(cloneCells(cells));
      setLocations(cloneLocations(savedLocations));
      return;
    }
    const ok = window.confirm("Hủy mọi thay đổi chưa lưu (sơ đồ + zone/shelf/bin)?");
    if (!ok) return;
    setDraftCells(cloneCells(cells));
    setLocations(cloneLocations(savedLocations));
    setMessage("Đã hoàn tác về bản đã lưu.");
    setError("");
  }

  async function refreshBoard() {
    if (!warehouseId) return;
    const [locs, layout] = await Promise.all([
      warehouseService.listActiveWarehouseLocations(warehouseId),
      warehouseService.getWarehouseLayoutBoard(warehouseId),
    ]);
    setLocations(cloneLocations(locs));
    setSavedLocations(cloneLocations(locs));
    setCells(layout);
    setDraftCells(cloneCells(layout));
  }

  function commitNewZone() {
    const name = newZoneInput.trim();
    if (!name) {
      setAddingZone(false);
      setNewZoneInput("");
      return;
    }
    setExtraZones((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setActiveZone(name);
    setActiveShelf("");
    setAddingZone(false);
    setNewZoneInput("");
  }

  function commitNewShelf() {
    const code = newShelfInput.trim();
    if (!code || !activeZone) {
      setAddingShelf(false);
      setNewShelfInput("");
      return;
    }
    setExtraShelves((prev) =>
      prev.some((entry) => entry.zone === activeZone && entry.shelf === code)
        ? prev
        : [...prev, { zone: activeZone, shelf: code }]
    );
    setActiveShelf(code);
    setAddingShelf(false);
    setNewShelfInput("");
  }

  function placeBinAt(binId, rowIndex, columnIndex) {
    if (!isEdit) return;
    const location = locations.find((entry) => (entry.binId || entry.id) === binId);
    if (!location) {
      setError("Không tìm thấy bin để gắn.");
      return;
    }
    if (draftCells.some((cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex)) {
      setError("Ô này đã có bin.");
      return;
    }
    if (draftCells.some((cell) => cell.binId === (location.binId || location.id))) {
      setError("Bin này đã nằm trên sơ đồ nháp.");
      return;
    }

    setError("");
    setMessage("");
    setDraftCells((prev) => [
      ...prev,
      {
        id: nextDraftCellId(),
        warehouseId,
        zoneId: location.zoneId,
        shelfId: location.shelfId,
        binId: location.binId || location.id,
        rowIndex,
        columnIndex,
        displayLabel: location.binCode || location.code || "BIN",
        layoutType: "BIN",
        status: "ACTIVE",
        width: 1,
        height: 1,
        colorCode: null,
        fillRatio: 0,
        hasInventory: false,
        zoneName: location.zoneName || location.zoneCode || null,
        shelfCode: location.shelfCode || null,
      },
    ]);
  }

  function createNewBinAt(rowIndex, columnIndex) {
    if (!isEdit || pending) return;
    if (!activeZone || !activeShelf) {
      setError("Chọn Zone và Shelf trước khi kéo bin.");
      return;
    }
    if (draftCells.some((cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex)) {
      setError("Ô này đã có bin.");
      return;
    }

    const binCode = nextBinCode(locations, draftCells);
    const locId = nextDraftLocId();
    const location = {
      id: locId,
      warehouseId,
      zoneId: null,
      zoneName: activeZone,
      zoneCode: activeZone.slice(0, 8).toUpperCase(),
      shelfId: null,
      shelfCode: activeShelf,
      binId: locId,
      binCode,
      code: binCode,
      name: binCode,
      maxVolume: null,
      maxWeight: null,
      capacity: null,
      currentVolume: 0,
      locationType: "BIN",
      parentId: null,
      isActive: true,
      note: null,
    };

    setError("");
    setMessage("");
    setLocations((prev) => [location, ...prev]);
    setDraftCells((prev) => [
      ...prev.filter(
        (cell) =>
          !(cell.rowIndex === rowIndex && cell.columnIndex === columnIndex) &&
          cell.binId !== locId
      ),
      {
        id: nextDraftCellId(),
        warehouseId,
        zoneId: null,
        shelfId: null,
        binId: locId,
        rowIndex,
        columnIndex,
        displayLabel: binCode,
        layoutType: "BIN",
        status: "ACTIVE",
        width: 1,
        height: 1,
        colorCode: null,
        fillRatio: 0,
        hasInventory: false,
        zoneName: activeZone,
        shelfCode: activeShelf,
      },
    ]);
    setMessage(
      `Đã thêm ${binCode} tại ${colLabel(columnIndex)}${rowIndex + 1} (bản nháp). Nhớ Lưu sơ đồ.`
    );
  }

  function moveCellTo(cell, rowIndex, columnIndex) {
    if (!isEdit || !cell?.id) return;
    if (cell.rowIndex === rowIndex && cell.columnIndex === columnIndex) return;
    if (
      draftCells.some(
        (entry) =>
          entry.id !== cell.id &&
          entry.rowIndex === rowIndex &&
          entry.columnIndex === columnIndex
      )
    ) {
      setError("Ô đích đã có bin.");
      return;
    }

    setError("");
    setMessage("");
    setDraftCells((prev) =>
      prev.map((entry) =>
        entry.id === cell.id ? { ...entry, rowIndex, columnIndex } : entry
      )
    );
  }

  function handleDeleteCell(cell, { confirm: needConfirm = true } = {}) {
    if (!isEdit || !cell?.id) return;
    if (needConfirm) {
      const ok = window.confirm(`Gỡ ô "${cell.displayLabel}" khỏi sơ đồ nháp?`);
      if (!ok) return;
    }
    setError("");
    setMessage("");
    setDraftCells((prev) => prev.filter((entry) => entry.id !== cell.id));
  }

  function openEditLocation(loc) {
    if (!loc || pending) return;
    setEditLoc(loc);
    setEditForm({
      binCode: loc.binCode || loc.code || "",
      maxVolume:
        loc.maxVolume != null
          ? String(loc.maxVolume)
          : loc.capacity != null
            ? String(loc.capacity)
            : "",
      maxWeight: loc.maxWeight != null ? String(loc.maxWeight) : "",
    });
    setError("");
  }

  function openEditFromCell(cell) {
    const loc = cell?.binId ? locationByBinId.get(cell.binId) : null;
    if (!loc) {
      setError("Không tìm thấy bin để sửa.");
      return;
    }
    openEditLocation(loc);
  }

  function closeEditModal() {
    setEditLoc(null);
    setEditForm({ binCode: "", maxVolume: "", maxWeight: "" });
  }

  async function handleSaveEditLocation(event) {
    event.preventDefault();
    if (!editLoc || pending) return;
    const binCode = editForm.binCode.trim();
    if (!binCode) {
      setError("Nhập mã bin.");
      return;
    }

    const capacity =
      editForm.maxVolume === "" || editForm.maxVolume == null
        ? null
        : Number(editForm.maxVolume);
    const maxWeight =
      editForm.maxWeight === "" || editForm.maxWeight == null
        ? null
        : Number(editForm.maxWeight);

    const updated = {
      ...editLoc,
      binCode,
      code: binCode,
      name: binCode,
      maxVolume: Number.isFinite(capacity) ? capacity : null,
      capacity: Number.isFinite(capacity) ? capacity : null,
      maxWeight: Number.isFinite(maxWeight) ? maxWeight : null,
    };

    const binId = updated.binId || updated.id;
    setLocations((prev) =>
      prev.map((entry) => ((entry.binId || entry.id) === binId ? updated : entry))
    );
    setDraftCells((prev) =>
      prev.map((cell) =>
        cell.binId === binId ? { ...cell, displayLabel: binCode } : cell
      )
    );
    setMessage(`Đã sửa ${binCode} (bản nháp). Nhớ Lưu sơ đồ.`);
    closeEditModal();
  }

  function removeLocationLocal(loc) {
    const binId = loc.binId || loc.id;
    setLocations((prev) => prev.filter((entry) => (entry.binId || entry.id) !== binId));
    setDraftCells((prev) => prev.filter((cell) => cell.binId !== binId));
    if (editLoc && (editLoc.binId || editLoc.id) === binId) closeEditModal();
  }

  function handleDeleteLocation(loc, { confirm: needConfirm = true } = {}) {
    if (!loc || pending) return false;
    const label = loc.binCode || loc.code || loc.name || "bin";
    const binId = loc.binId || loc.id;
    const onMap = workingCells.some((cell) => cell.binId === binId);
    if (needConfirm) {
      const ok = window.confirm(
        onMap
          ? `Xóa bin "${label}" khỏi bản nháp? (Lưu sơ đồ mới ghi lên server)`
          : `Xóa bin "${label}" khỏi bản nháp?`
      );
      if (!ok) return false;
    }

    setError("");
    removeLocationLocal(loc);
    if (needConfirm) setMessage(`Đã xóa ${label} (bản nháp). Nhớ Lưu sơ đồ.`);
    return true;
  }

  function locationsInZone(zoneName) {
    return locations.filter((loc) => (loc.zoneName || loc.zoneCode) === zoneName);
  }

  function locationsInShelf(zoneName, shelfCode) {
    return locations.filter(
      (loc) => (loc.zoneName || loc.zoneCode) === zoneName && loc.shelfCode === shelfCode
    );
  }

  function openEditGroup(type, name) {
    setEditGroup({ type, name });
    setEditGroupName(name);
    setError("");
  }

  function closeEditGroup() {
    setEditGroup(null);
    setEditGroupName("");
  }

  function handleSaveEditGroup(event) {
    event.preventDefault();
    if (!editGroup || pending) return;
    const nextName = editGroupName.trim();
    if (!nextName) {
      setError(editGroup.type === "zone" ? "Nhập tên zone." : "Nhập mã shelf.");
      return;
    }
    if (nextName === editGroup.name) {
      closeEditGroup();
      return;
    }

    setError("");
    if (editGroup.type === "zone") {
      setLocations((prev) =>
        prev.map((loc) =>
          (loc.zoneName || loc.zoneCode) === editGroup.name
            ? {
                ...loc,
                zoneName: nextName,
                zoneCode: nextName.slice(0, 8).toUpperCase(),
              }
            : loc
        )
      );
      setDraftCells((prev) =>
        prev.map((cell) =>
          cell.zoneName === editGroup.name ? { ...cell, zoneName: nextName } : cell
        )
      );
      setExtraZones((prev) => [
        ...new Set(prev.map((name) => (name === editGroup.name ? nextName : name))),
      ]);
      setExtraShelves((prev) =>
        prev.map((entry) =>
          entry.zone === editGroup.name ? { ...entry, zone: nextName } : entry
        )
      );
      if (activeZone === editGroup.name) setActiveZone(nextName);
      setMessage(`Đã đổi zone "${editGroup.name}" → "${nextName}" (bản nháp). Nhớ Lưu sơ đồ.`);
    } else {
      const zoneName = activeZone;
      if (!zoneName) {
        setError("Chọn Zone trước khi sửa shelf.");
        return;
      }
      setLocations((prev) =>
        prev.map((loc) =>
          (loc.zoneName || loc.zoneCode) === zoneName && loc.shelfCode === editGroup.name
            ? { ...loc, shelfCode: nextName }
            : loc
        )
      );
      setDraftCells((prev) =>
        prev.map((cell) =>
          cell.zoneName === zoneName && cell.shelfCode === editGroup.name
            ? { ...cell, shelfCode: nextName }
            : cell
        )
      );
      setExtraShelves((prev) => {
        const mapped = prev.map((entry) =>
          entry.zone === zoneName && entry.shelf === editGroup.name
            ? { zone: zoneName, shelf: nextName }
            : entry
        );
        return mapped.filter(
          (entry, index, arr) =>
            arr.findIndex((x) => x.zone === entry.zone && x.shelf === entry.shelf) === index
        );
      });
      if (activeShelf === editGroup.name) setActiveShelf(nextName);
      setMessage(`Đã đổi shelf "${editGroup.name}" → "${nextName}" (bản nháp). Nhớ Lưu sơ đồ.`);
    }
    closeEditGroup();
  }

  function handleDeleteZone(zoneName) {
    if (!zoneName || pending) return;
    const locs = locationsInZone(zoneName);
    const ok = window.confirm(
      locs.length
        ? `Xóa zone "${zoneName}" và ${locs.length} bin (bản nháp)?`
        : `Xóa zone "${zoneName}" khỏi danh sách?`
    );
    if (!ok) return;

    setError("");
    for (const loc of locs) {
      removeLocationLocal(loc);
    }
    setExtraZones((prev) => prev.filter((name) => name !== zoneName));
    setExtraShelves((prev) => prev.filter((entry) => entry.zone !== zoneName));
    if (activeZone === zoneName) {
      setActiveZone("");
      setActiveShelf("");
    }
    if (editGroup?.type === "zone" && editGroup.name === zoneName) closeEditGroup();
    setMessage(`Đã xóa zone "${zoneName}" (bản nháp). Nhớ Lưu sơ đồ.`);
  }

  function handleDeleteShelf(shelfCode) {
    if (!shelfCode || !activeZone || pending) return;
    const locs = locationsInShelf(activeZone, shelfCode);
    const ok = window.confirm(
      locs.length
        ? `Xóa shelf "${shelfCode}" và ${locs.length} bin (bản nháp)?`
        : `Xóa shelf "${shelfCode}" khỏi danh sách?`
    );
    if (!ok) return;

    setError("");
    for (const loc of locs) {
      removeLocationLocal(loc);
    }
    setExtraShelves((prev) =>
      prev.filter((entry) => !(entry.zone === activeZone && entry.shelf === shelfCode))
    );
    if (activeShelf === shelfCode) setActiveShelf("");
    if (editGroup?.type === "shelf" && editGroup.name === shelfCode) closeEditGroup();
    setMessage(`Đã xóa shelf "${shelfCode}" (bản nháp). Nhớ Lưu sơ đồ.`);
  }

  function handleDropOnSlot(event, rowIndex, columnIndex, occupied) {
    event.preventDefault();
    setDragOverKey(null);
    if (!isEdit || pending || occupied) return;

    const payload = readDragPayload(event);
    if (!payload) return;

    if (payload.type === "new-bin") {
      createNewBinAt(rowIndex, columnIndex);
      return;
    }

    if (payload.type === "bin" && payload.binId) {
      placeBinAt(payload.binId, rowIndex, columnIndex);
      return;
    }

    if (payload.type === "cell" && payload.cellId) {
      const cell = draftCells.find((entry) => entry.id === payload.cellId);
      if (!cell) {
        setError("Không tìm thấy ô đang kéo.");
        return;
      }
      moveCellTo(cell, rowIndex, columnIndex);
    }
  }

  function handleDropUnplace(event) {
    event.preventDefault();
    setUnplaceHot(false);
    if (!isEdit || pending) return;

    const payload = readDragPayload(event);
    if (!payload || payload.type !== "cell" || !payload.cellId) return;

    const cell = draftCells.find((entry) => entry.id === payload.cellId);
    if (!cell) return;
    handleDeleteCell(cell, { confirm: false });
  }

  async function handleSaveLayout() {
    if (!warehouseId || !isEdit || pending || !isDirty) return;
    setPending(true);
    setError("");
    setMessage("");

    try {
      const workingLocIds = new Set(locations.map((loc) => loc.id));
      const toDeleteLocs = savedLocations.filter(
        (loc) => !isDraftLocId(loc.id) && !workingLocIds.has(loc.id)
      );

      for (const loc of toDeleteLocs) {
        const binId = loc.binId || loc.id;
        const layoutToClear = cells.filter(
          (cell) => cell.binId === binId && !isDraftCellId(cell.id)
        );
        for (const cell of layoutToClear) {
          await warehouseService.deleteWarehouseLayoutCell(warehouseId, cell.id);
        }
        await warehouseService.deleteWarehouseLocation(loc.id);
      }

      const binIdMap = new Map();
      const toCreateLocs = locations.filter((loc) => isDraftLocId(loc.id));
      for (const loc of toCreateLocs) {
        const response = await warehouseService.createStorageLocation(warehouseId, {
          zoneName: loc.zoneName || loc.zoneCode,
          shelfCode: loc.shelfCode,
          binCode: loc.binCode || loc.code,
          maxVolume: loc.maxVolume ?? loc.capacity ?? "",
          maxWeight: loc.maxWeight ?? "",
          isActive: true,
        });
        const created = response.location;
        if (!created) throw new Error("API không trả về vị trí vừa tạo.");
        const realBinId = created.binId || created.id;
        binIdMap.set(loc.id, {
          binId: realBinId,
          zoneId: created.zoneId ?? null,
          shelfId: created.shelfId ?? null,
        });
      }

      for (const loc of locations) {
        if (isDraftLocId(loc.id)) continue;
        const saved = savedLocations.find((entry) => entry.id === loc.id);
        if (!saved) continue;
        if (locationFingerprint([saved]) === locationFingerprint([loc])) continue;
        const binCode = loc.binCode || loc.code;
        await warehouseService.updateWarehouseLocation(loc.id, {
          locationType: loc.locationType || "BIN",
          code: binCode,
          name: binCode,
          parentId: loc.parentId || loc.shelfId || null,
          capacity: loc.maxVolume ?? loc.capacity ?? null,
          isActive: loc.isActive !== false,
          zoneName: loc.zoneName || loc.zoneCode,
          shelfCode: loc.shelfCode,
          binCode,
          maxVolume: loc.maxVolume ?? loc.capacity ?? null,
          maxWeight: loc.maxWeight ?? null,
        });
      }

      const resolvedDraftCells = draftCells.map((cell) => {
        const mapped = binIdMap.get(cell.binId);
        if (!mapped) return cell;
        return {
          ...cell,
          binId: mapped.binId,
          zoneId: mapped.zoneId ?? cell.zoneId,
          shelfId: mapped.shelfId ?? cell.shelfId,
        };
      });

      // Sau khi xóa location, một số layout cell trên server đã mất — lấy layout còn lại.
      const layoutAfterLocDeletes = cells.filter((cell) => {
        const stillExists = !toDeleteLocs.some(
          (loc) => (loc.binId || loc.id) === cell.binId
        );
        return stillExists;
      });

      const savedById = new Map(layoutAfterLocDeletes.map((cell) => [cell.id, cell]));
      const draftById = new Map(
        resolvedDraftCells
          .filter((cell) => !isDraftCellId(cell.id))
          .map((cell) => [cell.id, cell])
      );

      const toDelete = layoutAfterLocDeletes.filter((cell) => !draftById.has(cell.id));
      const toCreate = resolvedDraftCells.filter((cell) => isDraftCellId(cell.id));
      const toUpdate = resolvedDraftCells.filter((cell) => {
        if (isDraftCellId(cell.id)) return false;
        const saved = savedById.get(cell.id);
        if (!saved) return false;
        return (
          saved.rowIndex !== cell.rowIndex ||
          saved.columnIndex !== cell.columnIndex ||
          saved.displayLabel !== cell.displayLabel ||
          saved.binId !== cell.binId
        );
      });

      for (const cell of toDelete) {
        await warehouseService.deleteWarehouseLayoutCell(warehouseId, cell.id);
      }
      for (const cell of toUpdate) {
        await warehouseService.updateWarehouseLayoutCell(warehouseId, cell.id, {
          zoneId: cell.zoneId,
          shelfId: cell.shelfId,
          binId: cell.binId,
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          displayLabel: cell.displayLabel,
          layoutType: cell.layoutType || "BIN",
          status: cell.status || "ACTIVE",
          width: cell.width,
          height: cell.height,
          colorCode: cell.colorCode,
        });
      }
      for (const cell of toCreate) {
        await warehouseService.createWarehouseLayoutCell(warehouseId, {
          zoneId: cell.zoneId,
          shelfId: cell.shelfId,
          binId: cell.binId,
          rowIndex: cell.rowIndex,
          columnIndex: cell.columnIndex,
          displayLabel: cell.displayLabel,
          layoutType: cell.layoutType || "BIN",
          status: "ACTIVE",
        });
      }

      await refreshBoard();
      setMessage("Đã lưu sơ đồ và vị trí kho.");
    } catch (err) {
      setError(getErrorMessage(err));
      try {
        await refreshBoard();
      } catch {
        // giữ draft nếu reload cũng fail
      }
    } finally {
      setPending(false);
    }
  }

  function onDragEnd() {
    setDraggingKind(null);
    setDragOverKey(null);
    setUnplaceHot(false);
  }

  function renderFloorPlan() {
    const cols = board.cols;
    const rows = board.rows;

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-surface border border-border-muted" />
            Lối đi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-success" />
            Bin trống
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-warning-text" />
            Đang chứa
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-danger" />
            Gần đầy / có tồn
          </span>
          {zoneLegend.map((zone) => (
            <span
              key={zone.key}
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold ${zone.tone.chip}`}
            >
              {zone.label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border-2 border-ink/25 bg-surface-muted/40 p-3 dark:border-border">
          <div className="mb-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-secondary/40 bg-info-bg/50 px-3 py-2 text-xs font-bold text-ink">
            <Icon icon="lucide:arrow-down-to-line" className="w-4 h-4 shrink-0" />
            Cửa nhận hàng · Inbound
          </div>

          <div
            className="inline-grid min-w-full gap-1"
            style={{
              gridTemplateColumns: `2rem repeat(${cols}, minmax(3.75rem, 1fr))`,
            }}
          >
            <div />
            {Array.from({ length: cols }, (_, colIndex) => (
              <div
                key={`h-${colIndex}`}
                className="pb-1 text-center text-[10px] font-bold tracking-wide text-muted"
              >
                {colLabel(colIndex)}
              </div>
            ))}

            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={`r-${rowIndex}`} className="contents">
                <div className="flex items-center justify-center text-[10px] font-bold text-muted">
                  {rowIndex + 1}
                </div>
                {Array.from({ length: cols }, (_, colIndex) => {
                  const slotKey = `${rowIndex}:${colIndex}`;
                  const cell = cellByKey.get(slotKey) || null;
                  const isDropTarget = isEdit && !cell && dragOverKey === slotKey;
                  const level = fillLevel(cell);
                  const zoneKey = cell ? cell.zoneId || cell.zoneName || "_" : null;
                  const zoneTone = zoneKey ? zoneToneById.get(zoneKey) : null;
                  const aisleHint = !cell && colIndex % 3 === 1;

                  return (
                    <div
                      key={slotKey}
                      onDragOver={(event) => {
                        if (!isEdit || cell || !draggingKind) return;
                        event.preventDefault();
                        event.dataTransfer.dropEffect =
                          draggingKind === "cell" ? "move" : "copy";
                        setDragOverKey(slotKey);
                      }}
                      onDragLeave={() => {
                        setDragOverKey((current) => (current === slotKey ? null : current));
                      }}
                      onDrop={(event) =>
                        handleDropOnSlot(event, rowIndex, colIndex, Boolean(cell))
                      }
                      className={`relative min-h-17 overflow-hidden rounded-md border px-1.5 py-1.5 text-left transition-all ${
                        cell
                          ? `${zoneTone?.rack || "border-border-muted bg-surface-elevated text-ink"}`
                          : aisleHint
                            ? "border-transparent bg-surface-soft"
                            : "border-border-muted/60 bg-surface/80"
                      } ${
                        isDropTarget
                          ? "ring-2 ring-secondary border-secondary scale-[1.02] z-1"
                          : ""
                      } ${
                        isEdit && cell
                          ? "cursor-grab active:cursor-grabbing"
                          : isEdit && !cell && draggingKind
                            ? "cursor-copy"
                            : "cursor-default"
                      }`}
                      title={
                        cell
                          ? [
                              cell.displayLabel,
                              cell.zoneName,
                              cell.shelfCode,
                              `${colLabel(colIndex)}${rowIndex + 1}`,
                            ]
                              .filter(Boolean)
                              .join(" · ")
                          : isEdit
                            ? `Thả bin tại ${colLabel(colIndex)}${rowIndex + 1}`
                            : `Lối đi ${colLabel(colIndex)}${rowIndex + 1}`
                      }
                      {...(isEdit && cell
                        ? {
                            draggable: !pending,
                            onDragStart: (event) => {
                              const payload = {
                                kind: "cell",
                                cellId: cell.id,
                                label: cell.displayLabel,
                              };
                              event.dataTransfer.setData(
                                DRAG_CELL,
                                JSON.stringify(payload)
                              );
                              event.dataTransfer.setData(
                                "text/plain",
                                JSON.stringify(payload)
                              );
                              event.dataTransfer.effectAllowed = "move";
                              setDraggingKind("cell");
                            },
                            onDragEnd,
                          }
                        : {})}
                    >
                      {cell ? (
                        <div className="flex h-full flex-col gap-0.5">
                          <p className="text-[10px] font-black leading-tight tracking-tight">
                            {cell.displayLabel}
                          </p>
                          <p className="text-[9px] opacity-75 leading-tight">
                            {cell.zoneName || "Zone"}
                            {cell.shelfCode ? ` · ${cell.shelfCode}` : ""}
                          </p>
                          <p className="text-[9px] font-semibold opacity-60">
                            {colLabel(colIndex)}
                            {rowIndex + 1}
                          </p>
                          <div className="mt-auto h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                            <div
                              className={`h-full rounded-full ${fillBarClass(level)}`}
                              style={{
                                width: `${Math.max(
                                  8,
                                  Math.round(Number(cell.fillRatio ?? 0) * 100)
                                )}%`,
                              }}
                            />
                          </div>
                          {isEdit ? (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <button
                                type="button"
                                disabled={pending}
                                title="Sửa"
                                aria-label="Sửa"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEditFromCell(cell);
                                }}
                                className="p-0.5 rounded opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-40"
                              >
                                <Icon icon="lucide:pencil" className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={pending}
                                title="Gỡ khỏi sơ đồ"
                                aria-label="Gỡ khỏi sơ đồ"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDeleteCell(cell);
                                }}
                                className="p-0.5 rounded opacity-80 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/15 disabled:opacity-40"
                              >
                                <Icon icon="lucide:map-pin-off" className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={pending}
                                title="Xóa bin"
                                aria-label="Xóa bin"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  const loc = cell.binId
                                    ? locationByBinId.get(cell.binId)
                                    : null;
                                  if (loc) handleDeleteLocation(loc);
                                  else setError("Không tìm thấy bin để xóa.");
                                }}
                                className="p-0.5 rounded text-danger opacity-80 hover:opacity-100 hover:bg-danger/15 disabled:opacity-40"
                              >
                                <Icon icon="lucide:trash-2" className="w-3 h-3" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-[9px] font-medium text-muted/80">
                          {isDropTarget
                            ? "Thả bin"
                            : `${colLabel(colIndex)}${rowIndex + 1}`}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-primary/40 bg-surface-tint px-3 py-2 text-xs font-bold text-ink">
            <Icon icon="lucide:arrow-up-from-line" className="w-4 h-4 shrink-0" />
            Cửa xuất hàng · Outbound
          </div>
        </div>
      </div>
    );
  }

  return (
    <OperationsShell activeNav="warehouse-layout">
      <div className={`space-y-5 ${isEdit ? "pb-44" : ""}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Phân bố vị trí kho
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed max-w-2xl">
              {isEdit
                ? "Chọn Zone/Shelf, kéo/sửa/xóa trên bản nháp — Lưu sơ đồ khi xong."
                : "Xem mặt bằng đã lưu. Bật Chỉnh sửa để thêm/kéo thả vị trí."}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Chế độ sơ đồ kho"
            className="inline-flex shrink-0 rounded-lg border border-border-muted bg-surface-muted p-1"
          >
            {[
              { id: "view", label: "Xem", icon: "lucide:eye", disabled: false },
              {
                id: "edit",
                label: "Chỉnh sửa",
                icon: "lucide:pencil",
                disabled: !warehouseId,
              },
            ].map((tab) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={tab.disabled}
                  onClick={() => switchMode(tab.id)}
                  className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    active
                      ? "bg-secondary text-on-solid shadow-sm"
                      : "bg-transparent text-muted hover:text-ink"
                  }`}
                >
                  <Icon icon={tab.icon} className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
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
            Kho
          </label>
          <select
            id="warehouseId"
            value={warehouseId}
            onChange={(event) => {
              if (isDirty) {
                const ok = window.confirm(
                  "Có thay đổi chưa lưu. Đổi kho sẽ hủy bản nháp?"
                );
                if (!ok) return;
              }
              setWarehouseId(event.target.value);
              setMode("view");
              setMessage("");
              setError("");
            }}
            disabled={isLoading}
            className="mt-2 w-full max-w-md h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
          >
            <option value="">— Chọn kho —</option>
            {warehouses.map((warehouse) => {
              const typeLabel = warehouseService.formatWarehouseType(
                warehouse.warehouseType
              );
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
            <p className="text-sm text-muted mt-2">
              Chưa có kho active. Nhờ Admin tạo kho trước.
            </p>
          ) : null}
        </div>

        {warehouseId ? (
          <section className="bg-surface-elevated rounded-xl border border-border-muted p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">Mặt bằng kho</h2>
                <p className="text-xs text-muted mt-1">
                  {isEdit
                    ? isDirty
                      ? "Bản nháp chưa lưu — kéo Bin mới / bin chờ gắn lên ô trống."
                      : "Chọn Zone/Shelf rồi kéo Bin mới lên từng ô trống."
                    : "Luồng: nhận hàng → khu lưu trữ → xuất hàng."}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted">
                {isDirty ? (
                  <span className="rounded-full border border-warning/40 bg-warning-bg/50 px-2 py-0.5 font-semibold text-warning-text">
                    Chưa lưu
                  </span>
                ) : null}
                <span>
                  {workingCells.length} trên sơ đồ · {bins.length} chờ gắn · {zoneLegend.length}{" "}
                  zone
                </span>
                {isBoardLoading || pending ? (
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                ) : null}
              </div>
            </div>
            {renderFloorPlan()}
            {!isEdit && cells.length === 0 && !isBoardLoading ? (
              <p className="text-sm text-muted">
                Chưa có kệ trên mặt bằng. Bấm{" "}
                <span className="font-semibold text-ink">Chỉnh sửa</span> rồi kéo Bin mới lên ô
                trống.
              </p>
            ) : null}
          </section>
        ) : null}
      </div>

      {isEdit && warehouseId ? (
        <div
          onDragOver={(event) => {
            if (draggingKind !== "cell") return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setUnplaceHot(true);
          }}
          onDragLeave={() => setUnplaceHot(false)}
          onDrop={handleDropUnplace}
          className={`fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.18)] ${
            unplaceHot ? "ring-2 ring-inset ring-danger" : ""
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 py-3 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-muted shrink-0 w-10">Zone:</span>
              {existingZones.map((name) => {
                const active = activeZone === name;
                return (
                  <div
                    key={name}
                    className={`inline-flex items-center gap-0.5 rounded-full border pl-2.5 pr-1 h-7 ${
                      active
                        ? "bg-secondary text-on-solid border-secondary"
                        : "bg-surface-elevated text-ink border-border-muted"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (active) {
                          setActiveZone("");
                          setActiveShelf("");
                          setAddingShelf(false);
                          setNewShelfInput("");
                          return;
                        }
                        setActiveZone(name);
                        setActiveShelf("");
                        setAddingShelf(false);
                        setNewShelfInput("");
                      }}
                      className="text-[11px] font-semibold disabled:opacity-50"
                      title={active ? "Bấm lại để bỏ chọn" : "Chọn zone"}
                    >
                      {name}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      title="Sửa zone"
                      onClick={() => openEditGroup("zone", name)}
                      className={`p-0.5 rounded-full ${
                        active ? "hover:bg-white/15" : "hover:bg-surface-muted text-muted"
                      }`}
                    >
                      <Icon icon="lucide:pencil" className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      title="Xóa zone"
                      onClick={() => handleDeleteZone(name)}
                      className={`p-0.5 rounded-full ${
                        active ? "hover:bg-white/15" : "hover:bg-danger/10 text-danger"
                      }`}
                    >
                      <Icon icon="lucide:trash-2" className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              {addingZone ? (
                <input
                  autoFocus
                  value={newZoneInput}
                  onChange={(e) => setNewZoneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitNewZone();
                    }
                    if (e.key === "Escape") {
                      setAddingZone(false);
                      setNewZoneInput("");
                    }
                  }}
                  onBlur={commitNewZone}
                  placeholder="Tên zone"
                  className="h-7 w-28 px-2 rounded-md border border-secondary text-[11px] input-focus-ring"
                />
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setAddingZone(true);
                    setNewZoneInput("");
                  }}
                  className="h-7 px-2.5 rounded-full border border-dashed border-secondary/50 text-[11px] font-semibold text-secondary hover:bg-info-bg/40 disabled:opacity-50"
                >
                  + thêm
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-muted shrink-0 w-10">Shelf:</span>
              {!activeZone ? (
                <span className="text-[11px] text-muted">Chọn Zone trước</span>
              ) : (
                <>
                  {shelvesForActiveZone.map((code) => {
                    const active = activeShelf === code;
                    return (
                      <div
                        key={code}
                        className={`inline-flex items-center gap-0.5 rounded-full border pl-2.5 pr-1 h-7 ${
                          active
                            ? "bg-secondary text-on-solid border-secondary"
                            : "bg-surface-elevated text-ink border-border-muted"
                        }`}
                      >
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => setActiveShelf(active ? "" : code)}
                          className="text-[11px] font-semibold disabled:opacity-50"
                          title={active ? "Bấm lại để bỏ chọn" : "Chọn shelf"}
                        >
                          {code}
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          title="Sửa shelf"
                          onClick={() => openEditGroup("shelf", code)}
                          className={`p-0.5 rounded-full ${
                            active ? "hover:bg-white/15" : "hover:bg-surface-muted text-muted"
                          }`}
                        >
                          <Icon icon="lucide:pencil" className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          title="Xóa shelf"
                          onClick={() => handleDeleteShelf(code)}
                          className={`p-0.5 rounded-full ${
                            active ? "hover:bg-white/15" : "hover:bg-danger/10 text-danger"
                          }`}
                        >
                          <Icon icon="lucide:trash-2" className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {addingShelf ? (
                    <input
                      autoFocus
                      value={newShelfInput}
                      onChange={(e) => setNewShelfInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitNewShelf();
                        }
                        if (e.key === "Escape") {
                          setAddingShelf(false);
                          setNewShelfInput("");
                        }
                      }}
                      onBlur={commitNewShelf}
                      placeholder="Mã shelf"
                      className="h-7 w-28 px-2 rounded-md border border-secondary text-[11px] input-focus-ring"
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setAddingShelf(true);
                        setNewShelfInput("");
                      }}
                      className="h-7 px-2.5 rounded-full border border-dashed border-secondary/50 text-[11px] font-semibold text-secondary hover:bg-info-bg/40 disabled:opacity-50"
                    >
                      + thêm
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-ink min-w-0 truncate">
                {draggingKind === "cell"
                  ? "Thả vào đây để gỡ khỏi sơ đồ nháp"
                  : draggingKind === "new-bin"
                    ? "Thả Bin mới lên ô trống trên mặt bằng"
                    : canDragNewBin
                      ? `Kéo Bin mới (${activeZone} · ${activeShelf}) hoặc bin chờ gắn lên mặt bằng`
                      : "Chọn Zone và Shelf, rồi kéo Bin mới lên ô trống"}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {isDirty ? (
                  <span className="text-[11px] font-semibold text-warning-text">Chưa lưu</span>
                ) : (
                  <span className="text-[11px] text-muted">{bins.length} bin</span>
                )}
                <button
                  type="button"
                  disabled={pending || !isDirty}
                  onClick={discardDraft}
                  className="h-8 px-3 rounded-lg border border-border-muted text-xs font-semibold text-muted hover:text-ink disabled:opacity-40"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={pending || !isDirty}
                  onClick={handleSaveLayout}
                  className="h-8 px-3 rounded-lg bg-insight hover:bg-secondary text-on-solid text-xs font-bold disabled:opacity-40 inline-flex items-center gap-1.5"
                >
                  {pending ? (
                    <Icon icon="lucide:loader-2" className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Icon icon="lucide:save" className="w-3.5 h-3.5" />
                  )}
                  Lưu sơ đồ
                </button>
              </div>
            </div>

            <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                draggable={canDragNewBin}
                disabled={!canDragNewBin}
                onDragStart={(event) => {
                  if (!canDragNewBin) {
                    event.preventDefault();
                    return;
                  }
                  const payload = { kind: "new-bin" };
                  event.dataTransfer.setData(DRAG_NEW_BIN, JSON.stringify(payload));
                  event.dataTransfer.setData("text/plain", JSON.stringify(payload));
                  event.dataTransfer.effectAllowed = "copy";
                  setDraggingKind("new-bin");
                }}
                onDragEnd={onDragEnd}
                className={`shrink-0 flex flex-col items-center justify-center gap-1 min-w-20 h-18 rounded-xl border-2 border-dashed text-ink disabled:opacity-40 disabled:cursor-not-allowed ${
                  canDragNewBin
                    ? "border-secondary/50 bg-surface-elevated cursor-grab active:cursor-grabbing hover:border-secondary hover:bg-info-bg/40"
                    : "border-border-muted bg-surface-muted"
                }`}
                title={
                  canDragNewBin
                    ? "Kéo lên ô trống để tạo bin mới"
                    : "Chọn Zone và Shelf trước"
                }
              >
                <Icon icon="lucide:package-plus" className="w-6 h-6 text-secondary" />
                <span className="text-[11px] font-bold">Bin mới</span>
              </button>

              {isBoardLoading ? (
                <p className="self-center text-sm text-muted px-2">Đang tải...</p>
              ) : bins.length === 0 ? (
                <p className="self-center text-sm text-muted px-2">
                  Không có bin chờ gắn — kéo Bin mới lên ô trống.
                </p>
              ) : (
                bins.map((loc) => {
                  const binId = loc.binId || loc.id;
                  return (
                    <div
                      key={loc.id}
                      className="shrink-0 min-w-40 max-w-48 rounded-xl border border-border-muted bg-surface-elevated px-2.5 py-2"
                    >
                      <button
                        type="button"
                        draggable={!pending}
                        disabled={pending}
                        onDragStart={(event) => {
                          const payload = {
                            kind: "bin",
                            binId,
                            label: loc.binCode || loc.code || "BIN",
                          };
                          event.dataTransfer.setData(DRAG_BIN, JSON.stringify(payload));
                          event.dataTransfer.setData("text/plain", JSON.stringify(payload));
                          event.dataTransfer.effectAllowed = "copyMove";
                          setDraggingKind("bin");
                        }}
                        onDragEnd={onDragEnd}
                        className="w-full text-left cursor-grab active:cursor-grabbing disabled:opacity-60"
                        title="Kéo lên mặt bằng"
                      >
                        <p className="text-sm font-bold text-ink truncate">
                          {loc.binCode || loc.code || loc.name}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5 truncate">
                          {loc.zoneName || loc.zoneCode || "Zone?"} · {loc.shelfCode || "Shelf?"}
                        </p>
                        <p className="text-[10px] text-muted truncate">
                          maxV {formatVolume(loc.maxVolume ?? loc.capacity)}
                        </p>
                      </button>
                      <div className="mt-1.5 flex items-center gap-1 border-t border-border-muted pt-1.5">
                        <button
                          type="button"
                          disabled={pending}
                          title="Sửa"
                          aria-label="Sửa"
                          onClick={() => openEditLocation(loc)}
                          className="p-1 rounded-md text-muted hover:bg-surface-muted hover:text-ink disabled:opacity-50"
                        >
                          <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          title="Xóa bin"
                          aria-label="Xóa bin"
                          onClick={() => handleDeleteLocation(loc)}
                          className="p-1 rounded-md text-danger hover:bg-danger/10 disabled:opacity-50"
                        >
                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {editLoc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={closeEditModal}
            aria-label="Đóng"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-bin-title"
            className="relative w-full max-w-md bg-surface rounded-xl border border-border shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted">
              <div>
                <h3 id="edit-bin-title" className="text-lg font-bold text-ink">
                  Sửa bin
                </h3>
                <p className="text-xs text-muted mt-1">
                  {editLoc.zoneName || editLoc.zoneCode || "Zone"} ·{" "}
                  {editLoc.shelfCode || "Shelf"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-2 text-muted hover:text-ink"
                aria-label="Đóng"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditLocation} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-bin-code" className="text-sm font-semibold text-ink">
                  Mã bin <span className="text-danger">*</span>
                </label>
                <input
                  id="edit-bin-code"
                  required
                  autoFocus
                  value={editForm.binCode}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, binCode: e.target.value }))}
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="edit-max-volume" className="text-sm font-semibold text-ink">
                    Max volume
                  </label>
                  <input
                    id="edit-max-volume"
                    type="number"
                    min={0}
                    step="any"
                    value={editForm.maxVolume}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, maxVolume: e.target.value }))
                    }
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-max-weight" className="text-sm font-semibold text-ink">
                    Max weight
                  </label>
                  <input
                    id="edit-max-weight"
                    type="number"
                    min={0}
                    step="any"
                    value={editForm.maxWeight}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, maxWeight: e.target.value }))
                    }
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDeleteLocation(editLoc)}
                  className="h-11 px-4 rounded-lg border border-danger/40 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-60"
                >
                  Xóa bin
                </button>
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="h-11 px-5 rounded-lg border border-border-muted text-sm font-semibold text-muted hover:bg-surface-elevated"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-11 px-5 rounded-lg bg-insight hover:bg-secondary text-on-solid text-sm font-bold disabled:opacity-60"
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
            className="relative w-full max-w-md bg-surface rounded-xl border border-border shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted">
              <h3 id="edit-group-title" className="text-lg font-bold text-ink">
                {editGroup.type === "zone" ? "Sửa zone" : "Sửa shelf"}
              </h3>
              <button
                type="button"
                onClick={closeEditGroup}
                className="p-2 text-muted hover:text-ink"
                aria-label="Đóng"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditGroup} className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-group-name" className="text-sm font-semibold text-ink">
                  {editGroup.type === "zone" ? "Tên zone" : "Mã shelf"}{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  id="edit-group-name"
                  required
                  autoFocus
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
                <p className="text-[11px] text-muted">
                  {editGroup.type === "zone"
                    ? "Đổi trên bản nháp — Lưu sơ đồ mới ghi lên server."
                    : `Đổi trên bản nháp (zone ${activeZone || "—"}). Lưu sơ đồ khi xong.`}
                </p>
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-1">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    editGroup.type === "zone"
                      ? handleDeleteZone(editGroup.name)
                      : handleDeleteShelf(editGroup.name)
                  }
                  className="h-11 px-4 rounded-lg border border-danger/40 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-60"
                >
                  {editGroup.type === "zone" ? "Xóa zone" : "Xóa shelf"}
                </button>
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={closeEditGroup}
                    className="h-11 px-5 rounded-lg border border-border-muted text-sm font-semibold text-muted hover:bg-surface-elevated"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-11 px-5 rounded-lg bg-insight hover:bg-secondary text-on-solid text-sm font-bold disabled:opacity-60"
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
