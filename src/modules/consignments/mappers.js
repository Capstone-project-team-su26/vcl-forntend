/** Chuẩn hóa response backend VCL → shape FE đang dùng (consignments). */

import { normalizePackageConfigurationFromApi } from "@/modules/package-configurations/mappers";

export function normalizeConsignmentStatus(status) {
  if (status == null || status === "") return status;
  return String(status).trim().toUpperCase();
}

/** Tên hiển thị từ vài key BE thường dùng; bỏ "—" giả. */
function pickDisplayName(...candidates) {
  for (const value of candidates) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text && text !== "—") return text;
  }
  return null;
}

function resolveCustomerDisplayName(item) {
  const customer = item?.customer;
  return pickDisplayName(
    customer?.fullName,
    customer?.name,
    item?.customerName,
    item?.customerFullName
  );
}

function resolvePartyFromApi(item, role) {
  const nested = item?.[role];
  const prefix = role; // sender | receiver
  const aliases =
    role === "receiver"
      ? [item?.recipient, item?.consignee]
      : [];
  return {
    name: pickDisplayName(
      item?.[`${prefix}Name`],
      role === "receiver" ? item?.recipientName : null,
      role === "receiver" ? item?.consigneeName : null,
      nested?.fullName,
      nested?.name,
      nested?.customerName,
      ...aliases.flatMap((entry) => [
        entry?.fullName,
        entry?.name,
        entry?.customerName,
      ])
    ),
    phone: pickDisplayName(
      item?.[`${prefix}Phone`],
      role === "receiver" ? item?.recipientPhone : null,
      role === "receiver" ? item?.consigneePhone : null,
      nested?.phone,
      nested?.phoneNumber,
      ...aliases.flatMap((entry) => [entry?.phone, entry?.phoneNumber])
    ),
    address: pickDisplayName(
      item?.[`${prefix}Address`],
      role === "receiver" ? item?.recipientAddress : null,
      role === "receiver" ? item?.consigneeAddress : null,
      nested?.address,
      ...aliases.flatMap((entry) => [entry?.address])
    ),
  };
}

/** Giữ field cũ khi response gửi báo giá/status thiếu party. */
export function preferFilledField(next, prev) {
  return pickDisplayName(next) ?? pickDisplayName(prev) ?? next ?? prev ?? null;
}

export function mergeConsignmentDetail(prev, next) {
  if (!prev) return next;
  if (!next) return prev;
  return {
    ...prev,
    ...next,
    customerName: preferFilledField(next.customerName, prev.customerName) ?? "—",
    senderName: preferFilledField(next.senderName, prev.senderName),
    senderPhone: preferFilledField(next.senderPhone, prev.senderPhone),
    senderAddress: preferFilledField(next.senderAddress, prev.senderAddress),
    receiverName: preferFilledField(next.receiverName, prev.receiverName),
    receiverPhone: preferFilledField(next.receiverPhone, prev.receiverPhone),
    receiverAddress: preferFilledField(next.receiverAddress, prev.receiverAddress),
    customer: next.customer ?? prev.customer ?? null,
    customerId: next.customerId ?? prev.customerId ?? null,
    items: next.items?.length ? next.items : prev.items,
    quotation: next.quotation ?? prev.quotation,
  };
}

