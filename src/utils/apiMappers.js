import { volumeCm3ToM3 } from "@/utils/servicePricingService";

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

  const productNames = (() => {
    if (Array.isArray(item.productNames) && item.productNames.length) {
      return item.productNames.filter(Boolean);
    }
    if (Array.isArray(item.items) && item.items.length) {
      return item.items.map((entry) => entry?.productName).filter(Boolean);
    }
    if (item.productName) return [item.productName];
    return [];
  })();

  return {
    id: orderId,
    consignmentCode: item.consignmentCode || null,
    customerName: item.customerName ?? item.customer?.fullName ?? "—",
    receiverName: item.receiverName ?? null,
    receiverPhone: item.receiverPhone ?? item.phone ?? null,
    receiverAddress: item.receiverAddress ?? item.address ?? null,
    requiresInspection: item.requiresInspection === true,
    productNames,
    consignmentType:
      item.orderType ?? item.consignmentType ?? item.shippingOption ?? "—",
    status: item.status,
    totalWeight: item.totalWeight ?? null,
    totalVolume: item.totalVolume ?? null,
    createdAt: item.createdAt,
    route: item.route ?? null,
    warehouseName: item.warehouseName ?? item.warehouse?.name ?? null,
    destination: item.route ?? item.shippingOption ?? item.destination ?? null,
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

export function normalizeConsignmentQuotationFromApi(quotation) {
  if (!quotation) return null;

  const salesNote =
    quotation.salesNote?.trim() ||
    quotation.quotationNote?.trim() ||
    null;

  return {
    id: quotation.quotationId ?? quotation.id,
    quotationId: quotation.quotationId ?? quotation.id,
    quoteType: quotation.quoteType ?? null,
    status: quotation.status ?? null,
    estimatedFreightCharge: quotation.estimatedFreightCharge ?? null,
    serviceFee: quotation.serviceFee ?? null,
    taxAndDuty: quotation.taxAndDuty ?? null,
    totalEstimatedCost: quotation.totalEstimatedCost ?? quotation.total ?? null,
    total: quotation.totalEstimatedCost ?? quotation.total ?? null,
    totalWeight: quotation.totalWeight ?? null,
    totalVolume: quotation.totalVolume ?? null,
    mainServiceAmount: quotation.mainServiceAmount ?? quotation.estimatedFreightCharge ?? null,
    additionalFees: quotation.additionalFees ?? null,
    discountPercent: quotation.discountPercent ?? null,
    salesNote,
    createdAt: quotation.createdAt ?? null,
    expiredAt: quotation.expiredAt ?? null,
    sentAt: quotation.sentAt ?? null,
    rejectionReason: quotation.rejectionReason ?? null,
    currency: "VND",
    lines: quotation.lines ?? null,
    customFees: quotation.customFees ?? null,
  };
}

/** URL ảnh upload (Cloudinary) hoặc file ảnh trực tiếp — khác link sản phẩm (Taobao, 1688…). */
export function isImageReferenceUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (host.includes("cloudinary.com") || path.includes("/image/upload")) return true;
    if (/\.(jpe?g|png|gif|webp|avif|bmp)(\?.*)?$/i.test(path)) return true;
    return false;
  } catch {
    return /\.(jpe?g|png|gif|webp|avif|bmp)(\?.*)?$/i.test(trimmed);
  }
}

/**
 * Số kiện đơn = số dòng sản phẩm (mỗi dòng = 1 kiện; `quantity` là số lượng món trong kiện đó,
 * không phải số kiện). VD 1 dòng "phong" quantity=2 → 1 kiện chứa 2 món.
 * - Không tin `packageCount` bịa trên payload (BE detail không trả field này).
 */
export function resolveConsignmentPackageCount({ packageCount, items, quantity } = {}) {
  if (Array.isArray(items) && items.length > 0) {
    return items.length;
  }

  const explicit = Number(packageCount ?? quantity);
  return Number.isFinite(explicit) && explicit > 0 ? Math.round(explicit) : null;
}

