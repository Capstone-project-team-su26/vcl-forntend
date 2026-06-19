import { isMockMode } from "@/shared/config/dataSource";
import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";
import { ApiError } from "@/shared/utils/apiError";

export const CONSIGNMENT_TYPE_LABELS = {
  PURCHASE_ORDER: "Mua hộ",
  CONSIGNMENT: "Ký gửi hàng",
  PURCHASE_AND_SHIP: "Mua hộ + Vận chuyển",
};

export const CONSIGNMENT_STATUS_LABELS = {
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  IN_PROGRESS: "Đang xử lý",
  IN_WAREHOUSE: "Đã nhập kho",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export const CONSIGNMENT_STATUS_STYLES = {
  PENDING_REVIEW: "bg-warning-bg text-warning-text",
  APPROVED: "bg-success-bg text-success-text",
  REJECTED: "bg-danger/10 text-danger",
  IN_PROGRESS: "bg-info-bg text-info-text",
  IN_WAREHOUSE: "bg-info-bg text-info-text",
  CANCELLED: "bg-surface text-muted",
  COMPLETED: "bg-surface text-muted",
};

/** Chỉ PENDING_REVIEW mới được Staff duyệt / từ chối. */
export const CONSIGNMENT_UPDATABLE_STATUS = "PENDING_REVIEW";

export function canStaffUpdateConsignmentStatus(status) {
  return status === CONSIGNMENT_UPDATABLE_STATUS;
}

const STATUS_SORT_ORDER = {
  PENDING_REVIEW: 0,
  IN_PROGRESS: 1,
  IN_WAREHOUSE: 1,
  APPROVED: 2,
  REJECTED: 3,
  CANCELLED: 4,
  COMPLETED: 5,
};

function buildQuery({ page, pageSize, status, search }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (status) params.set("status", status);
  if (search) params.set("search", search);
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
  return { ...item };
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

  if (!canStaffUpdateConsignmentStatus(item.status)) {
    throw new ApiError(400, {
      message:
        "Không thể cập nhật yêu cầu đã hủy, đã nhập kho hoặc đã được xử lý trước đó.",
    });
  }

  if (status === "REJECTED") {
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

  return apiRequest(`/api/orders/consignments?${buildQuery({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    status: params.status,
    search: params.search,
  })}`);
}

export async function getStaffConsignment(id) {
  if (isMockMode()) return getStaffConsignmentMock(id);

  return apiRequest(`/api/orders/consignments/${id}`);
}

/**
 * @param {string} orderId
 * @param {{ status: "APPROVED" | "REJECTED"; rejectionReason?: string }} payload
 */
export async function updateStaffConsignmentStatus(orderId, payload) {
  if (isMockMode()) return updateStaffConsignmentStatusMock(orderId, payload);

  return apiRequest(`/api/orders/consignments/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function formatConsignmentDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
