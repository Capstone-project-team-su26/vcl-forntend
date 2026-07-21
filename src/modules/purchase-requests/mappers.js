/** Chuẩn hóa status BE → FE (PENDING_REVIEW = chờ Sales xử lý). */
function normalizePurchaseRequestStatus(status) {
  const raw = String(status ?? "PENDING").trim().toUpperCase();
  if (raw === "PENDING_REVIEW") return "PENDING";
  return raw || "PENDING";
}

function collectItemImageUrls(item) {
  const urls = [];
  const seen = new Set();

  function push(url) {
    const trimmed = typeof url === "string" ? url.trim() : "";
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  }

  if (Array.isArray(item.imageUrls)) {
    for (const entry of item.imageUrls) push(entry);
  }
  push(item.imageUrl);

  return urls;
}

function normalizePurchaseRequestItemFromApi(item) {
  const imageUrls = collectItemImageUrls(item);

  return {
    id: item.id ?? item.itemId,
    productName: item.productName ?? item.name ?? "—",
    productLink: item.productLink ?? item.link ?? item.url ?? null,
    sourceWebsite: item.sourceWebsite ?? null,
    productType: item.productType ?? null,
    quantity: item.quantity ?? 1,
    attributes: item.attributes ?? item.variant ?? item.productAttributes ?? null,
    note: item.note ?? null,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
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

export function normalizePurchaseRequestFromApi(raw) {
  const item = raw?.data ?? raw?.purchaseRequest ?? raw;

  return {
    id: item.id ?? item.purchaseRequestId ?? item.requestId ?? null,
    requestCode:
      item.purchaseCode ?? item.requestCode ?? item.code ?? item.purchaseRequestId ?? item.id,
    customerId: item.customerId ?? item.customer?.id ?? null,
    customerName:
      item.customerName ??
      item.customer?.fullName ??
      item.createdByName ??
      item.receiverName ??
      "—",
    customerPhone: item.customerPhone ?? item.customer?.phone ?? null,
    customerEmail: item.customerEmail ?? item.customer?.email ?? null,
    receiverName: item.receiverName ?? null,
    receiverPhone: item.receiverPhone ?? null,
    receiverAddress: item.receiverAddress ?? null,
    route: item.route ?? null,
    requiresInspection: item.requiresInspection === true,
    requiresQuantityCheck: item.requiresQuantityCheck === true,
    status: normalizePurchaseRequestStatus(item.status),
    customerNote: item.generalNote ?? item.customerNote ?? item.note ?? item.notes ?? null,
    statusReason: item.statusReason ?? item.reason ?? item.rejectionReason ?? null,
    createdAt: item.createdAt,
    itemCount: item.itemCount ?? null,
    totalQuantity: item.totalQuantity ?? null,
    items: (item.items ?? item.products ?? []).map(normalizePurchaseRequestItemFromApi),
    quotation: normalizePurchaseRequestQuotationFromApi(item.quotation),
    purchaseOrder: normalizePurchaseRequestPurchaseOrderFromApi(item.purchaseOrder),
  };
}

export function normalizePurchaseRequestListResponse(raw, { pageNumber = 1, pageSize = 10 } = {}) {
  const data = raw?.data ?? raw;
  const items = (Array.isArray(data) ? data : data?.items ?? [])
    .map(normalizePurchaseRequestFromApi)
    .filter((entry) => entry.id);

  if (Array.isArray(data)) {
    return {
      items,
      totalCount: items.length,
      pageNumber: 1,
      pageSize: items.length || pageSize,
      totalPages: 1,
    };
  }

  const totalCount = Number(data?.totalCount ?? items.length) || 0;
  const resolvedPageSize = Number(data?.pageSize ?? pageSize) || pageSize;
  const totalPages =
    Number(data?.totalPages) ||
    Math.max(1, Math.ceil(totalCount / Math.max(resolvedPageSize, 1)));

  return {
    items,
    totalCount,
    pageNumber: Number(data?.pageNumber ?? pageNumber) || 1,
    pageSize: resolvedPageSize,
    totalPages,
  };
}

export function normalizePurchaseRequestStatusUpdate(raw) {
  const request = raw?.purchaseRequest ?? raw?.data ?? raw;

  return {
    message: raw?.message ?? "Cập nhật trạng thái thành công.",
    status: normalizePurchaseRequestStatus(raw?.status ?? request?.status),
    statusReason: raw?.statusReason ?? request?.statusReason ?? request?.reason,
    purchaseRequest: request ? normalizePurchaseRequestFromApi(request) : undefined,
  };
}

export function toApiPurchaseRequestStatusPayload({ status, reason }) {
  return {
    status,
    reason: reason?.trim() || null,
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
    status: normalizePurchaseRequestStatus(raw?.status ?? request?.status ?? "QUOTED"),
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
    status: normalizePurchaseRequestStatus(
      raw?.status ?? request?.status ?? "PURCHASE_ORDER_CREATED"
    ),
    purchaseOrder: purchaseOrder
      ? normalizePurchaseRequestPurchaseOrderFromApi(purchaseOrder)
      : undefined,
    purchaseRequest: request ? normalizePurchaseRequestFromApi(request) : undefined,
  };
}
