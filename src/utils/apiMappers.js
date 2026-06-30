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
    customerId: item.customerId,
    warehouseId: item.warehouseId,
    warehouseName: item.warehouseName,
    totalWeight: item.totalWeight,
    totalVolume: item.totalVolume,
    packageCount: item.packageCount,
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

export function normalizeServicePricingFromApi(item) {
  return {
    id: item.id,
    carrierId: item.carrierId ?? item.carrier_id ?? "VCL",
    carrierName: item.carrierName ?? item.carrier_name ?? null,
    serviceType: item.serviceType ?? item.service_type,
    originCountry: item.originCountry ?? item.origin_country,
    destinationCountry: item.destinationCountry ?? item.destination_country,
    warehouseId: item.warehouseId ?? item.warehouse_id ?? null,
    unitType: item.unitType ?? item.unit_type,
    price: item.price ?? null,
    pricePerKg: item.pricePerKg ?? item.price_per_kg ?? null,
    pricePerCbm: item.pricePerCbm ?? item.price_per_cbm ?? null,
    currency: item.currency ?? "USD",
    effectiveDate: item.effectiveDate ?? item.effective_date ?? null,
    isActive: item.isActive !== false && item.status !== "INACTIVE",
  };
}

export function toApiServicePricingPayload(data) {
  return {
    carrierId: data.carrierId,
    carrierName: data.carrierName,
    serviceType: data.serviceType,
    originCountry: data.originCountry,
    destinationCountry: data.destinationCountry,
    warehouseId: data.warehouseId,
    unitType: data.unitType,
    price: data.price,
    pricePerKg: data.pricePerKg,
    pricePerCbm: data.pricePerCbm,
    currency: data.currency ?? "USD",
    effectiveDate: data.effectiveDate,
    isActive: data.isActive !== false,
  };
}

export function normalizeEstimateQuotationResponse(raw) {
  const item = raw?.data ?? raw?.quotation ?? raw;

  return {
    quotationId: item.quotationId ?? item.id,
    orderId: item.orderId,
    status: item.status,
    totalWeight: item.totalWeight,
    totalVolume: item.totalVolume,
    volumetricWeight: item.volumetricWeight,
    chargeableWeight: item.chargeableWeight,
    estimatedFreightCharge: item.estimatedFreightCharge ?? item.mainServiceAmount,
    serviceFee: item.serviceFee ?? item.additionalTotal,
    taxAndDuty: item.taxAndDuty ?? 0,
    totalEstimatedCost: item.totalEstimatedCost ?? item.total,
    quotation: item.quotation ?? item,
  };
}

/** @deprecated Dùng normalizeServicePricingFromApi */
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
    estimatedDeliveryTime:
      item.estimatedDeliveryTime ?? item.estimatedTime ?? item.eta ?? null,
    applicableConditions: item.applicableConditions ?? item.conditions ?? null,
    internalNotes: item.internalNotes ?? item.internalNote ?? item.note ?? null,
    isActive: item.isActive !== false,
    additionalServices: services.map((service) => ({
      id: service.id ?? service.serviceId,
      name: service.name ?? service.serviceName ?? "—",
      description: service.description ?? service.desc ?? null,
    })),
  };
}

export function toApiShippingMethodPayload(payload) {
  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    description: payload.description?.trim() || null,
    estimatedDeliveryTime: payload.estimatedDeliveryTime?.trim() || null,
    applicableConditions: payload.applicableConditions?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export function normalizeShippingMethodListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeShippingMethodFromApi);
}

const FEE_CALCULATION_FROM_API = {
  fixed: "FIXED",
  flat: "FIXED",
  percentage: "PERCENTAGE",
  percent: "PERCENTAGE",
};

export function normalizeAdditionalServiceFeeFromApi(item) {
  const typeKey = String(item.feeCalculationType ?? item.calculationType ?? "").toLowerCase();

  return {
    id: item.id ?? item.feeId,
    code: item.code ?? item.feeCode ?? null,
    name: item.name ?? item.feeName ?? "—",
    feeCalculationType:
      FEE_CALCULATION_FROM_API[typeKey] ?? item.feeCalculationType ?? "FIXED",
    fixedAmount:
      item.fixedAmount === "" || item.fixedAmount == null
        ? item.fixedPrice ?? null
        : Number(item.fixedAmount),
    percentageRate:
      item.percentageRate === "" || item.percentageRate == null
        ? item.percentage ?? item.rate ?? null
        : Number(item.percentageRate),
    unit: item.unit ?? item.billingUnit ?? null,
    description: item.description ?? item.notes ?? null,
    isActive: item.isActive !== false,
  };
}

export function normalizeAdditionalServiceFeeListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeAdditionalServiceFeeFromApi);
}

