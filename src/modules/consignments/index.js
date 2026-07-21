import { isMockMode } from "@/utils/mocks/dataSource";
import {
  listStaffConsignmentsApi,
  getStaffConsignmentApi,
  updateStaffConsignmentStatusApi,
  createConsignmentOrderApi,
  validateConsignmentItemsApi,
  createStaffConsignmentApi,
  acceptConsignmentQuotationApi,
  rejectConsignmentQuotationApi,
  sendConsignmentQuotationApi,
} from "./api";
import {
  listStaffConsignmentsMock,
  getStaffConsignmentMock,
  updateStaffConsignmentStatusMock,
  createConsignmentOrderMock,
  validateConsignmentItemsMock,
  createStaffConsignmentMock,
  sendConsignmentQuotationMock,
  acceptConsignmentQuotationMock,
  rejectConsignmentQuotationMock,
} from "./mock";
import { isImageReferenceUrl } from "./mappers";

export {
  normalizeConsignmentStatus,
  preferFilledField,
  mergeConsignmentDetail,
  normalizeConsignmentSummary,
  normalizeConsignmentListResponse,
  normalizeConsignmentQuotationFromApi,
  isImageReferenceUrl,
  resolveConsignmentPackageCount,
  normalizeConsignmentDetail,
  normalizeConsignmentStatusUpdate,
  normalizeReceivingNoteFromApi,
  normalizeReceivingNoteCreateResponse,
  toApiReceivingNotePayload,
  normalizeEstimateQuotationResponse,
  toApiCreateQuotationRequest,
  normalizeValidateItemsResponse,
  toApiValidateItemsPayload,
  toApiStaffConsignmentPayload,
  normalizeStaffConsignmentCreateResponse,
} from "./mappers";

export {
  CONSIGNMENT_APPROVABLE_STATUSES,
  CONSIGNMENT_APPROVABLE_STATUS,
  canStaffSendConsignmentQuotation,
  canCustomerAcceptConsignmentQuotation,
  canCustomerRejectConsignmentQuotation,
  canStaffUpdateConsignmentStatus,
  canStaffRejectConsignmentStatus,
  formatConsignmentDisplayCode,
  formatConsignmentPageTitle,
  formatConsignmentDate,
} from "./helpers";

export * from "./quotation";
export * from "./receiving";

export const CONSIGNMENT_TYPE_LABELS = {
  PURCHASE_ORDER: "Mua hộ",
  CONSIGNMENT: "Ký gửi hàng",
  PURCHASE_AND_SHIP: "Mua hộ + Vận chuyển",
  EXPRESS: "Express",
  STANDARD: "Standard",
  CONSOLIDATION: "Consolidation",
  ECONOMY: "Economy",
  FREIGHT: "Freight",
  Express: "Express",
  Standard: "Standard",
  Economy: "Economy",
};

export const CONSIGNMENT_TYPE_FILTER_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "STANDARD", label: "Standard" },
  { value: "EXPRESS", label: "Express" },
  { value: "CONSOLIDATION", label: "Consolidation" },
  { value: "ECONOMY", label: "Economy" },
  { value: "FREIGHT", label: "Freight" },
];

