export function normalizeWarehouseFromApi(item) {
  return {
    id: item.id ?? item.warehouseId,
    name: item.name ?? item.warehouseName ?? "—",
    code: item.code ?? item.warehouseCode ?? null,
    address: item.address ?? null,
    warehouseType: item.warehouseType ?? item.type ?? null,
    isActive: item.isActive !== false,
  };
}

export function normalizeWarehouseListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeWarehouseFromApi);
}

export function toApiWarehousePayload(payload) {
  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    address: payload.address?.trim() || null,
    warehouseType: payload.warehouseType || null,
    isActive: payload.isActive !== false,
  };
}

export function normalizeWarehouseLocationFromApi(item) {
  return {
    id: item.id ?? item.locationId,
    warehouseId: item.warehouseId,
    locationType: item.locationType ?? item.type,
    code: item.code ?? item.locationCode ?? null,
    name: item.name ?? item.locationName ?? "—",
    parentId: item.parentId ?? item.parentLocationId ?? null,
    capacity:
      item.capacity === "" || item.capacity == null ? null : Number(item.capacity),
    isActive: item.isActive !== false,
  };
}

export function normalizeWarehouseLocationListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeWarehouseLocationFromApi);
}

export function toApiWarehouseLocationPayload(payload) {
  return {
    locationType: payload.locationType,
    code: payload.code?.trim(),
    name: payload.name?.trim(),
    parentId: payload.parentId || null,
    capacity:
      payload.capacity === "" || payload.capacity == null
        ? null
        : Number(payload.capacity),
    isActive: payload.isActive !== false,
  };
}

export function normalizeReceivingNoteFromApi(raw) {
  const item = raw?.data ?? raw;
  if (!item || (!item.id && !item.receivingNoteId && !item.receivingNoteCode)) {
    return null;
  }

  return {
    id: item.id ?? item.receivingNoteId,
    receivingNoteCode: item.receivingNoteCode ?? item.code ?? item.noteCode,
    consignmentOrderId: item.consignmentOrderId ?? item.orderId,
    warehouseId: item.warehouseId,
    warehouseName: item.warehouseName ?? item.warehouse?.name,
    warehouseNote: item.warehouseNote ?? item.note ?? "",
    status: item.status,
    createdAt: item.createdAt,
  };
}

export function normalizeReceivingNoteCreateResponse(raw) {
  const note = normalizeReceivingNoteFromApi(raw);
  return {
    message: raw?.message ?? "Gửi phiếu tiếp nhận kho thành công.",
    receivingNote: note,
  };
}

export function toApiReceivingNotePayload({ consignmentOrderId, warehouseId, warehouseNote }) {
  return {
    consignmentOrderId,
    warehouseId,
    warehouseNote: warehouseNote?.trim() || null,
  };
}
