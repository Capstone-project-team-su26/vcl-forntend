import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeConsignmentDetail,
  normalizeConsignmentListResponse,
  normalizeConsignmentStatusUpdate,
  normalizeConsignmentSummary,
  normalizeStaffConsignmentCreateResponse,
  normalizeValidateItemsResponse,
  isImageReferenceUrl,
  toApiCreateQuotationRequest,
  toApiStaffConsignmentPayload,
  toApiValidateItemsPayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";
import { formatDateTimeLocal } from "@/utils/dateTime";

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
  IN_WAREHOUSE: "Đã nhập kho",
  WAREHOUSE_RECEIVED: "Đã nhận tại kho",
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
  IN_WAREHOUSE: "bg-info-bg text-info-text border-2 border-primary",
  WAREHOUSE_RECEIVED: "bg-success-bg text-success-text border-2 border-primary",
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
  IN_WAREHOUSE: "lucide:warehouse",
  WAREHOUSE_RECEIVED: "lucide:package",
  CANCELLED: "lucide:minus-circle",
  COMPLETED: "lucide:circle-check",
};

/**
 * Sales được duyệt khi:
 * - Khách xác nhận báo giá (không qua PayOS): QUOTATION_CONFIRMED
 * - Khách đã trả cọc (PayOS webhook): DEPOSIT_PAID
 */
export const CONSIGNMENT_APPROVABLE_STATUSES = ["QUOTATION_CONFIRMED", "DEPOSIT_PAID"];
/** @deprecated Dùng CONSIGNMENT_APPROVABLE_STATUSES */
export const CONSIGNMENT_APPROVABLE_STATUS = "QUOTATION_CONFIRMED";

export function canStaffSendConsignmentQuotation(detail) {
  if (!detail) return false;

  // Chỉ hiện nút gửi báo giá khi:
  // - Khách vừa tạo yêu cầu ký gửi (PENDING_REVIEW), hoặc
  // - Khách không chấp nhận báo giá và yêu cầu Sales báo lại (QUOTATION_REJECTED).
  return detail.status === "PENDING_REVIEW" || detail.status === "QUOTATION_REJECTED";
}

export function canCustomerAcceptConsignmentQuotation(detail) {
  if (!detail) return false;
  return detail.status === "QUOTATION_SENT" && Boolean(detail.quotation);
}

export function canCustomerRejectConsignmentQuotation(detail) {
  if (!detail) return false;
  return detail.status === "QUOTATION_SENT" && Boolean(detail.quotation);
}

export function canStaffUpdateConsignmentStatus(status) {
  return CONSIGNMENT_APPROVABLE_STATUSES.includes(status);
}

/** Sales chỉ từ chối yêu cầu trước khi gửi báo giá. */
export function canStaffRejectConsignmentStatus(status) {
  return status === "PENDING_REVIEW";
}

const STATUS_SORT_ORDER = {
  PENDING_REVIEW: 0,
  QUOTATION_SENT: 0,
  QUOTATION_CONFIRMED: 0,
  QUOTATION_REJECTED: 0,
  WAITING_DEPOSIT: 0,
  WAITING_PAYMENT: 0,
  DEPOSIT_PAID: 0,
  WAITING_FINAL_PAYMENT: 1,
  PAYMENT_CONFIRMED: 1,
  PAID: 1,
  IN_PROGRESS: 1,
  IN_WAREHOUSE: 1,
  WAREHOUSE_RECEIVED: 1,
  APPROVED: 2,
  REJECTED: 3,
  CANCELLED: 4,
  COMPLETED: 5,
};

function buildQuery({ page, pageSize, status, search, consignmentType }) {
  const params = new URLSearchParams();
  params.set("pageNumber", String(page));
  params.set("pageSize", String(pageSize));
  if (status) params.set("status", status);
  if (search) params.set("searchCode", search);
  if (consignmentType) params.set("consignmentType", consignmentType);
  return params.toString();
}