function normalizeConsignmentItem(item) {
  if (!item) return item;

  const referenceUrl = item.referenceUrl?.trim() || item.imageUrl?.trim() || null;
  const extraImages = Array.isArray(item.images)
    ? item.images.map((entry) => (typeof entry === "string" ? entry : entry?.url)).filter(Boolean)
    : [];

  const imageUrls = [
    ...(isImageReferenceUrl(referenceUrl) ? [referenceUrl] : []),
    ...extraImages.filter(isImageReferenceUrl),
  ];

  return {
    id: item.id,
    productName: item.productName,
    productType: item.productType,
    quantity: item.quantity ?? item.Quantity,
    weight: item.weight,
    width: item.width,
    height: item.height,
    length: item.length,
    declaredValue: item.declaredValue,
    referenceUrl,
    imageUrls,
    domesticTrackingCode: item.domesticTrackingCode ?? null,
  };
}

export function normalizeConsignmentDetail(raw) {
  const item = raw?.data ?? raw;
  const firstItem = item.items?.[0];
  const items = (item.items ?? []).map(normalizeConsignmentItem);
  const packageCount = resolveConsignmentPackageCount({
    packageCount: item.packageCount,
    items,
    quantity: item.quantity ?? firstItem?.quantity,
  });

  return {
    id: item.orderId ?? item.id,
    consignmentCode: item.consignmentCode ?? null,
    customerName: item.customer?.fullName ?? item.customerName ?? "—",
    orderType: item.orderType ?? null,
    consignmentType: item.consignmentType ?? item.shippingOption ?? item.orderType ?? "—",
    shippingOption: item.consignmentType ?? item.shippingOption ?? null,
    status: item.status,
    createdAt: item.createdAt,
    productName: firstItem?.productName,
    quantity: firstItem?.quantity,
    destination: item.route ?? item.shippingOption ?? item.destination,
    route: item.route ?? null,
    senderName: item.senderName ?? item.customer?.fullName ?? item.customerName ?? null,
    senderPhone: item.senderPhone ?? item.customer?.phone ?? item.customer?.phoneNumber ?? null,
    senderAddress: item.senderAddress ?? item.customer?.address ?? null,
    receiverName: item.receiverName ?? null,
    receiverPhone: item.receiverPhone ?? null,
    receiverAddress: item.receiverAddress ?? null,
    requiresInspection: item.requiresInspection === true,
    notes: item.note ?? item.notes,
    trackingCode: item.consignmentCode ?? item.trackingCode,
    rejectionReason: item.rejectionReason,
    items,
    images: Array.isArray(item.images)
      ? item.images.filter((url) => isImageReferenceUrl(url))
      : [],
    quotation: (() => {
      const quotation = normalizeConsignmentQuotationFromApi(item.quotation);
      if (quotation && !quotation.salesNote && item.note?.trim()) {
        quotation.salesNote = item.note.trim();
      }
      return quotation;
    })(),
    customer: item.customer ?? null,
    customerId: item.customer?.customerId ?? item.customerId ?? null,
    warehouseId: item.warehouseId ?? null,
    warehouseName: item.warehouseName ?? null,
    totalWeight: item.totalWeight ?? null,
    totalVolume: item.totalVolume ?? null,
    packageCount,
  };
}

