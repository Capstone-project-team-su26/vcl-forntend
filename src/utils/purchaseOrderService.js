import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizePurchaseOrderFromApi,
  normalizePurchaseOrderStatusUpdate,
  toApiPurchaseOrderStatusPayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";

export const PURCHASE_ORDER_STATUS_LABELS = {
  CREATED: "Đã tạo đơn",
  ORDER_PLACED: "Đã đặt hàng NCC",
  SUPPLIER_CONFIRMED: "NCC xác nhận",
  PURCHASING: "Đang mua hàng",
  PURCHASED: "Đã mua xong",
  SHIPPED_TO_WAREHOUSE: "NCC giao về kho",
  WAITING_WAREHOUSE_RECEIVE: "Chờ kho nhận",
  CANCELLED: "Đã hủy",
};

export const PURCHASE_ORDER_STATUS_STYLES = {
  CREATED: "bg-surface text-muted",
  ORDER_PLACED: "bg-info-bg text-info-text",
  SUPPLIER_CONFIRMED: "bg-primary/15 text-primary",
  PURCHASING: "bg-warning-bg text-warning-text",
  PURCHASED: "bg-secondary/15 text-secondary",
  SHIPPED_TO_WAREHOUSE: "bg-accent/15 text-accent",
  WAITING_WAREHOUSE_RECEIVE: "bg-success-bg text-success-text",
  CANCELLED: "bg-danger/10 text-danger",
};

/** Chuyển trạng thái hợp lệ — chỉ tiến độ mua hàng với NCC, không vận chuyển nội địa. */
export const PURCHASE_ORDER_STATUS_TRANSITIONS = {
  CREATED: ["ORDER_PLACED", "CANCELLED"],
  ORDER_PLACED: ["SUPPLIER_CONFIRMED", "CANCELLED"],
  SUPPLIER_CONFIRMED: ["PURCHASING", "CANCELLED"],
  PURCHASING: ["PURCHASED", "CANCELLED"],
  PURCHASED: ["SHIPPED_TO_WAREHOUSE", "WAITING_WAREHOUSE_RECEIVE", "CANCELLED"],
  SHIPPED_TO_WAREHOUSE: ["WAITING_WAREHOUSE_RECEIVE"],
  WAITING_WAREHOUSE_RECEIVE: [],
  CANCELLED: [],
};

export function getAllowedNextPurchaseOrderStatuses(currentStatus) {
  const normalized = String(currentStatus || "CREATED").toUpperCase();
  return PURCHASE_ORDER_STATUS_TRANSITIONS[normalized] ?? [];
}

export function canUpdatePurchaseOrderStatus(status) {
  return getAllowedNextPurchaseOrderStatuses(status).length > 0;
}

export function isWaitingWarehouseReceive(status) {
  return String(status || "").toUpperCase() === "WAITING_WAREHOUSE_RECEIVE";
}

function mapPurchaseRequestItemsToPurchaseOrderItems(items = []) {
  return items.map((item) => ({
    id: item.id,
    productName: item.productName,
    productLink: item.productLink ?? null,
    quantity: item.quantity ?? 1,
    attributes: item.attributes ?? null,
  }));
}

function buildPurchaseOrderFromRequest(request) {
  if (!request?.purchaseOrder) return null;

  const po = request.purchaseOrder;

  return {
    id: po.id,
    purchaseOrderCode: po.purchaseOrderCode,
    purchaseRequestId: request.id,
    requestCode: request.requestCode,
    customerId: request.customerId,
    customerName: request.customerName,
    status: po.status ?? "CREATED",
    processingNote: po.processingNote ?? null,
    supplier: po.supplier ?? null,
    purchaseNote: po.purchaseNote ?? null,
    createdAt: po.createdAt ?? null,
    items: mapPurchaseRequestItemsToPurchaseOrderItems(request.items),
  };
}