function sortConsignments(items) {
  return [...items].sort((a, b) => {
    const orderA = STATUS_SORT_ORDER[a.status] ?? 99;
    const orderB = STATUS_SORT_ORDER[b.status] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getSortValue(item, sortBy) {
  switch (sortBy) {
    case "code":
      return (formatConsignmentDisplayCode(item) ?? item.consignmentCode ?? item.id ?? "").toString().toLowerCase();
    case "receiverName":
    case "customerName":
      return (item.receiverName ?? item.customerName ?? "").toString().toLowerCase();
    case "consignmentType":
      return (item.consignmentType ?? "").toString().toLowerCase();
    case "status":
      return STATUS_SORT_ORDER[item.status] ?? 99;
    case "createdAt":
    default: {
      const time = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      return Number.isNaN(time) ? 0 : time;
    }
  }
}

function sortItems(items, sortBy, sortDir = "asc") {
  if (!sortBy) return sortConsignments(items);

  const direction = sortDir === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const valueA = getSortValue(a, sortBy);
    const valueB = getSortValue(b, sortBy);
    if (valueA < valueB) return -1 * direction;
    if (valueA > valueB) return 1 * direction;
    return 0;
  });
}

function normalizeConsignmentTypeToken(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

/** Chuẩn hóa filter về mảng string không rỗng (hỗ trợ chọn nhiều giá trị). */
function toFilterArray(value) {
  if (Array.isArray(value)) return value.filter((entry) => entry != null && entry !== "").map(String);
  if (value == null || value === "") return [];
  return [String(value)];
}

function matchesConsignmentType(item, consignmentType) {
  const types = toFilterArray(consignmentType);
  if (!types.length) return true;
  const token = normalizeConsignmentTypeToken(item.consignmentType);
  return types.some((type) => normalizeConsignmentTypeToken(type) === token);
}

function matchesCreatedDateRange(item, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return true;

  const created = item.createdAt ? new Date(item.createdAt) : null;
  if (!created || Number.isNaN(created.getTime())) return false;

  if (dateFrom) {
    const from = new Date(`${dateFrom}T00:00:00`);
    if (created < from) return false;
  }

  if (dateTo) {
    const to = new Date(`${dateTo}T23:59:59.999`);
    if (created > to) return false;
  }

  return true;
}

function filterConsignments(items, { status, search, consignmentType, dateFrom, dateTo }) {
  let filtered = items;

  const statuses = toFilterArray(status);
  if (statuses.length) {
    filtered = filtered.filter((item) => statuses.includes(item.status));
  }

  if (toFilterArray(consignmentType).length) {
    filtered = filtered.filter((item) => matchesConsignmentType(item, consignmentType));
  }

  if (dateFrom || dateTo) {
    filtered = filtered.filter((item) => matchesCreatedDateRange(item, dateFrom, dateTo));
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const code = formatConsignmentDisplayCode(item) ?? item.consignmentCode ?? item.id ?? "";
      const productNames = Array.isArray(item.productNames)
        ? item.productNames.join(" ")
        : item.productName || "";
      const haystack = [
        code,
        item.id,
        item.receiverName,
        item.customerName,
        item.consignmentType,
        productNames,
        item.receiverPhone,
        item.receiverAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return filtered;
}

async function fetchAllConsignmentSummaries({ status, search, consignmentType, maxPages = 20 } = {}) {
  const pageSize = 100;
  const items = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const raw = await apiRequest(
      `/api/orders/consignments?${buildQuery({
        page,
        pageSize,
        status,
        search,
        consignmentType,
      })}`
    );
    const batch = normalizeConsignmentListResponse(raw, { page, pageSize });
    items.push(...(batch.items ?? []));

    if (page >= (batch.totalPages ?? 1)) break;
  }

  return items;
}

function paginateItems(items, { page = 1, pageSize = 10 } = {}) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalCount,
    totalPages: totalCount === 0 ? 1 : totalPages,
  };
}

async function listStaffConsignmentsMock({
  page = 1,
  pageSize = 10,
  status,
  search,
  consignmentType,
  dateFrom,
  dateTo,
  sortBy,
  sortDir,
} = {}) {
  await mockDelay();

  const filtered = sortItems(
    filterConsignments(getMockStore().staffConsignments, {
      status,
      search,
      consignmentType,
      dateFrom,
      dateTo,
    }),
    sortBy,
    sortDir
  ).map(normalizeConsignmentSummary);

  return paginateItems(filtered, { page, pageSize });
}

async function getStaffConsignmentMock(id) {
  await mockDelay();
  const item = getMockStore().staffConsignments.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu ký gửi." });
  }
  return normalizeConsignmentDetail(item);
}