export function normalizeConsignmentStatusUpdate(raw) {
  const payload = raw?.data ?? raw;

  return {
    message: payload.message ?? raw?.message,
    status: payload.status ?? raw?.status,
    trackingCode:
      payload.consignmentCode ?? payload.trackingCode ?? payload.shipmentCode,
    rejectionReason: payload.rejectionReason ?? raw?.rejectionReason,
    consignment: payload.consignment
      ? normalizeConsignmentDetail(payload.consignment)
      : payload.orderId
        ? normalizeConsignmentDetail(payload)
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

function normalizeServicePricingUnitType(raw) {
  const upper = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
  if (!upper) return null;
  if (upper === "KG" || upper === "KILOGRAM") return "KG";
  if (upper === "CBM" || upper === "CM3" || upper === "CM³" || upper === "M3" || upper === "M³") {
    return "CBM";
  }
  if (
    (upper.includes("KG") && upper.includes("CBM")) ||
    (upper.includes("KG") && upper.includes("CM3"))
  ) {
    return "KG_OR_CBM";
  }
  return upper;
}

export function normalizeServicePricingFromApi(item) {
  const serviceType = item.serviceType ?? item.service_type;

  return {
    id: item.id,
    carrierId: item.carrierId ?? item.carrier_id ?? "VCL",
    carrierName: item.carrierName ?? item.carrier_name ?? null,
    serviceType: serviceType ? String(serviceType).toUpperCase() : null,
    originCountry: item.originCountry ?? item.origin_country,
    destinationCountry: item.destinationCountry ?? item.destination_country,
    warehouseId: item.warehouseId ?? item.warehouse_id ?? null,
    unitType: normalizeServicePricingUnitType(item.unitType ?? item.unit_type),
    price: item.price ?? null,
    pricePerKg: item.pricePerKg ?? item.price_per_kg ?? item.price ?? null,
    pricePerCbm: item.pricePerCbm ?? item.price_per_cbm ?? null,
    currency: item.currency ?? "VND",
    effectiveDate: item.effectiveDate ?? item.effective_date ?? null,
    isActive: item.isActive !== false && item.status !== "INACTIVE",
  };
}

export function toApiServicePricingPayload(data) {
  // CreateServicePricingRequest: chỉ các field swagger; carrierId phải là UUID thuần.
  const price =
    data.unitType === "KG_OR_CBM"
      ? data.pricePerKg ?? data.price
      : data.price ?? data.pricePerKg;

  const carrierId = extractGuid(data.carrierId);

  return {
    carrierId: carrierId || null,
    serviceType: data.serviceType,
    originCountry: data.originCountry,
    destinationCountry: data.destinationCountry,
    unitType: data.unitType,
    price: price == null ? null : Number(price),
    currency: data.currency ?? "VND",
    effectiveDate: data.effectiveDate,
  };
}

export function normalizeEstimateQuotationResponse(raw) {
  const item = raw?.data ?? raw?.quotation ?? raw;
  const quotation = normalizeConsignmentQuotationFromApi(item.quotation ?? item);

  return {
    quotationId: item.quotationId ?? quotation?.quotationId ?? item.id,
    orderId: item.orderId,
    status: item.status ?? quotation?.status,
    totalWeight: item.totalWeight ?? quotation?.totalWeight,
    totalVolume: item.totalVolume ?? quotation?.totalVolume,
    volumetricWeight: item.volumetricWeight,
    chargeableWeight: item.chargeableWeight,
    estimatedFreightCharge:
      item.estimatedFreightCharge ?? quotation?.estimatedFreightCharge ?? item.mainServiceAmount,
    serviceFee: item.serviceFee ?? quotation?.serviceFee ?? item.additionalTotal,
    taxAndDuty: item.taxAndDuty ?? quotation?.taxAndDuty ?? 0,
    totalEstimatedCost:
      item.totalEstimatedCost ?? quotation?.totalEstimatedCost ?? item.total,
    quotation,
  };
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value ?? "")
  );
}

/** Lấy UUID từ id/code dạng `CARRIER_<guid>` hoặc chuỗi có guid. */
export function extractGuid(value) {
  if (isUuid(value)) return String(value);
  const match = String(value ?? "").match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );
  return match ? match[0] : null;
}

/** Bỏ null/undefined — giống body Swagger (không gửi field rỗng). */
function stripNullishDeep(value) {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const items = value.map(stripNullishDeep).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, val]) => [key, stripNullishDeep(val)])
      .filter(([, val]) => val !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value;
}

function toApiAdditionalFeeDto(fee) {
  if (!fee) return null;

  const feeId = isUuid(fee.feeId) ? fee.feeId : isUuid(fee.id) ? fee.id : null;
  if (!feeId) return null;

  return {
    feeId,
    code: fee.code ?? null,
    label: fee.label ?? null,
    amount: Number(fee.amount) || 0,
    enabled: fee.enabled !== false,
  };
}

