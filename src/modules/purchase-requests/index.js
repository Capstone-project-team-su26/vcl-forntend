import { isMockMode } from "@/utils/mocks/dataSource";
import { formatMoney } from "@/modules/service-pricing";
import {
  listPurchaseRequestsApi,
  getPurchaseRequestApi,
  updatePurchaseRequestStatusApi,
  createPurchaseRequestQuotationApi,
  createPurchaseRequestPurchaseOrderApi,
} from "./api";
import {
  listPurchaseRequestsMock,
  getPurchaseRequestMock,
  updatePurchaseRequestStatusMock,
  createPurchaseRequestQuotationMock,
  createPurchaseRequestPurchaseOrderMock,
  canStaffProcessPurchaseRequest,
  canAcceptPurchaseRequest,
  canStaffCreateQuotation,
  canStaffCreatePurchaseOrder,
  getQuotedUnitPrice,
  calculateQuotationTotal,
} from "./mock";

export {
  normalizePurchaseRequestFromApi,
  normalizePurchaseRequestListResponse,
  normalizePurchaseRequestStatusUpdate,
  toApiPurchaseRequestStatusPayload,
  toApiPurchaseRequestQuotationPayload,
  normalizePurchaseRequestQuotationResponse,
  toApiPurchaseRequestPurchaseOrderPayload,
  normalizePurchaseRequestPurchaseOrderResponse,
} from "./mappers";

export {
  canStaffProcessPurchaseRequest,
  canAcceptPurchaseRequest,
  canStaffCreateQuotation,
  canStaffCreatePurchaseOrder,
  getQuotedUnitPrice,
  calculateQuotationTotal,
};

export const PURCHASE_REQUEST_STATUS_LABELS = {
  PENDING: "Chờ xử lý",
  IN_REVIEW: "Đang xử lý",
  NEED_MORE_INFO: "Cần bổ sung thông tin",
  REJECTED: "Từ chối",
  QUOTATION: "Đang báo giá",
  QUOTED: "Đã báo giá",
  CONFIRMED: "Đã xác nhận báo giá",
  PURCHASE_ORDER_CREATED: "Đã tạo đơn mua hàng",
  APPROVED: "Đã duyệt",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export const PURCHASE_REQUEST_STATUS_STYLES = {
  PENDING: "bg-warning-bg text-warning-text",
  IN_REVIEW: "bg-info-bg text-info-text",
  NEED_MORE_INFO: "bg-accent/15 text-accent",
  REJECTED: "bg-danger/10 text-danger",
  QUOTATION: "bg-primary/15 text-primary",
  QUOTED: "bg-secondary/15 text-secondary",
  CONFIRMED: "bg-success-bg text-success-text",
  PURCHASE_ORDER_CREATED: "bg-primary/15 text-primary",
  APPROVED: "bg-success-bg text-success-text",
  COMPLETED: "bg-surface text-muted",
  CANCELLED: "bg-surface text-muted",
};

export function formatQuotationAmount(amount) {
  return formatMoney(amount);
}

export async function listPurchaseRequests(params = {}) {
  if (isMockMode()) return listPurchaseRequestsMock(params);
  return listPurchaseRequestsApi(params);
}

export async function getPurchaseRequest(id) {
  if (isMockMode()) return getPurchaseRequestMock(id);
  return getPurchaseRequestApi(id);
}

export async function updatePurchaseRequestStatus(id, payload) {
  if (isMockMode()) return updatePurchaseRequestStatusMock(id, payload);
  return updatePurchaseRequestStatusApi(id, payload);
}

export async function createPurchaseRequestQuotation(id, payload) {
  if (isMockMode()) return createPurchaseRequestQuotationMock(id, payload);
  return createPurchaseRequestQuotationApi(id, payload);
}

export async function createPurchaseRequestPurchaseOrder(id, payload) {
  if (isMockMode()) return createPurchaseRequestPurchaseOrderMock(id, payload);
  return createPurchaseRequestPurchaseOrderApi(id, payload);
}

export function formatPurchaseRequestDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
