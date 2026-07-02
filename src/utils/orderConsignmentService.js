import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizeConsignmentDetail,
  normalizeConsignmentListResponse,
  normalizeConsignmentStatusUpdate,
  normalizeStaffConsignmentCreateResponse,
  normalizeValidateItemsResponse,
  isImageReferenceUrl,
  toApiCreateQuotationRequest,
  toApiStaffConsignmentPayload,
  toApiValidateItemsPayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";
import { isDraftConsignmentQuotation } from "@/utils/consignmentQuotationService";

export const CONSIGNMENT_TYPE_LABELS = {
  PURCHASE_ORDER: "Mua hộ",
  CONSIGNMENT: "Ký gửi hàng",
  PURCHASE_AND_SHIP: "Mua hộ + Vận chuyển",
  Express: "Ký gửi — Express",
  Standard: "Ký gửi — Standard",
  Economy: "Ký gửi — Economy",
};

export const CONSIGNMENT_STATUS_LABELS = {
  PENDING_REVIEW: "Chờ báo giá",
  QUOTATION_SENT: "Đã gửi báo giá",
  QUOTATION_CONFIRMED: "Khách đã xác nhận báo giá",
  QUOTATION_REJECTED: "Khách từ chối báo giá",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  IN_PROGRESS: "Đang xử lý",
  IN_WAREHOUSE: "Đã nhập kho",
  WAREHOUSE_RECEIVED: "Đã nhận tại kho",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export const CONSIGNMENT_STATUS_STYLES = {
  PENDING_REVIEW: "bg-warning-bg text-warning-text",
  QUOTATION_SENT: "bg-primary/15 text-primary",
  QUOTATION_CONFIRMED: "bg-success-bg text-success-text",
  QUOTATION_REJECTED: "bg-danger/10 text-danger",
  APPROVED: "bg-success-bg text-success-text",
  REJECTED: "bg-danger/10 text-danger",
  IN_PROGRESS: "bg-info-bg text-info-text",
  IN_WAREHOUSE: "bg-info-bg text-info-text",
  WAREHOUSE_RECEIVED: "bg-info-bg text-info-text",
  CANCELLED: "bg-surface text-muted",
  COMPLETED: "bg-surface text-muted",
};

/** Sales chỉ duyệt sau khi khách xác nhận báo giá. */
export const CONSIGNMENT_APPROVABLE_STATUS = "QUOTATION_CONFIRMED";

export function canStaffSendConsignmentQuotation(detail) {
  if (!detail) return false;
  if (detail.status === "QUOTATION_REJECTED") return true;
  if (detail.status === "PENDING_REVIEW" && isDraftConsignmentQuotation(detail.quotation)) {
    return true;
  }
  return false;
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
  return status === CONSIGNMENT_APPROVABLE_STATUS;
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
  IN_PROGRESS: 1,
  IN_WAREHOUSE: 1,
  WAREHOUSE_RECEIVED: 1,
  APPROVED: 2,
  REJECTED: 3,
  CANCELLED: 4,
  COMPLETED: 5,
};

function buildQuery({ page, pageSize, status, search }) {
  const params = new URLSearchParams();
  params.set("pageNumber", String(page));
  params.set("pageSize", String(pageSize));
  if (status) params.set("status", status);
  if (search) params.set("searchCode", search);
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

function filterConsignments(items, { status, search }) {
  let filtered = items;

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.customerName.toLowerCase().includes(query)
    );
  }

  return filtered;
}

async function listStaffConsignmentsMock({ page = 1, pageSize = 10, status, search } = {}) {
  await mockDelay();

  const filtered = sortConsignments(
    filterConsignments(getMockStore().staffConsignments, { status, search })
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map((item) => ({ ...item }));

  return { items, page, pageSize, totalCount, totalPages };
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
        message: "Chỉ duyệt yêu cầu sau khi khách đã xác nhận báo giá.",
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
 * @param {{ page?: number; pageSize?: number; status?: string; search?: string }} params
 */
export async function listStaffConsignments(params = {}) {
  if (isMockMode()) return listStaffConsignmentsMock(params);

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const raw = await apiRequest(
    `/api/orders/consignments?${buildQuery({
      page,
      pageSize,
      status: params.status,
      search: params.search,
    })}`
  );

  return normalizeConsignmentListResponse(raw, { page, pageSize });
}

export async function getStaffConsignment(id) {
  if (isMockMode()) return getStaffConsignmentMock(id);

  const raw = await apiRequest(`/api/orders/consignments/${id}`);
  return normalizeConsignmentDetail(raw);
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

  if (!payload.warehouseId && !payload.shippingMethodId) {
    throw new ApiError(400, {
      message: "Vui lòng chọn kho quốc tế hoặc phương thức vận chuyển.",
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
    consignmentType: warehouse?.code ?? shippingMethod?.code ?? "CONSIGNMENT",
    status: "PENDING_REVIEW",
    totalWeight: Number(payload.weightKg ?? firstItem.estimatedWeight) || 0,
    totalVolume: Number(payload.volumeM3) || 0,
    packageCount: Number(payload.packageCount ?? firstItem.quantity) || 1,
    createdAt: new Date().toISOString(),
    productName,
    quantity: Number(firstItem.quantity) || 1,
    destination: warehouse?.name ?? shippingMethod?.name ?? "—",
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
  if (payload.volumeM3 != null) item.totalVolume = Number(payload.volumeM3) || 0;
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
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