function generateMockTrackingCode() {
  return `SW-${Math.floor(Math.random() * 90000 + 10000)}`;
}

async function updateStaffConsignmentStatusMock(orderId, { status, rejectionReason }) {
  await mockDelay();

  const item = getMockStore().staffConsignments.find((entry) => entry.id === orderId);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu ký gửi." });
  }

  if (status === "REJECTED") {
    if (!canStaffRejectConsignmentStatus(item.status)) {
      throw new ApiError(400, {
        message:
          "Không thể từ chối yêu cầu đã hủy, đã nhập kho hoặc đã được xử lý trước đó.",
      });
    }
    const reason = rejectionReason?.trim();
    if (!reason) {
      throw new ApiError(400, { message: "Vui lòng nhập lý do từ chối." });
    }
    item.status = "REJECTED";
    item.rejectionReason = reason;
    item.trackingCode = undefined;

    return {
      message: "Đã từ chối yêu cầu ký gửi.",
      status: item.status,
      rejectionReason: reason,
      consignment: { ...item },
    };
  }

  if (status === "APPROVED") {
    if (!canStaffUpdateConsignmentStatus(item.status)) {
      throw new ApiError(400, {
        message:
          "Chỉ duyệt yêu cầu sau khi khách đã xác nhận báo giá hoặc đã thanh toán đặt cọc.",
      });
    }
    const trackingCode = generateMockTrackingCode();
    item.status = "APPROVED";
    item.trackingCode = trackingCode;
    item.rejectionReason = undefined;

    return {
      message: "Duyệt yêu cầu thành công.",
      status: item.status,
      trackingCode,
      consignment: { ...item },
    };
  }

  throw new ApiError(400, { message: "Trạng thái cập nhật không hợp lệ." });
}

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

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const statuses = toFilterArray(params.status);
  const types = toFilterArray(params.consignmentType);
  const needsClientFilter = Boolean(
    types.length || params.dateFrom || params.dateTo || params.sortBy || statuses.length > 1
  );

  if (needsClientFilter) {
    const allItems = await fetchAllConsignmentSummaries({
      // Nếu chỉ chọn 1 trạng thái thì để BE lọc sẵn cho nhẹ, còn lại lọc client.
      status: statuses.length === 1 ? statuses[0] : undefined,
      search: params.search,
    });
    const filtered = sortItems(
      filterConsignments(allItems, {
        status: statuses,
        search: params.search,
        consignmentType: types,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      }),
      params.sortBy,
      params.sortDir
    );
    return paginateItems(filtered, { page, pageSize });
  }

  const raw = await apiRequest(
    `/api/orders/consignments?${buildQuery({
      page,
      pageSize,
      status: statuses[0],
      search: params.search,
    })}`
  );

  return normalizeConsignmentListResponse(raw, { page, pageSize });
}

function needsCustomerHydration(detail) {
  if (!detail?.customerId) return false;
  const hasCustomerName =
    detail.customerName && detail.customerName !== "—";
  const hasSenderName = Boolean(detail.senderName);
  const hasSenderPhone = Boolean(detail.senderPhone);
  const hasSenderAddress = Boolean(detail.senderAddress);
  return !hasCustomerName || !hasSenderName || !hasSenderPhone || !hasSenderAddress;
}

async function hydrateConsignmentCustomer(detail) {
  if (!needsCustomerHydration(detail)) return detail;

  try {
    const { getCustomer } = await import("@/utils/customerService");
    const customer = await getCustomer(detail.customerId);
    const customerName =
      customer?.fullName && customer.fullName !== "—" ? customer.fullName : null;
    if (!customerName && !customer?.phone && !customer?.address) return detail;

    return {
      ...detail,
      customer,
      customerName:
        detail.customerName && detail.customerName !== "—"
          ? detail.customerName
          : customerName ?? detail.customerName,
      senderName: detail.senderName ?? customerName ?? detail.customerName,
      senderPhone: detail.senderPhone ?? customer.phone ?? null,
      senderAddress: detail.senderAddress ?? customer.address ?? null,
    };
  } catch {
    // ponytail: BE detail thiếu customer — hydrate best-effort, không chặn xem đơn
    return detail;
  }
}

