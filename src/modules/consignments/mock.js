import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";
import {
  normalizeConsignmentDetail,
  normalizeConsignmentSummary,
} from "./mappers";
import {
  canStaffSendConsignmentQuotation,
  canCustomerAcceptConsignmentQuotation,
  canCustomerRejectConsignmentQuotation,
  canStaffUpdateConsignmentStatus,
  canStaffRejectConsignmentStatus,
  formatConsignmentDisplayCode,
} from "./helpers";

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

export function sortItems(items, sortBy, sortDir = "asc") {
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
export function toFilterArray(value) {
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

export function filterConsignments(items, { status, search, consignmentType, dateFrom, dateTo }) {
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

export function paginateItems(items, { page = 1, pageSize = 10 } = {}) {
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

export async function listStaffConsignmentsMock({
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

export async function getStaffConsignmentMock(id) {
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

export async function updateStaffConsignmentStatusMock(orderId, { status, rejectionReason }) {
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

export async function createConsignmentOrderMock(payload) {
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

export async function validateConsignmentItemsMock(payload) {
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

export async function createStaffConsignmentMock(payload) {
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
    totalVolume: Number(payload.volumeM3) || 0,
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

export async function sendConsignmentQuotationMock(orderId, payload) {
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

export async function acceptConsignmentQuotationMock(orderId) {
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

export async function rejectConsignmentQuotationMock(orderId, { rejectionReason }) {
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