function toApiQuotationDetailsDto(quotation, fallbackSalesNote = "") {
  if (!quotation) return null;

  const additionalFees = (quotation.additionalFees ?? [])
    .map(toApiAdditionalFeeDto)
    .filter(Boolean);

  const salesNote = quotation.salesNote?.trim() || fallbackSalesNote?.trim() || "";

  const details = {
    servicePricingId: isUuid(quotation.servicePricingId) ? quotation.servicePricingId : null,
    serviceType: quotation.serviceType ?? null,
    originCountry: quotation.originCountry ?? null,
    destinationCountry: quotation.destinationCountry ?? null,
    unitType: quotation.unitType ?? null,
    unitPrice: quotation.unitPrice != null ? Number(quotation.unitPrice) : null,
    currency: quotation.currency ?? "VND",
    totalWeight: quotation.totalWeight != null ? Number(quotation.totalWeight) : null,
    totalVolume: quotation.totalVolume != null ? Number(quotation.totalVolume) : null,
    volumetricWeight:
      quotation.volumetricWeight != null ? Number(quotation.volumetricWeight) : null,
    chargeableWeight:
      quotation.chargeableWeight != null ? Number(quotation.chargeableWeight) : null,
    mainServiceAmount:
      quotation.mainServiceAmount != null ? Number(quotation.mainServiceAmount) : null,
    discountPercent:
      quotation.discountPercent != null ? Number(quotation.discountPercent) : null,
    subtotal: quotation.subtotal != null ? Number(quotation.subtotal) : null,
    discount: quotation.discount != null ? Number(quotation.discount) : null,
    total: quotation.total != null ? Number(quotation.total) : null,
    estimatedFreightCharge:
      quotation.estimatedFreightCharge != null
        ? Number(quotation.estimatedFreightCharge)
        : null,
    serviceFee: quotation.serviceFee != null ? Number(quotation.serviceFee) : null,
    totalEstimatedCost:
      quotation.totalEstimatedCost != null ? Number(quotation.totalEstimatedCost) : null,
    salesNote,
  };

  if (additionalFees.length) {
    details.additionalFees = additionalFees;
  }

  return details;
}

function preserveRequiredQuotationFields(quotation, { salesNote, serviceType }) {
  if (!quotation) return null;

  const lean = stripNullishDeep(quotation) ?? {};

  return {
    ...lean,
    serviceType: quotation.serviceType ?? serviceType ?? lean.serviceType,
    unitType: quotation.unitType ?? lean.unitType,
    originCountry: quotation.originCountry ?? lean.originCountry,
    destinationCountry: quotation.destinationCountry ?? lean.destinationCountry,
    salesNote: quotation.salesNote?.trim() || salesNote?.trim() || lean.salesNote,
  };
}