export async function getStaffConsignment(id) {
  if (isMockMode()) return getStaffConsignmentMock(id);

  const raw = await apiRequest(`/api/orders/consignments/${id}`);
  return hydrateConsignmentCustomer(normalizeConsignmentDetail(raw));
}

/**
 * @param {string} orderId
 * @param {{ status: "APPROVED" | "REJECTED"; rejectionReason?: string }} payload
 */
export async function updateStaffConsignmentStatus(orderId, payload) {
  if (isMockMode()) return updateStaffConsignmentStatusMock(orderId, payload);

  const raw = await apiRequest(`/api/orders/consignments/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return normalizeConsignmentStatusUpdate(raw);
}

/** Danh sách ký gửi — dùng chung staff/customer (BE lọc theo token). */
export async function listConsignments(params = {}) {
  return listStaffConsignments(params);
}

async function createConsignmentOrderMock(payload) {
  await mockDelay();

  const id = nextMockId("ORD");
  const firstItem = payload.items?.[0] ?? {};
  const entry = {
    id,
    consignmentCode: `CN-${id.slice(-6).toUpperCase()}`,
    customerName: "Mock Customer",
    consignmentType: payload.shippingOption || "Express",
    status: "PENDING_REVIEW",
    totalWeight: Number(firstItem.weight) || 0,
    totalVolume: 0,
    createdAt: new Date().toISOString(),
  };

  getMockStore().staffConsignments.unshift(entry);

  return {
    message: "Consignment order successfully created!",
    data: { orderId: id },
  };
}

export async function createConsignmentOrder(payload) {
  if (isMockMode()) return createConsignmentOrderMock(payload);

  return apiRequest("/api/orders/consignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function mapRestrictionToValidationType(restrictionType) {
  if (restrictionType === "PROHIBITED") return "BANNED";
  if (restrictionType === "RESTRICTED") return "RESTRICTED";
  if (restrictionType === "CONDITIONAL") return "CONDITIONAL";
  return null;
}

function findRestrictedMatch(productName) {
  const query = productName?.trim().toLowerCase();
  if (!query) return null;

  return getMockStore().restrictedItems.find(
    (item) =>
      item.isActive &&
      (item.name.toLowerCase().includes(query) || query.includes(item.name.toLowerCase()))
  );
}

async function validateConsignmentItemsMock(payload) {
  await mockDelay();

  const items = (payload.items ?? []).map((item) => {
    const match = findRestrictedMatch(item.productName);
    if (!match) {
      return {
        productName: item.productName,
        restrictionType: null,
        matchedItemName: null,
        message: null,
      };
    }

    const restrictionType = mapRestrictionToValidationType(match.restrictionType);

    return {
      productName: item.productName,
      restrictionType,
      matchedItemName: match.name,
      message: match.notes || null,
    };
  });

  return {
    items,
    hasBanned: items.some((item) => item.restrictionType === "BANNED"),
  };
}

export async function validateConsignmentItems(payload) {
  if (isMockMode()) return validateConsignmentItemsMock(payload);

  const raw = await apiRequest("/api/orders/consignments/validate-items", {
    method: "POST",
    body: JSON.stringify(toApiValidateItemsPayload(payload)),
  });

  return normalizeValidateItemsResponse(raw);
}

async function createStaffConsignmentMock(payload) {
  await mockDelay();

  const customerId = payload.customerId?.trim();
  if (!customerId) {
    throw new ApiError(400, { message: "Vui lòng chọn khách hàng." });
  }

  const customer = getMockStore().customers.find((entry) => entry.id === customerId);
  if (!customer) {
    throw new ApiError(404, { message: "Không tìm thấy khách hàng." });
  }

  const firstItem = payload.items?.[0];
  const productName = firstItem?.productName?.trim();
  if (!productName) {
    throw new ApiError(400, { message: "Vui lòng nhập tên hàng." });
  }

  if (!productName) {
    throw new ApiError(400, { message: "Vui lòng nhập tên hàng." });
  }

  if (!payload.warehouseId && !payload.shippingMethodId && !payload.route?.trim()) {
    throw new ApiError(400, {
      message: "Vui lòng chọn tuyến vận chuyển hoặc kho quốc tế.",
    });
  }

  const validation = await validateConsignmentItemsMock(payload);
  if (validation.hasBanned) {
    throw new ApiError(400, {
      message: "Không thể tạo yêu cầu vì hàng thuộc danh mục cấm tuyệt đối.",
    });
  }

  const id = nextMockId("CG");
  const consignmentCode = `CN-${id.slice(-8).toUpperCase()}`;

  const warehouse = payload.warehouseId
    ? getMockStore().internationalWarehouses?.find((entry) => entry.id === payload.warehouseId)
    : null;

  const shippingMethod = payload.shippingMethodId
    ? getMockStore().shippingMethods.find((entry) => entry.id === payload.shippingMethodId)
    : null;

  const entry = {
    id,
    consignmentCode,
    customerId,
    customerName: customer.fullName,
    consignmentType:
      payload.serviceType ?? warehouse?.code ?? shippingMethod?.code ?? "STANDARD",
    status: "PENDING_REVIEW",
    totalWeight: Number(payload.weightKg ?? firstItem.estimatedWeight) || 0,
    totalVolume: Number(payload.volumeCm3 ?? payload.volumeM3) || 0,
    packageCount: Number(payload.packageCount ?? firstItem.quantity) || 1,
    createdAt: new Date().toISOString(),
    productName,
    quantity: Number(firstItem.quantity) || 1,
    destination: warehouse?.name ?? shippingMethod?.name ?? payload.route ?? "—",
    route: payload.route ?? null,
    warehouseId: payload.warehouseId ?? null,
    warehouseName: warehouse?.name ?? null,
    notes: payload.salesNote?.trim() || "",
    quotation: null,
    items: payload.items,
  };

  getMockStore().staffConsignments.unshift(entry);

  return {
    message: "Tạo yêu cầu ký gửi thay khách thành công. Mở chi tiết để gửi báo giá.",
    orderId: id,
    consignmentCode,
  };
}

export async function createStaffConsignment(payload) {
  if (isMockMode()) return createStaffConsignmentMock(payload);

  const raw = await apiRequest("/api/staff/consignments", {
    method: "POST",
    body: JSON.stringify(toApiStaffConsignmentPayload(payload)),
  });

  return normalizeStaffConsignmentCreateResponse(raw);
}

async function sendConsignmentQuotationMock(orderId, payload) {
  await mockDelay();

  const item = getMockStore().staffConsignments.find((entry) => entry.id === orderId);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu ký gửi." });
  }

  if (!canStaffSendConsignmentQuotation(item)) {
    throw new ApiError(400, {
      message: "Yêu cầu này không thể gửi báo giá (đã gửi hoặc không ở trạng thái chờ báo giá).",
    });
  }

  const quotation = payload.quotation;
  if (!quotation || Number(quotation.total) <= 0) {
    throw new ApiError(400, { message: "Tổng báo giá phải lớn hơn 0." });
  }

  if (item.status === "QUOTATION_REJECTED") {
    item.rejectionReason = undefined;
  }

  if (payload.warehouseId) {
    const warehouse = getMockStore().internationalWarehouses?.find(
      (entry) => entry.id === payload.warehouseId
    );
    item.warehouseId = payload.warehouseId;
    if (warehouse) {
      item.warehouseName = warehouse.name;
      item.destination = warehouse.name;
    }
  }

  if (payload.weightKg != null) item.totalWeight = Number(payload.weightKg) || 0;
  if (payload.volumeCm3 != null || payload.volumeM3 != null) {
    item.totalVolume = Number(payload.volumeCm3 ?? payload.volumeM3) || 0;
  }
  if (payload.packageCount != null) {
    item.packageCount = Number(payload.packageCount) || 1;
  }

  item.quotation = {
    id: `QT-${orderId}`,
    ...quotation,
    sentAt: new Date().toISOString(),
    salesNote: payload.salesNote?.trim() || "",
  };
  item.status = "QUOTATION_SENT";
  if (payload.salesNote?.trim()) {
    item.notes = [item.notes, payload.salesNote.trim()].filter(Boolean).join("\n");
  }

  return {
    message: "Đã gửi báo giá cho khách hàng. Chờ khách xác nhận.",
    status: item.status,
    consignment: { ...item },
  };
}

async function acceptConsignmentQuotationMock(orderId) {
  await mockDelay();

  const item = getMockStore().staffConsignments.find((entry) => entry.id === orderId);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu ký gửi." });
  }

  if (!canCustomerAcceptConsignmentQuotation(item)) {
    throw new ApiError(400, {
      message: "Báo giá này không thể xác nhận (chưa gửi hoặc đã xác nhận trước đó).",
    });
  }

  item.status = "QUOTATION_CONFIRMED";
  item.quotation = {
    ...item.quotation,
    confirmedAt: new Date().toISOString(),
  };

  return {
    message: "Đã xác nhận báo giá. Sales sẽ duyệt yêu cầu và tạo phiếu nhập kho.",
    status: item.status,
    consignment: { ...item },
  };
}

export async function acceptConsignmentQuotation(orderId, quotationId) {
  if (isMockMode()) return acceptConsignmentQuotationMock(orderId);

  const raw = await apiRequest(
    `/api/quotations/${encodeURIComponent(quotationId ?? orderId)}/accept`,
    { method: "PUT" }
  );

  return normalizeConsignmentStatusUpdate(raw);
}

async function rejectConsignmentQuotationMock(orderId, { rejectionReason }) {
  await mockDelay();

  const item = getMockStore().staffConsignments.find((entry) => entry.id === orderId);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu ký gửi." });
  }

  if (!canCustomerRejectConsignmentQuotation(item)) {
    throw new ApiError(400, {
      message: "Báo giá này không thể từ chối (chưa gửi hoặc đã được xử lý).",
    });
  }

  const reason = rejectionReason?.trim();
  if (!reason) {
    throw new ApiError(400, { message: "Vui lòng nhập lý do từ chối báo giá." });
  }

  item.status = "QUOTATION_REJECTED";
  item.quotation = {
    ...item.quotation,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
  };

  return {
    message: "Đã từ chối báo giá. Sales có thể tư vấn và gửi báo giá mới.",
    status: item.status,
    rejectionReason: reason,
    consignment: { ...item },
  };
}

export async function rejectConsignmentQuotation(orderId, payload = {}) {
  if (isMockMode()) return rejectConsignmentQuotationMock(orderId, payload);

  const raw = await apiRequest(
    `/api/orders/${encodeURIComponent(orderId)}/quotation/reject`,
    {
      method: "POST",
      body: JSON.stringify({ rejectionReason: payload.rejectionReason?.trim() }),
    }
  );

  return normalizeConsignmentStatusUpdate(raw);
}

export async function sendConsignmentQuotation(orderId, payload) {
  if (isMockMode()) return sendConsignmentQuotationMock(orderId, payload);

  const apiPayload = toApiCreateQuotationRequest(payload, { forSend: true });

  const raw = await apiRequest(
    `/api/orders/${encodeURIComponent(orderId)}/quotation/send`,
    {
      method: "POST",
      body: JSON.stringify(apiPayload),
    }
  );

  return normalizeConsignmentStatusUpdate(raw);
}

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

export function formatConsignmentDate(isoDate) {
  // Local theo máy user + nhãn UTC±X (không hardcode +7).
  return formatDateTimeLocal(isoDate);
}

/** Danh sách ảnh hàng hóa từ chi tiết đơn (items.referenceUrl / images). */
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

export { isImageReferenceUrl };

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value ?? ""));
}

/** Mã hiển thị cho người dùng — không dùng orderId UUID nội bộ. */
export function formatConsignmentDisplayCode(detail) {
  if (!detail) return null;
  if (detail.consignmentCode) return detail.consignmentCode;
  if (detail.id && !isUuid(detail.id)) return detail.id;
  return null;
}

export function formatConsignmentPageTitle(detail) {
  return formatConsignmentDisplayCode(detail) ?? "Yêu cầu ký gửi";
}
