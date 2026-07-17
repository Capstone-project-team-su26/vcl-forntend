import {
  isImageReferenceUrl,
  normalizeConsignmentItem,
  pickDisplayName,
  resolveCustomerDisplayName,
  resolvePartyFromApi,
} from "./_helpers.js";

/** Chuẩn hóa status ký gửi từ BE (giữ code production; chỉ fold case). */
export function normalizeConsignmentStatus(status) {
  if (status == null || status === "") return status;
  return String(status).trim().toUpperCase();
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
    productNames,
    consignmentType:
      item.orderType ?? item.consignmentType ?? item.shippingOption ?? "—",
    status: normalizeConsignmentStatus(item.status),
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
    importTax: quotation.importTax ?? null,
    vat: quotation.vat ?? null,
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

export { isImageReferenceUrl };

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
    customerId:
      item.customer?.customerId ?? item.customer?.id ?? item.customerId ?? null,
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
