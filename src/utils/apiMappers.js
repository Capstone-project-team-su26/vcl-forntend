/** Chuẩn hóa response backend VCL → shape FE đang dùng. */

const RESTRICTION_FROM_API = {
  prohibited: "PROHIBITED",
  banned: "PROHIBITED",
  restricted: "RESTRICTED",
  warning: "CONDITIONAL",
  conditional: "CONDITIONAL",
};

const RESTRICTION_TO_API = {
  PROHIBITED: "Prohibited",
  RESTRICTED: "Restricted",
  CONDITIONAL: "Warning",
};

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatUserDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function normalizeConsignmentSummary(item) {
  const orderId = item.orderId ?? item.id;

  return {
    id: orderId,
    consignmentCode: item.consignmentCode || null,
    customerName: item.customerName ?? item.customer?.fullName ?? "—",
    consignmentType:
      item.orderType ?? item.consignmentType ?? item.shippingOption ?? "—",
    status: item.status,
    totalWeight: item.totalWeight,
    totalVolume: item.totalVolume,
    createdAt: item.createdAt,
  };
}

export function normalizeConsignmentListResponse(raw, { page = 1, pageSize = 10 } = {}) {
  const data = raw?.data ?? raw;
  const items = (data?.items ?? []).map(normalizeConsignmentSummary);

  const totalCount = data?.totalCount ?? items.length;
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return {
    items,
    page: data?.pageNumber ?? page,
    pageSize: data?.pageSize ?? pageSize,
    totalCount,
    totalPages: totalCount === 0 ? 1 : totalPages,
  };
}

export function normalizeConsignmentDetail(raw) {
  const item = raw?.data ?? raw;
  const firstItem = item.items?.[0];

  return {
    id: item.orderId ?? item.id,
    consignmentCode: item.consignmentCode ?? null,
    customerName: item.customer?.fullName ?? item.customerName ?? "—",
    consignmentType:
      item.orderType ?? item.consignmentType ?? item.shippingOption ?? "—",
    status: item.status,
    createdAt: item.createdAt,
    productName: firstItem?.productName,
    quantity: firstItem?.quantity,
    destination: item.shippingOption ?? item.destination,
    notes: item.note ?? item.notes,
    trackingCode: item.consignmentCode ?? item.trackingCode,
    rejectionReason: item.rejectionReason,
    items: item.items,
    quotation: item.quotation,
  };
}

export function normalizeConsignmentStatusUpdate(raw) {
  return {
    message: raw.message,
    status: raw.status,
    trackingCode: raw.consignmentCode ?? raw.trackingCode ?? raw.shipmentCode,
    rejectionReason: raw.rejectionReason,
    consignment: raw.consignment
      ? normalizeConsignmentDetail(raw.consignment)
      : undefined,
  };
}

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
    message: raw?.message ?? "Tạo phiếu tiếp nhận kho thành công.",
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

export function normalizeRestrictedItemFromApi(item) {
  const typeKey = String(item.restrictionType || "").toLowerCase();

  return {
    id: item.id,
    name: item.itemName ?? item.name,
    country: item.country ?? null,
    restrictionType: RESTRICTION_FROM_API[typeKey] ?? item.restrictionType,
    notes: item.note ?? item.notes ?? "",
    isActive: item.isActive !== false,
  };
}

export function toApiRestrictedItemPayload(payload) {
  const restrictionType =
    RESTRICTION_TO_API[payload.restrictionType] ?? payload.restrictionType;

  return {
    itemName: payload.name?.trim(),
    country: payload.country?.trim() || null,
    restrictionType,
    note: payload.notes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export function normalizePricingRuleFromApi(item) {
  return {
    id: item.id,
    shippingServiceType: item.shippingServiceType,
    consignmentType: item.consignmentType,
    route: item.route ?? null,
    billingUnit: item.unitType ?? item.billingUnit,
    pricePerKg: item.pricePerWeight ?? item.pricePerKg ?? null,
    pricePerCbm: item.pricePerVolume ?? item.pricePerCbm ?? null,
    serviceFee: item.serviceFee ?? 0,
    isActive: item.isActive !== false,
  };
}

export function toApiPricingRulePayload(data) {
  return {
    shippingServiceType: data.shippingServiceType,
    consignmentType: data.consignmentType,
    route: data.route,
    unitType: data.billingUnit,
    pricePerWeight: data.pricePerKg ?? 0,
    pricePerVolume: data.pricePerCbm ?? null,
    serviceFee: data.serviceFee ?? 0,
    isActive: data.isActive !== false,
  };
}

export function normalizeUserFromApi(user) {
  const status = String(user.status || "Active").toUpperCase();
  const name = user.fullName ?? user.name ?? "—";

  return {
    id: user.id,
    name,
    email: user.email,
    role: user.role,
    status: status === "LOCKED" ? "LOCKED" : "ACTIVE",
    lastSeen: user.lastSeen ?? formatUserDate(user.createdAt),
    avatar: getInitials(name),
  };
}

export function normalizeCustomerFromApi(item) {
  const id = item.id ?? item.customerId;

  return {
    id,
    customerCode: item.customerCode ?? item.code ?? id,
    fullName: item.fullName ?? item.name ?? "—",
    email: item.email ?? null,
    phone: item.phone ?? item.phoneNumber ?? null,
    address: item.address ?? null,
    companyName: item.companyName ?? item.company ?? null,
    taxId: item.taxId ?? item.taxCode ?? null,
    status: String(item.status ?? "ACTIVE").toUpperCase(),
  };
}

export function toApiCustomerPayload(payload) {
  return {
    fullName: payload.fullName?.trim(),
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim(),
    address: payload.address?.trim() || null,
    companyName: payload.companyName?.trim() || null,
    taxId: payload.taxId?.trim() || null,
    status: payload.status || "ACTIVE",
  };
}

export function normalizeCustomerListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeCustomerFromApi);
}