export const CONSIGNMENT_STATUS_LABELS = {
  PENDING_REVIEW: "Chờ báo giá",
  QUOTATION_SENT: "Đã gửi báo giá",
  QUOTATION_CONFIRMED: "Khách đã xác nhận báo giá",
  QUOTATION_REJECTED: "Khách từ chối báo giá",
  // BE origin/dev (ConsignmentPaymentService): confirm+pay → WAITING_DEPOSIT; webhook cọc → DEPOSIT_PAID.
  WAITING_DEPOSIT: "Chờ thanh toán đặt cọc",
  WAITING_PAYMENT: "Chờ thanh toán đặt cọc", // alias cũ
  DEPOSIT_PAID: "Đã thanh toán đặt cọc",
  WAITING_FINAL_PAYMENT: "Chờ thanh toán cuối",
  PAYMENT_CONFIRMED: "Đã xác nhận thanh toán",
  PAID: "Đã thanh toán đủ",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  IN_PROGRESS: "Đang xử lý",
  WAITING_FOR_PARCEL: "Chờ hàng về kho",
  // Check-in kiện — chưa chắc đã put-away / ghi tồn.
  IN_WAREHOUSE: "Đã check-in tại kho",
  WAREHOUSE_RECEIVED: "Đã nhận tại kho (check-in)",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export const CONSIGNMENT_STATUS_STYLES = {
  PENDING_REVIEW: "bg-warning-bg text-warning-text border-2 border-primary",
  QUOTATION_SENT: "bg-info-bg text-info-text border-2 border-primary",
  QUOTATION_CONFIRMED: "bg-success-bg text-success-text border-2 border-primary",
  QUOTATION_REJECTED: "bg-danger-bg text-danger border-2 border-danger-border",
  WAITING_DEPOSIT: "bg-warning-bg text-warning-text border-2 border-primary",
  WAITING_PAYMENT: "bg-warning-bg text-warning-text border-2 border-primary",
  DEPOSIT_PAID: "bg-success-bg text-success-text border-2 border-primary",
  WAITING_FINAL_PAYMENT: "bg-warning-bg text-warning-text border-2 border-primary",
  PAYMENT_CONFIRMED: "bg-success-bg text-success-text border-2 border-primary",
  PAID: "bg-success-bg text-success-text border-2 border-primary",
  APPROVED: "bg-success-bg text-success-text border-2 border-primary",
  REJECTED: "bg-danger-bg text-danger border-2 border-danger-border",
  IN_PROGRESS: "bg-info-bg text-info-text border-2 border-primary",
  WAITING_FOR_PARCEL: "bg-warning-bg text-warning-text border-2 border-primary",
  IN_WAREHOUSE: "bg-info-bg text-info-text border-2 border-primary",
  WAREHOUSE_RECEIVED: "bg-info-bg text-info-text border-2 border-primary",
  CANCELLED: "bg-surface-muted text-ink border-2 border-border",
  COMPLETED: "bg-success-bg text-success-text border-2 border-primary",
};

export const CONSIGNMENT_STATUS_ICONS = {
  PENDING_REVIEW: "lucide:clock",
  QUOTATION_SENT: "lucide:send",
  QUOTATION_CONFIRMED: "lucide:check-circle",
  QUOTATION_REJECTED: "lucide:x-circle",
  WAITING_DEPOSIT: "lucide:wallet",
  WAITING_PAYMENT: "lucide:wallet",
  DEPOSIT_PAID: "lucide:badge-check",
  WAITING_FINAL_PAYMENT: "lucide:wallet",
  PAYMENT_CONFIRMED: "lucide:badge-check",
  PAID: "lucide:circle-dollar-sign",
  APPROVED: "lucide:package-check",
  REJECTED: "lucide:ban",
  IN_PROGRESS: "lucide:truck",
  WAITING_FOR_PARCEL: "lucide:package-search",
  IN_WAREHOUSE: "lucide:warehouse",
  WAREHOUSE_RECEIVED: "lucide:package",
  CANCELLED: "lucide:minus-circle",
  COMPLETED: "lucide:circle-check",
};

export const ITEM_VALIDATION_STYLES = {
  BANNED: "bg-danger/10 text-danger border-danger/30",
  RESTRICTED: "bg-warning-bg text-warning-text border-warning/30",
  CONDITIONAL: "bg-info-bg text-info-text border-info/30",
};

export const ITEM_VALIDATION_LABELS = {
  BANNED: "Cấm tuyệt đối",
  RESTRICTED: "Hạn chế",
  CONDITIONAL: "Có điều kiện",
};

/**
 * @param {{
 *   page?: number;
 *   pageSize?: number;
 *   status?: string | string[];
 *   search?: string;
 *   consignmentType?: string | string[];
 *   dateFrom?: string;
 *   dateTo?: string;
 *   sortBy?: "code" | "customerName" | "consignmentType" | "status" | "createdAt";
 *   sortDir?: "asc" | "desc";
 * }} params
 */
export async function listStaffConsignments(params = {}) {
  if (isMockMode()) return listStaffConsignmentsMock(params);
  return listStaffConsignmentsApi(params);
}

export async function getStaffConsignment(id) {
  if (isMockMode()) return getStaffConsignmentMock(id);
  return getStaffConsignmentApi(id);
}

/**
 * @param {string} orderId
 * @param {{ status: "APPROVED" | "REJECTED"; rejectionReason?: string }} payload
 */
export async function updateStaffConsignmentStatus(orderId, payload) {
  if (isMockMode()) return updateStaffConsignmentStatusMock(orderId, payload);
  return updateStaffConsignmentStatusApi(orderId, payload);
}

/** Danh sách ký gửi — dùng chung staff/customer (BE lọc theo token). */
export async function listConsignments(params = {}) {
  return listStaffConsignments(params);
}

export async function createConsignmentOrder(payload) {
  if (isMockMode()) return createConsignmentOrderMock(payload);
  return createConsignmentOrderApi(payload);
}

export async function validateConsignmentItems(payload) {
  if (isMockMode()) return validateConsignmentItemsMock(payload);
  return validateConsignmentItemsApi(payload);
}

export async function createStaffConsignment(payload) {
  if (isMockMode()) return createStaffConsignmentMock(payload);
  return createStaffConsignmentApi(payload);
}

export async function acceptConsignmentQuotation(orderId, quotationId) {
  if (isMockMode()) return acceptConsignmentQuotationMock(orderId);
  return acceptConsignmentQuotationApi(orderId, quotationId);
}

export async function rejectConsignmentQuotation(orderId, payload = {}) {
  if (isMockMode()) return rejectConsignmentQuotationMock(orderId, payload);
  return rejectConsignmentQuotationApi(orderId, payload);
}

export async function sendConsignmentQuotation(orderId, payload) {
  if (isMockMode()) return sendConsignmentQuotationMock(orderId, payload);
  return sendConsignmentQuotationApi(orderId, payload);
}

/** Danh sách ảnh hàng hóa từ chi tiết đơn (items.referenceUrls / imageUrls). */
export function getConsignmentImageEntries(detail) {
  const entries = [];
  const seen = new Set();

  function add(url, productName) {
    const trimmed = url?.trim();
    if (!trimmed || !isImageReferenceUrl(trimmed) || seen.has(trimmed)) return;
    seen.add(trimmed);
    entries.push({ url: trimmed, productName: productName || null });
  }

  for (const item of detail?.items ?? []) {
    if (item.imageUrls?.length) {
      for (const url of item.imageUrls) {
        add(url, item.productName);
      }
    } else {
      add(item.referenceUrl, item.productName);
    }
  }

  for (const url of detail?.images ?? []) {
    add(url, null);
  }

  return entries;
}
