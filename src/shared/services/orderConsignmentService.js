import { isMockMode } from "@/shared/config/dataSource";
import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";

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
  COMPLETED: "Hoàn tất",
};

export const CONSIGNMENT_STATUS_STYLES = {
  PENDING_REVIEW: "bg-warning-bg text-warning-text",
  APPROVED: "bg-success-bg text-success-text",
  REJECTED: "bg-danger/10 text-danger",
  IN_PROGRESS: "bg-info-bg text-info-text",
  COMPLETED: "bg-surface text-muted",
};

const STATUS_SORT_ORDER = {
  PENDING_REVIEW: 0,
  IN_PROGRESS: 1,
  APPROVED: 2,
  REJECTED: 3,
  COMPLETED: 4,
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
    throw new Error("Không tìm thấy yêu cầu ký gửi.");
  }
  return { ...item };
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

export function formatConsignmentDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