export function normalizeShippingMethodFromApi(item) {
  const services = item.additionalServices ?? item.extraServices ?? [];

  return {
    id: item.id ?? item.shippingMethodId,
    code: item.code ?? item.shippingServiceType ?? item.methodCode,
    name: item.name ?? item.shippingMethodName ?? item.title ?? "—",
    description: item.description ?? item.desc ?? null,
    isActive: item.isActive !== false,
    additionalServices: services.map((service) => ({
      id: service.id ?? service.serviceId,
      name: service.name ?? service.serviceName ?? "—",
      description: service.description ?? service.desc ?? null,
    })),
  };
}

export function normalizeShippingMethodListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeShippingMethodFromApi);
}

const VALIDATION_RESTRICTION_FROM_API = {
  banned: "BANNED",
  prohibited: "BANNED",
  restricted: "RESTRICTED",
  warning: "CONDITIONAL",
  conditional: "CONDITIONAL",
};

export function normalizeValidateItemsResponse(raw) {
  const data = raw?.data ?? raw;
  const items = (data?.items ?? data?.results ?? []).map((entry) => {
    const typeKey = String(entry.restrictionType ?? entry.status ?? "").toLowerCase();

    return {
      productName: entry.productName ?? entry.itemName ?? "",
      restrictionType:
        VALIDATION_RESTRICTION_FROM_API[typeKey] ?? entry.restrictionType ?? null,
      matchedItemName: entry.matchedItemName ?? entry.restrictedItemName ?? null,
      message: entry.message ?? entry.note ?? null,
    };
  });

  const hasBanned =
    data?.hasBanned === true ||
    items.some((item) => item.restrictionType === "BANNED");

  return { items, hasBanned };
}

export function toApiValidateItemsPayload({ items }) {
  return {
    items: items.map((item) => ({
      productName: item.productName?.trim(),
      productType: item.productType?.trim() || null,
      quantity: Number(item.quantity) || 1,
      estimatedSize: item.estimatedSize?.trim() || null,
      estimatedWeight:
        item.estimatedWeight === "" || item.estimatedWeight == null
          ? null
          : Number(item.estimatedWeight),
      declaredValue:
        item.declaredValue === "" || item.declaredValue == null
          ? null
          : Number(item.declaredValue),
    })),
  };
}

export function toApiStaffConsignmentPayload(payload) {
  return {
    customerId: payload.customerId,
    shippingMethodId: payload.shippingMethodId,
    additionalServiceIds: payload.additionalServiceIds?.length
      ? payload.additionalServiceIds
      : null,
    salesNote: payload.salesNote?.trim() || null,
    items: payload.items.map((item) => ({
      productName: item.productName?.trim(),
      productType: item.productType?.trim() || null,
      quantity: Number(item.quantity) || 1,
      estimatedSize: item.estimatedSize?.trim() || null,
      estimatedWeight:
        item.estimatedWeight === "" || item.estimatedWeight == null
          ? null
          : Number(item.estimatedWeight),
      declaredValue:
        item.declaredValue === "" || item.declaredValue == null
          ? null
          : Number(item.declaredValue),
    })),
  };
}

export function normalizeStaffConsignmentCreateResponse(raw) {
  const data = raw?.data ?? raw;

  return {
    message: raw?.message ?? "Tạo yêu cầu ký gửi thành công.",
    orderId: data?.orderId ?? data?.id ?? null,
    consignmentCode:
      data?.consignmentCode ?? data?.orderCode ?? data?.trackingCode ?? null,
  };
}