export function normalizeConsignmentSummary(item) {
  const orderId = item.orderId ?? item.id;
  const receiver = resolvePartyFromApi(item, "receiver");

  const productNames = (() => {
    if (Array.isArray(item.productNames) && item.productNames.length) {
      return item.productNames.filter(Boolean);
    }
    if (Array.isArray(item.itemNames) && item.itemNames.length) {
      return item.itemNames.filter(Boolean);
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
    customerName: resolveCustomerDisplayName(item) ?? "—",
    receiverName: receiver.name,
    receiverPhone: receiver.phone ?? pickDisplayName(item.phone) ?? null,
    receiverAddress: receiver.address ?? pickDisplayName(item.address) ?? null,
    requiresInspection: item.requiresInspection === true,
    requiresPacking: item.requiresPacking === true,
    requiresWoodenCrate: item.requiresWoodenCrate === true,
    requiresInsurance: item.requiresInsurance === true,
    pricingRuleIds: Array.isArray(item.pricingRuleIds) ? item.pricingRuleIds : [],
    productNames,
    consignmentType:
      item.orderType ?? item.consignmentType ?? item.shippingOption ?? "—",
    status: normalizeConsignmentStatus(item.status),
    totalWeight: item.totalWeight ?? null,
    totalVolume: item.totalVolume ?? null,
    totalVolumeM3:
      item.totalVolumeM3 != null && Number.isFinite(Number(item.totalVolumeM3))
        ? Number(item.totalVolumeM3)
        : null,
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

function normalizeQuotationParcelFromApi(parcel) {
  if (!parcel) return null;
  return {
    parcelId: parcel.parcelId ?? parcel.id ?? null,
    packageCode: parcel.packageCode ?? null,
    actualWeight: parcel.actualWeight ?? null,
    length: parcel.length ?? null,
    width: parcel.width ?? null,
    height: parcel.height ?? null,
    volumetricWeight: parcel.volumetricWeight ?? null,
    chargeableWeight: parcel.chargeableWeight ?? null,
    shippingFee: parcel.shippingFee ?? null,
    // BE gap: chưa có trên swagger — giữ nếu sau này trả về.
    packageConfigurationId:
      parcel.packageConfigurationId ?? parcel.packageConfiguration?.id ?? null,
    packageConfiguration: parcel.packageConfiguration
      ? normalizePackageConfigurationFromApi(parcel.packageConfiguration)
      : null,
  };
}

export function normalizeConsignmentQuotationFromApi(quotation) {
  if (!quotation) return null;

  const salesNote =
    quotation.salesNote?.trim() ||
    quotation.quotationNote?.trim() ||
    null;

  const additionalFees = Array.isArray(quotation.additionalFees)
    ? quotation.additionalFees.map((fee) => ({
        feeId: fee.feeId ?? fee.pricingRuleId ?? fee.id ?? null,
        id: fee.id ?? fee.feeId ?? null,
        code: fee.code ?? fee.feeType ?? null,
        label: fee.label ?? fee.feeName ?? fee.name ?? fee.code ?? "Phụ phí",
        name: fee.feeName ?? fee.name ?? fee.label ?? null,
        feeType: fee.feeType ?? null,
        feeCalculationType:
          fee.feeCalculationType ?? fee.calculationType ?? null,
        unitPrice: fee.unitPrice ?? fee.value ?? null,
        quantity: fee.quantity ?? null,
        amount: fee.amount ?? fee.totalAmount ?? fee.shippingFee ?? 0,
        enabled: fee.enabled !== false,
        isRequired: fee.isRequired === true,
        unitNoun: fee.unitNoun ?? null,
        description: fee.note ?? fee.description ?? null,
      }))
    : quotation.additionalFees ?? null;

  const parcels = Array.isArray(quotation.parcels)
    ? quotation.parcels.map(normalizeQuotationParcelFromApi).filter(Boolean)
    : null;

  return {
    id: quotation.quotationId ?? quotation.id,
    quotationId: quotation.quotationId ?? quotation.id,
    orderId: quotation.orderId ?? null,
    quoteType: quotation.quoteType ?? null,
    status: quotation.status ?? null,
    consignmentType: quotation.consignmentType ?? null,
    consignmentCode: quotation.consignmentCode ?? null,
    warehouseId: quotation.warehouseId ?? null,
    estimatedFreightCharge: quotation.estimatedFreightCharge ?? null,
    domesticShippingFee: quotation.domesticShippingFee ?? null,
    serviceFee: quotation.serviceFee ?? null,
    importTax: quotation.importTax ?? null,
    vat: quotation.vat ?? null,
    taxAndDuty: quotation.taxAndDuty ?? null,
    totalEstimatedCost: quotation.totalEstimatedCost ?? quotation.total ?? null,
    total: quotation.totalEstimatedCost ?? quotation.total ?? null,
    totalWeight: quotation.totalWeight ?? null,
    totalVolume: quotation.totalVolume ?? null,
    volumetricWeight: quotation.volumetricWeight ?? null,
    chargeableWeight: quotation.chargeableWeight ?? null,
    mainServiceAmount: quotation.mainServiceAmount ?? quotation.estimatedFreightCharge ?? null,
    additionalFees,
    parcels,
    discountPercent: quotation.discountPercent ?? null,
    subtotal: quotation.subtotal ?? null,
    discount: quotation.discount ?? null,
    salesNote,
    createdAt: quotation.createdAt ?? null,
    expiredAt: quotation.expiredAt ?? null,
    sentAt: quotation.sentAt ?? null,
    rejectionReason: quotation.rejectionReason ?? null,
    currency: quotation.currency ?? "VND",
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

/** Gom URL ảnh từ BE (referenceUrls[]) + fallback field cũ. */
function collectItemImageUrls(item) {
  const candidates = [];

  function pushEntry(entry) {
    const url = typeof entry === "string" ? entry.trim() : entry?.url?.trim();
    if (url) candidates.push(url);
  }

  for (const entry of item.referenceUrls ?? []) pushEntry(entry);
  for (const entry of item.imageUrls ?? []) pushEntry(entry);
  for (const entry of item.images ?? []) pushEntry(entry);
  if (item.referenceUrl) pushEntry(item.referenceUrl);
  if (item.imageUrl) pushEntry(item.imageUrl);

  const seen = new Set();
  const imageUrls = [];
  for (const url of candidates) {
    if (!isImageReferenceUrl(url) || seen.has(url)) continue;
    seen.add(url);
    imageUrls.push(url);
  }
  return imageUrls;
}

function resolveItemProductLink(item) {
  const candidates = [
    ...(Array.isArray(item.referenceUrls) ? item.referenceUrls : []),
    item.referenceUrl,
  ];

  for (const entry of candidates) {
    const url = typeof entry === "string" ? entry.trim() : "";
    if (url && !isImageReferenceUrl(url)) return url;
  }
  return null;
}

function normalizeConsignmentItem(item) {
  if (!item) return item;

  const imageUrls = collectItemImageUrls(item);
  const productLink = resolveItemProductLink(item);
  // ponytail: referenceUrl giữ 1 URL “chính” cho chỗ cũ còn đọc field đơn
  const referenceUrl = productLink ?? imageUrls[0] ?? null;

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
    productLink,
    imageUrls,
    domesticTrackingCode: item.domesticTrackingCode ?? null,
    packageConfigurationId:
      item.packageConfigurationId ?? item.packageConfiguration?.id ?? null,
    packageConfiguration: item.packageConfiguration
      ? normalizePackageConfigurationFromApi(item.packageConfiguration)
      : null,
    actualPackageConfigurationId:
      item.actualPackageConfigurationId ??
      item.actualPackageConfiguration?.id ??
      null,
    actualPackageConfiguration: item.actualPackageConfiguration
      ? normalizePackageConfigurationFromApi(item.actualPackageConfiguration)
      : null,
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
  const customerName = resolveCustomerDisplayName(item);
  const sender = resolvePartyFromApi(item, "sender");
  const receiver = resolvePartyFromApi(item, "receiver");
  const customerPhone = pickDisplayName(
    item.customer?.phone,
    item.customer?.phoneNumber
  );
  const customerAddress = pickDisplayName(item.customer?.address);

  return {
    id: item.orderId ?? item.id,
    consignmentCode: item.consignmentCode ?? null,
    customerName: customerName ?? "—",
    orderType: item.orderType ?? null,
    consignmentType: item.consignmentType ?? item.shippingOption ?? item.orderType ?? "—",
    shippingOption: item.consignmentType ?? item.shippingOption ?? null,
    status: normalizeConsignmentStatus(item.status),
    createdAt: item.createdAt,
    productName: firstItem?.productName,
    quantity: firstItem?.quantity,
    destination: item.route ?? item.shippingOption ?? item.destination,
    route: item.route ?? null,
    senderName: sender.name ?? customerName,
    senderPhone: sender.phone ?? customerPhone,
    senderAddress: sender.address ?? customerAddress,
    receiverName: receiver.name,
    receiverPhone: receiver.phone,
    receiverAddress: receiver.address,
    requiresInspection: item.requiresInspection === true,
    requiresPacking: item.requiresPacking === true,
    requiresWoodenCrate: item.requiresWoodenCrate === true,
    requiresInsurance: item.requiresInsurance === true,
    pricingRuleIds: Array.isArray(item.pricingRuleIds) ? item.pricingRuleIds : [],
    notes: item.note ?? item.notes,
    trackingCode: item.consignmentCode ?? item.trackingCode,
    rejectionReason: item.rejectionReason,
    items,
    // ponytail: order-level images hiếm; ảnh chính nằm ở items[].referenceUrls
    images: Array.isArray(item.images)
      ? item.images
          .map((entry) => (typeof entry === "string" ? entry : entry?.url))
          .filter((url) => isImageReferenceUrl(url))
      : [],
    quotation: (() => {
      const quotation = normalizeConsignmentQuotationFromApi(item.quotation);
      if (quotation && !quotation.salesNote && item.note?.trim()) {
        quotation.salesNote = item.note.trim();
      }
      return quotation;
    })(),
    customer: item.customer ?? null,
    customerId:
      item.customer?.customerId ?? item.customer?.id ?? item.customerId ?? null,
    warehouseId: item.warehouseId ?? null,
    warehouseName: item.warehouseName ?? null,
    totalWeight: item.totalWeight ?? null,
    totalVolume: item.totalVolume ?? null,
    totalVolumeM3:
      item.totalVolumeM3 != null && Number.isFinite(Number(item.totalVolumeM3))
        ? Number(item.totalVolumeM3)
        : null,
    packageCount,
  };
}

export function normalizeConsignmentStatusUpdate(raw) {
  const payload = raw?.data ?? raw;

  return {
    message: payload.message ?? raw?.message,
    status: normalizeConsignmentStatus(payload.status ?? raw?.status),
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

export function normalizeEstimateQuotationResponse(raw) {
  const item = raw?.data ?? raw?.quotation ?? raw;
  const quotation = normalizeConsignmentQuotationFromApi(item.quotation ?? item);

  return {
    quotationId: item.quotationId ?? quotation?.quotationId ?? item.id,
    orderId: item.orderId ?? quotation?.orderId,
    status: item.status ?? quotation?.status,
    totalWeight: item.totalWeight ?? quotation?.totalWeight,
    totalVolume: item.totalVolume ?? quotation?.totalVolume,
    volumetricWeight: item.volumetricWeight ?? quotation?.volumetricWeight,
    chargeableWeight: item.chargeableWeight ?? quotation?.chargeableWeight,
    estimatedFreightCharge:
      item.estimatedFreightCharge ?? quotation?.estimatedFreightCharge ?? item.mainServiceAmount,
    domesticShippingFee:
      item.domesticShippingFee ?? quotation?.domesticShippingFee ?? null,
    serviceFee: item.serviceFee ?? quotation?.serviceFee ?? item.additionalTotal,
    importTax: item.importTax ?? quotation?.importTax ?? 0,
    vat: item.vat ?? quotation?.vat ?? 0,
    taxAndDuty: item.taxAndDuty ?? quotation?.taxAndDuty ?? 0,
    totalEstimatedCost:
      item.totalEstimatedCost ?? quotation?.totalEstimatedCost ?? item.total,
    parcels: quotation?.parcels ?? null,
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

  // Khớp AdditionalFeeDto swagger (additionalProperties: false).
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
    domesticShippingFee:
      quotation.domesticShippingFee != null
        ? Number(quotation.domesticShippingFee)
        : null,
    serviceFee: quotation.serviceFee != null ? Number(quotation.serviceFee) : null,
    importTax: quotation.importTax != null ? Number(quotation.importTax) : null,
    vat: quotation.vat != null ? Number(quotation.vat) : null,
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
    // ponytail: FE giữ cm³; BE VolumeM3 là m³. Inline ÷1e6 — tránh cycle với service-pricing.
    volumeM3: (() => {
      const volumeCm3 =
        payload.volumeCm3 != null && payload.volumeCm3 !== ""
          ? Number(payload.volumeCm3)
          : payload.volumeM3 != null && payload.volumeM3 !== ""
            ? Number(payload.volumeM3)
            : null;
      return volumeCm3 != null && Number.isFinite(volumeCm3) ? volumeCm3 / 1_000_000 : null;
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
    pricingRuleIds: Array.isArray(payload.pricingRuleIds)
      ? payload.pricingRuleIds.filter(isUuid)
      : [],
    items: payload.items.map((item) => {
      const referenceUrls = (
        Array.isArray(item.referenceUrls)
          ? item.referenceUrls
          : Array.isArray(item.imageUrls)
            ? item.imageUrls
            : item.referenceUrl
              ? [item.referenceUrl]
              : []
      )
        .map((url) => (typeof url === "string" ? url.trim() : ""))
        .filter(Boolean);

      return {
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
        referenceUrls: referenceUrls.length ? referenceUrls : null,
      };
    }),
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
