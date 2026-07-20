import { isMockMode } from "@/utils/mocks/dataSource";
import { getPurchaseOrderApi, updatePurchaseOrderStatusApi } from "./api";
import {
  getPurchaseOrderMock,
  updatePurchaseOrderStatusMock,
  registerPurchaseOrderInMockStore,
  getAllowedNextPurchaseOrderStatuses,
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_TRANSITIONS,
} from "./mock";

export {
  normalizePurchaseOrderFromApi,
  normalizePurchaseOrderStatusUpdate,
  toApiPurchaseOrderStatusPayload,
} from "./mappers";

export {
  registerPurchaseOrderInMockStore,
  getAllowedNextPurchaseOrderStatuses,
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_TRANSITIONS,
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

export function canUpdatePurchaseOrderStatus(status) {
  return getAllowedNextPurchaseOrderStatuses(status).length > 0;
}

export function isWaitingWarehouseReceive(status) {
  return String(status || "").toUpperCase() === "WAITING_WAREHOUSE_RECEIVE";
}

export async function getPurchaseOrder(id) {
  if (isMockMode()) return getPurchaseOrderMock(id);
  return getPurchaseOrderApi(id);
}

export async function updatePurchaseOrderStatus(id, payload) {
  if (isMockMode()) return updatePurchaseOrderStatusMock(id, payload);
  return updatePurchaseOrderStatusApi(id, payload);
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