export function toApiAdditionalServiceFeePayload(payload) {
  const feeCalculationType = payload.feeCalculationType || "FIXED";

  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    feeCalculationType,
    fixedAmount:
      feeCalculationType === "FIXED"
        ? payload.fixedAmount === "" || payload.fixedAmount == null
          ? 0
          : Number(payload.fixedAmount)
        : null,
    percentageRate:
      feeCalculationType === "PERCENTAGE"
        ? payload.percentageRate === "" || payload.percentageRate == null
          ? 0
          : Number(payload.percentageRate)
        : null,
    unit: payload.unit?.trim() || null,
    description: payload.description?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

function normalizePurchaseRequestItemFromApi(item) {
  return {
    id: item.id ?? item.itemId,
    productName: item.productName ?? item.name ?? "—",
    productLink: item.productLink ?? item.link ?? item.url ?? null,
    quantity: item.quantity ?? 1,
    attributes: item.attributes ?? item.variant ?? item.productAttributes ?? null,
    unitPrice:
      item.unitPrice === "" || item.unitPrice == null ? null : Number(item.unitPrice),
  };
}

function normalizePurchaseRequestQuotationFromApi(quotation) {
  if (!quotation) return null;

  return {
    purchaseServiceFee: Number(quotation.purchaseServiceFee ?? quotation.serviceFee ?? 0),
    estimatedShippingFee:
      quotation.estimatedShippingFee == null
        ? null
        : Number(quotation.estimatedShippingFee ?? quotation.shippingFee ?? 0),
    totalAmount: Number(quotation.totalAmount ?? quotation.total ?? 0),
    quotationNote: quotation.quotationNote ?? quotation.note ?? null,
    createdAt: quotation.createdAt ?? null,
    items: (quotation.items ?? []).map((entry) => ({
      itemId: entry.itemId ?? entry.id,
      unitPrice: Number(entry.unitPrice ?? 0),
      quantity: entry.quantity ?? 1,
      lineTotal: Number(entry.lineTotal ?? entry.unitPrice * entry.quantity),
    })),
  };
}

function normalizePurchaseRequestPurchaseOrderFromApi(purchaseOrder) {
  if (!purchaseOrder) return null;

  return {
    id: purchaseOrder.id ?? purchaseOrder.purchaseOrderId,
    purchaseOrderCode:
      purchaseOrder.purchaseOrderCode ?? purchaseOrder.code ?? purchaseOrder.id,
    supplier: purchaseOrder.supplier ?? purchaseOrder.supplierName ?? null,
    purchaseNote: purchaseOrder.purchaseNote ?? purchaseOrder.note ?? null,
    status: String(purchaseOrder.status ?? "CREATED").toUpperCase(),
    processingNote: purchaseOrder.processingNote ?? purchaseOrder.statusNote ?? null,
    createdAt: purchaseOrder.createdAt ?? null,
  };
}

function normalizePurchaseOrderItemFromApi(item) {
  return {
    id: item.id ?? item.itemId,
    productName: item.productName ?? item.name ?? "—",
    productLink: item.productLink ?? item.link ?? item.url ?? null,
    quantity: item.quantity ?? 1,
    attributes: item.attributes ?? item.variant ?? item.productAttributes ?? null,
  };
}

export function normalizePurchaseOrderFromApi(raw) {
  const item = raw?.data ?? raw?.purchaseOrder ?? raw;

  return {
    id: item.id ?? item.purchaseOrderId,
    purchaseOrderCode: item.purchaseOrderCode ?? item.code ?? item.id,
    purchaseRequestId: item.purchaseRequestId ?? item.requestId ?? null,
    requestCode: item.requestCode ?? item.purchaseRequestCode ?? null,
    customerId: item.customerId ?? item.customer?.id ?? null,
    customerName: item.customerName ?? item.customer?.fullName ?? "—",
    customerPhone: item.customerPhone ?? item.customer?.phone ?? null,
    customerEmail: item.customerEmail ?? item.customer?.email ?? null,
    status: String(item.status ?? "CREATED").toUpperCase(),
    processingNote: item.processingNote ?? item.statusNote ?? null,
    supplier: item.supplier ?? item.supplierName ?? null,
    purchaseNote: item.purchaseNote ?? item.note ?? null,
    createdAt: item.createdAt ?? null,
    items: (item.items ?? item.products ?? []).map(normalizePurchaseOrderItemFromApi),
  };
}

export function toApiPurchaseOrderStatusPayload({ status, processingNote }) {
  return {
    status,
    processingNote: processingNote?.trim() || null,
    statusNote: processingNote?.trim() || null,
  };
}

export function normalizePurchaseOrderStatusUpdate(raw) {
  const purchaseOrder = raw?.purchaseOrder ?? raw?.data ?? raw;

  return {
    message: raw?.message ?? "Cập nhật trạng thái mua hàng thành công.",
    status: raw?.status ?? purchaseOrder?.status,
    processingNote: raw?.processingNote ?? purchaseOrder?.processingNote ?? null,
    purchaseOrder: purchaseOrder ? normalizePurchaseOrderFromApi(purchaseOrder) : undefined,
  };
}

export function normalizePurchaseRequestFromApi(raw) {
  const item = raw?.data ?? raw?.purchaseRequest ?? raw;

  return {
    id: item.id ?? item.requestId,
    requestCode: item.requestCode ?? item.code ?? item.id,
    customerId: item.customerId ?? item.customer?.id ?? null,
    customerName: item.customerName ?? item.customer?.fullName ?? "—",
    customerPhone: item.customerPhone ?? item.customer?.phone ?? null,
    customerEmail: item.customerEmail ?? item.customer?.email ?? null,
    status: String(item.status ?? "PENDING").toUpperCase(),
    customerNote: item.customerNote ?? item.note ?? item.notes ?? null,
    statusReason: item.statusReason ?? item.reason ?? item.rejectionReason ?? null,
    createdAt: item.createdAt,
    items: (item.items ?? item.products ?? []).map(normalizePurchaseRequestItemFromApi),
    quotation: normalizePurchaseRequestQuotationFromApi(item.quotation),
    purchaseOrder: normalizePurchaseRequestPurchaseOrderFromApi(item.purchaseOrder),
  };
}

export function normalizePurchaseRequestListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizePurchaseRequestFromApi);
}

