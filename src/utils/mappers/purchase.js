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