/** Map FE draft → `CreateQuotationRequest` (Swagger + validation BE thực tế). */
export function toApiCreateQuotationRequest(payload, options = {}) {
  const { forSend = false } = options;
  const salesNote = payload.salesNote?.trim() ?? (forSend ? "" : "Báo giá tạm tính");
  const serviceType = payload.serviceType ?? payload.quotation?.serviceType ?? null;

  const request = {
    warehouseId: isUuid(payload.warehouseId) ? payload.warehouseId : null,
    servicePricingId: isUuid(payload.servicePricingId) ? payload.servicePricingId : null,
    serviceType,
    weightKg: payload.weightKg != null ? Number(payload.weightKg) : null,
    // ponytail: FE giữ cm³ (volumeCm3 / volumeM3); BE CreateQuotationRequest.VolumeM3 là m³ thật.
    volumeM3: (() => {
      const volumeCm3 =
        payload.volumeCm3 != null && payload.volumeCm3 !== ""
          ? Number(payload.volumeCm3)
          : payload.volumeM3 != null && payload.volumeM3 !== ""
            ? Number(payload.volumeM3)
            : null;
      return volumeCm3 != null && Number.isFinite(volumeCm3) ? volumeCm3ToM3(volumeCm3) : null;
    })(),
    packageCount:
      payload.packageCount != null ? Math.round(Number(payload.packageCount)) : null,
    declaredValue:
      payload.declaredValue === "" || payload.declaredValue == null
        ? null
        : Number(payload.declaredValue),
    salesNote,
  };

  const quotation = preserveRequiredQuotationFields(
    payload.quotation ? toApiQuotationDetailsDto(payload.quotation, salesNote) : null,
    { salesNote, serviceType }
  );

  const optional = stripNullishDeep({
    ...request,
    salesNote: undefined,
    serviceType: undefined,
    quotation: undefined,
  });

  const body = {
    ...(optional ?? {}),
    serviceType,
    salesNote,
  };

  if (quotation) {
    body.quotation = quotation;
  }

  return body;
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

/** WarehouseVN / WarehouseTQ / WarehouseStaff / … → Warehouse (region tách riêng). */
export function normalizeEmployeeRole(role) {
  const raw = String(role || "").trim();
  if (!raw) return raw;
  if (/^warehouse/i.test(raw)) return "Warehouse";
  return raw;
}

function inferRegionFromRole(role) {
  const raw = String(role || "");
  if (/VN|Vietnam|Việt/i.test(raw)) return "VN";
  if (/TQ|China|Trung/i.test(raw)) return "TQ";
  return null;
}

function normalizeUserStatus(status) {
  const raw = String(status || "Active")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (raw === "LOCKED") return "LOCKED";
  if (raw === "PENDING_VERIFICATION" || raw === "PENDINGVERIFICATION") {
    return "PENDING_VERIFICATION";
  }
  if (raw === "ACTIVE") return "ACTIVE";
  return raw || "ACTIVE";
}

export function normalizeUserFromApi(user) {
  const name = user.fullName ?? user.name ?? "—";
  const rawRole = user.role ?? null;
  const region =
    user.region ?? user.Region ?? inferRegionFromRole(rawRole) ?? null;

  return {
    id: user.id,
    name,
    email: user.email ?? null,
    phone: user.phone ?? user.phoneNumber ?? null,
    role: normalizeEmployeeRole(rawRole),
    rawRole,
    userType: user.userType ?? user.user_type ?? null,
    region,
    isEmailVerified: Boolean(
      user.isEmailVerified ?? user.is_email_verified ?? false
    ),
    status: normalizeUserStatus(user.status),
    lastSeen:
      user.lastSeen ??
      formatUserDate(user.createdAt ?? user.created_at),
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

function normalizeSupportedShippingMethodsFromApi(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  return String(value)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function normalizeCarrierFromApi(item) {
  return {
    id: item.id ?? item.carrierId,
    code: item.code ?? item.carrierCode ?? item.carrier_id,
    name: item.name ?? item.carrierName ?? item.carrier_name ?? "—",
    type: String(item.type ?? item.carrierType ?? "CARRIER").toUpperCase(),
    supportedShippingMethods: normalizeSupportedShippingMethodsFromApi(
      item.supportedShippingMethods ??
        item.supported_shipping_methods ??
        item.shippingMethods
    ),
    supportedRegions:
      item.supportedRegions ?? item.supported_regions ?? item.regions ?? null,
    contactInfo: item.contactInfo ?? item.contact_info ?? item.contact ?? null,
    internalNotes: item.internalNotes ?? item.internalNote ?? item.note ?? null,
    isActive: item.isActive !== false && item.is_active !== false,
  };
}

export function toApiCarrierPayload(payload) {
  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    type: payload.type?.trim()?.toUpperCase(),
    supportedShippingMethods: normalizeSupportedShippingMethodsFromApi(
      payload.supportedShippingMethods
    ),
    supportedRegions: payload.supportedRegions?.trim() || null,
    contactInfo: payload.contactInfo?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export function normalizeCarrierListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.carriers ?? data?.items ?? [];
  return items.map(normalizeCarrierFromApi);
}

const FEE_CALCULATION_FROM_API = {
  fixed: "FIXED",
  flat: "FIXED",
  percentage: "PERCENTAGE",
  percent: "PERCENTAGE",
};

function inferFeeCodeFromPricingRule(item) {
  const ruleType = String(item.ruleType ?? "").toUpperCase();
  if (ruleType) return ruleType;

  const ruleCode = String(item.ruleCode ?? "").toUpperCase();
  if (ruleCode.includes("INSPECTION")) return "INSPECTION";
  if (ruleCode.includes("INSURANCE")) return "INSURANCE";
  if (ruleCode.includes("WOOD")) return "WOOD_BOX";
  return ruleCode.replace(/^SUR_/, "") || ruleCode || "SURCHARGE";
}

function inferRuleTypeFromFeeCode(code) {
  const upper = String(code ?? "").toUpperCase();
  if (upper.includes("INSPECTION")) return "INSPECTION";
  if (upper.includes("INSURANCE")) return "INSURANCE";
  if (upper.includes("WOOD")) return "WOOD_BOX";
  return upper.replace(/^SUR_/, "") || "SURCHARGE";
}

export function normalizeAdditionalServiceFeeFromApi(item) {
  if (item.ruleName != null || item.ruleCode != null) {
    const calculationType = String(item.calculationType ?? "FIXED").toUpperCase();
    const isPercentage = calculationType === "PERCENTAGE";

    return {
      id: item.id,
      code: inferFeeCodeFromPricingRule(item),
      name: item.ruleName ?? "—",
      feeCalculationType: isPercentage ? "PERCENTAGE" : "FIXED",
      fixedAmount: isPercentage ? null : Number(item.value) || 0,
      percentageRate: isPercentage ? Number(item.value) || 0 : null,
      unit: item.conditionType ?? null,
      description: item.description ?? null,
      isActive: String(item.status ?? "ACTIVE").toUpperCase() !== "INACTIVE",
      ruleCode: item.ruleCode ?? null,
      ruleType: item.ruleType ?? null,
      conditionType: item.conditionType ?? null,
      conditionValue: item.conditionValue ?? null,
      minAmount: item.minAmount ?? null,
      maxAmount: item.maxAmount ?? null,
      isRequired: item.isRequired === true,
      servicePricingId: item.servicePricingId ?? null,
    };
  }

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

/** Map form phụ phí FE → `CreatePricingRuleRequest` / `UpdatePricingRuleRequest`. */
export function toApiPricingRuleFromAdditionalFeePayload(payload) {
  const feeCalculationType = String(payload.feeCalculationType || "FIXED").toUpperCase();
  const isPercentage = feeCalculationType === "PERCENTAGE";
  const ruleCode = (payload.ruleCode ?? payload.code)?.trim();
  const ruleType = payload.ruleType ?? inferRuleTypeFromFeeCode(ruleCode);

  return {
    servicePricingId: payload.servicePricingId ?? null,
    ruleName: payload.name?.trim(),
    ruleCode,
    ruleType,
    conditionType: payload.conditionType ?? (payload.unit?.trim() || null),
    conditionValue: payload.conditionValue ?? null,
    calculationType: isPercentage ? "PERCENTAGE" : "FIXED",
    value: isPercentage
      ? Number(payload.percentageRate) || 0
      : Number(payload.fixedAmount) || 0,
    minAmount: isPercentage ? (payload.minAmount ?? null) : null,
    maxAmount: isPercentage ? (payload.maxAmount ?? null) : null,
    isRequired: payload.isRequired === true,
    status: payload.isActive !== false ? "ACTIVE" : "INACTIVE",
    description: payload.description?.trim() || null,
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
  const rawServiceType = String(
    payload.serviceType ?? payload.shippingOption ?? "STANDARD"
  ).trim();
  const shippingOption =
    !rawServiceType || rawServiceType.toUpperCase() === "CONSIGNMENT"
      ? "STANDARD"
      : rawServiceType;

  let route = payload.route?.trim() || null;
  if (!route && payload.originCountry && payload.destinationCountry) {
    route = `${String(payload.originCountry).trim()}-${String(payload.destinationCountry).trim()}`;
  }
  if (!route) {
    route = payload.warehouseCode?.trim() || "US";
  }

  const noteParts = [payload.salesNote?.trim()].filter(Boolean);

  if (payload.quotation) {
    noteParts.push(
      `Báo giá tuyến ${route}: ${payload.quotation.total} VND (${payload.quotation.lines?.length ?? 0} khoản phí)`
    );
  }

  return {
    customerId: payload.customerId,
    route,
    shippingOption,
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