export function normalizePurchaseRequestStatusUpdate(raw) {
  const request = raw?.purchaseRequest ?? raw?.data ?? raw;

  return {
    message: raw?.message ?? "Cập nhật trạng thái thành công.",
    status: raw?.status ?? request?.status,
    statusReason: raw?.statusReason ?? request?.statusReason,
    purchaseRequest: request ? normalizePurchaseRequestFromApi(request) : undefined,
  };
}

export function toApiPurchaseRequestStatusPayload({ status, reason }) {
  return {
    status,
    reason: reason?.trim() || null,
    statusReason: reason?.trim() || null,
  };
}

export function toApiPurchaseRequestQuotationPayload(payload) {
  return {
    items: payload.items.map((item) => ({
      itemId: item.itemId,
      unitPrice: Number(item.unitPrice) || 0,
      quantity: Number(item.quantity) || 1,
    })),
    purchaseServiceFee: Number(payload.purchaseServiceFee) || 0,
    estimatedShippingFee:
      payload.estimatedShippingFee === "" || payload.estimatedShippingFee == null
        ? null
        : Number(payload.estimatedShippingFee),
    quotationNote: payload.quotationNote?.trim() || null,
  };
}

export function normalizePurchaseRequestQuotationResponse(raw) {
  const request = raw?.purchaseRequest ?? raw?.data ?? raw;

  return {
    message: raw?.message ?? "Gửi báo giá thành công.",
    status: raw?.status ?? request?.status ?? "QUOTED",
    totalAmount: raw?.totalAmount ?? request?.quotation?.totalAmount ?? null,
    purchaseRequest: request ? normalizePurchaseRequestFromApi(request) : undefined,
  };
}

export function toApiPurchaseRequestPurchaseOrderPayload(payload) {
  return {
    supplier: payload.supplier?.trim() || null,
    purchaseNote: payload.purchaseNote?.trim() || null,
  };
}

export function normalizePurchaseRequestPurchaseOrderResponse(raw) {
  const request = raw?.purchaseRequest ?? raw?.data ?? raw;
  const purchaseOrder = raw?.purchaseOrder ?? request?.purchaseOrder;

  return {
    message: raw?.message ?? "Tạo đơn mua hàng thành công.",
    status: raw?.status ?? request?.status ?? "PURCHASE_ORDER_CREATED",
    purchaseOrder: purchaseOrder
      ? normalizePurchaseRequestPurchaseOrderFromApi(purchaseOrder)
      : undefined,
    purchaseRequest: request ? normalizePurchaseRequestFromApi(request) : undefined,
  };
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
  const warehouseCode = payload.warehouseCode || payload.route || "US";
  const noteParts = [payload.salesNote?.trim()].filter(Boolean);

  if (payload.quotation) {
    noteParts.push(
      `Báo giá kho ${warehouseCode}: ${payload.quotation.total} USD (${payload.quotation.lines?.length ?? 0} khoản phí)`
    );
  }

  return {
    customerId: payload.customerId,
    route: warehouseCode,
    shippingOption: payload.shippingOption || "CONSIGNMENT",
    note: noteParts.join("\n") || null,
    requiresInspection: payload.requiresInspection ?? false,
    items: payload.items.map((item) => ({
      productName: item.productName?.trim(),
      productType: item.productType?.trim() || "GENERAL",
      quantity: Number(item.quantity) || 1,
      weight:
        item.estimatedWeight === "" || item.estimatedWeight == null
          ? payload.weightKg != null
            ? Number(payload.weightKg)
            : null
          : Number(item.estimatedWeight),
      declaredValue:
        item.declaredValue === "" || item.declaredValue == null
          ? null
          : Number(item.declaredValue),
      referenceUrl: item.referenceUrl?.trim() || null,
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