function findPurchaseOrderInMockStore(id) {
  const store = getMockStore();
  const direct = store.purchaseOrders?.find((entry) => entry.id === id);
  if (direct) return { ...direct, items: direct.items.map((row) => ({ ...row })) };

  const request = store.purchaseRequests.find(
    (entry) => entry.purchaseOrder?.id === id
  );
  if (!request) return null;

  return buildPurchaseOrderFromRequest({
    ...request,
    items: request.items.map((row) => ({ ...row })),
    purchaseOrder: { ...request.purchaseOrder },
  });
}

function syncPurchaseOrderToRequest(purchaseOrder) {
  const store = getMockStore();
  const request = store.purchaseRequests.find(
    (entry) => entry.id === purchaseOrder.purchaseRequestId
  );

  if (request?.purchaseOrder) {
    request.purchaseOrder.status = purchaseOrder.status;
    request.purchaseOrder.processingNote = purchaseOrder.processingNote;
  }

  const index = store.purchaseOrders?.findIndex((entry) => entry.id === purchaseOrder.id);
  if (index >= 0) {
    store.purchaseOrders[index] = {
      ...store.purchaseOrders[index],
      status: purchaseOrder.status,
      processingNote: purchaseOrder.processingNote,
    };
  }
}

async function getPurchaseOrderMock(id) {
  await mockDelay();
  const item = findPurchaseOrderInMockStore(id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy đơn mua hàng." });
  }
  return item;
}

async function updatePurchaseOrderStatusMock(id, payload) {
  await mockDelay();

  const item = findPurchaseOrderInMockStore(id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy đơn mua hàng." });
  }

  const currentStatus = String(item.status || "CREATED").toUpperCase();
  const nextStatus = String(payload.status || "").toUpperCase();
  const allowed = getAllowedNextPurchaseOrderStatuses(currentStatus);

  if (!nextStatus) {
    throw new ApiError(400, { message: "Vui lòng chọn trạng thái mua hàng." });
  }

  if (!allowed.includes(nextStatus)) {
    throw new ApiError(400, {
      message: `Không thể chuyển từ "${PURCHASE_ORDER_STATUS_LABELS[currentStatus] || currentStatus}" sang "${PURCHASE_ORDER_STATUS_LABELS[nextStatus] || nextStatus}".`,
    });
  }

  item.status = nextStatus;
  item.processingNote = payload.processingNote?.trim() || null;
  syncPurchaseOrderToRequest(item);

  return {
    message: "Cập nhật trạng thái mua hàng thành công.",
    status: nextStatus,
    processingNote: item.processingNote,
    purchaseOrder: {
      ...item,
      items: item.items.map((row) => ({ ...row })),
    },
  };
}

export async function getPurchaseOrder(id) {
  if (isMockMode()) return getPurchaseOrderMock(id);

  const raw = await apiRequest(`/api/purchase-orders/${id}`);
  return normalizePurchaseOrderFromApi(raw);
}

export async function updatePurchaseOrderStatus(id, payload) {
  if (isMockMode()) return updatePurchaseOrderStatusMock(id, payload);

  const raw = await apiRequest(`/api/purchase-orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(toApiPurchaseOrderStatusPayload(payload)),
  });

  return normalizePurchaseOrderStatusUpdate(raw);
}

export function formatPurchaseOrderDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Đồng bộ đơn mua hàng vào mock store khi tạo từ yêu cầu mua hộ. */
export function registerPurchaseOrderInMockStore(request) {
  if (!request?.purchaseOrder) return;

  const store = getMockStore();
  if (!store.purchaseOrders) store.purchaseOrders = [];

  const record = buildPurchaseOrderFromRequest({
    ...request,
    purchaseOrder: {
      ...request.purchaseOrder,
      status: request.purchaseOrder.status ?? "CREATED",
    },
  });

  const existingIndex = store.purchaseOrders.findIndex((entry) => entry.id === record.id);
  if (existingIndex >= 0) {
    store.purchaseOrders[existingIndex] = record;
  } else {
    store.purchaseOrders.push(record);
  }
}
