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
