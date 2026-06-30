import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequestWithMockFallback } from "@/utils/apiClient";
import {
  normalizePurchaseRequestFromApi,
  normalizePurchaseRequestListResponse,
  normalizePurchaseRequestStatusUpdate,
  toApiPurchaseRequestStatusPayload,
  toApiPurchaseRequestQuotationPayload,
  normalizePurchaseRequestQuotationResponse,
  toApiPurchaseRequestPurchaseOrderPayload,
  normalizePurchaseRequestPurchaseOrderResponse,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";
import { registerPurchaseOrderInMockStore } from "@/utils/purchaseOrderService";

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

/** Trạng thái đã sang bước báo giá — ẩn nút xử lý. */
const QUOTATION_PHASE_STATUSES = new Set([
  "QUOTATION",
  "QUOTED",
  "CONFIRMED",
  "PURCHASE_ORDER_CREATED",
  "APPROVED",
  "COMPLETED",
  "CANCELLED",
]);

const TERMINAL_STATUSES = new Set(["REJECTED", "NEED_MORE_INFO"]);

export function canStaffProcessPurchaseRequest(status) {
  const normalized = String(status || "").toUpperCase();
  if (QUOTATION_PHASE_STATUSES.has(normalized)) return false;
  if (TERMINAL_STATUSES.has(normalized)) return false;
  return normalized === "PENDING" || normalized === "IN_REVIEW";
}

export function canAcceptPurchaseRequest(status) {
  return String(status || "").toUpperCase() === "PENDING";
}

/** Chỉ yêu cầu đang xử lý mới được tạo báo giá. */
export function canStaffCreateQuotation(status) {
  return String(status || "").toUpperCase() === "IN_REVIEW";
}

/** Customer đã xác nhận báo giá và chưa có đơn mua hàng. */
export function canStaffCreatePurchaseOrder(detail) {
  if (!detail) return false;
  const status = String(detail.status || "").toUpperCase();
  if (status !== "CONFIRMED") return false;
  return !detail.purchaseOrder;
}

export function getQuotedUnitPrice(item, quotation) {
  const quotedLine = quotation?.items?.find((row) => row.itemId === item.id);
  const price = quotedLine?.unitPrice ?? item.unitPrice;
  return price != null && price !== "" ? Number(price) : null;
}

export function calculateQuotationTotal({ items, purchaseServiceFee, estimatedShippingFee }) {
  const productsTotal = items.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + unitPrice * quantity;
  }, 0);

  const serviceFee = Number(purchaseServiceFee) || 0;
  const shippingFee =
    estimatedShippingFee === "" || estimatedShippingFee == null
      ? 0
      : Number(estimatedShippingFee) || 0;

  return Math.round((productsTotal + serviceFee + shippingFee) * 100) / 100;
}

export function formatQuotationAmount(amount) {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function buildQuery({ search, status }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function filterPurchaseRequests(items, { search, status }) {
  let filtered = items;

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.requestCode.toLowerCase().includes(query) ||
        item.customerName.toLowerCase().includes(query) ||
        item.items.some((product) => product.productName.toLowerCase().includes(query))
    );
  }

  return filtered.map((item) => ({ ...item, items: item.items.map((entry) => ({ ...entry })) }));
}

async function listPurchaseRequestsMock(params = {}) {
  await mockDelay();
  return filterPurchaseRequests(getMockStore().purchaseRequests, params);
}

async function getPurchaseRequestMock(id) {
  await mockDelay();
  const item = getMockStore().purchaseRequests.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu mua hộ." });
  }
  return {
    ...item,
    items: item.items.map((entry) => ({ ...entry })),
  };
}

async function updatePurchaseRequestStatusMock(id, { status, reason }) {
  await mockDelay();

  const item = getMockStore().purchaseRequests.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu mua hộ." });
  }

  if (!canStaffProcessPurchaseRequest(item.status)) {
    throw new ApiError(400, {
      message: "Yêu cầu đã chuyển sang bước báo giá hoặc không thể xử lý thêm.",
    });
  }

  const nextStatus = String(status || "").toUpperCase();

  if (nextStatus === "IN_REVIEW") {
    if (item.status !== "PENDING") {
      throw new ApiError(400, { message: "Chỉ có thể nhận xử lý yêu cầu đang chờ." });
    }
    item.status = "IN_REVIEW";
    item.statusReason = null;
  } else if (nextStatus === "NEED_MORE_INFO") {
    const statusReason = reason?.trim();
    if (!statusReason) {
      throw new ApiError(400, { message: "Vui lòng nhập lý do yêu cầu bổ sung thông tin." });
    }
    item.status = "NEED_MORE_INFO";
    item.statusReason = statusReason;
  } else if (nextStatus === "REJECTED") {
    const statusReason = reason?.trim();
    if (!statusReason) {
      throw new ApiError(400, { message: "Vui lòng nhập lý do từ chối." });
    }
    item.status = "REJECTED";
    item.statusReason = statusReason;
  } else {
    throw new ApiError(400, { message: "Trạng thái cập nhật không hợp lệ." });
  }

  return {
    message: "Cập nhật trạng thái yêu cầu mua hộ thành công.",
    status: item.status,
    statusReason: item.statusReason,
    purchaseRequest: { ...item, items: item.items.map((entry) => ({ ...entry })) },
  };
}

export async function listPurchaseRequests(params = {}) {
  if (isMockMode()) return listPurchaseRequestsMock(params);

  const raw = await apiRequestWithMockFallback(
    `/api/purchase-requests${buildQuery(params)}`,
    {},
    () => listPurchaseRequestsMock(params)
  );
  return normalizePurchaseRequestListResponse(raw);
}

export async function getPurchaseRequest(id) {
  if (isMockMode()) return getPurchaseRequestMock(id);

  const raw = await apiRequestWithMockFallback(
    `/api/purchase-requests/${id}`,
    {},
    () => getPurchaseRequestMock(id)
  );
  return normalizePurchaseRequestFromApi(raw);
}

export async function updatePurchaseRequestStatus(id, payload) {
  if (isMockMode()) return updatePurchaseRequestStatusMock(id, payload);

  const raw = await apiRequestWithMockFallback(
    `/api/purchase-requests/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify(toApiPurchaseRequestStatusPayload(payload)),
    },
    () => updatePurchaseRequestStatusMock(id, payload)
  );

  return normalizePurchaseRequestStatusUpdate(raw);
}

async function createPurchaseRequestQuotationMock(id, payload) {
  await mockDelay();

  const item = getMockStore().purchaseRequests.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu mua hộ." });
  }

  if (!canStaffCreateQuotation(item.status)) {
    throw new ApiError(400, {
      message:
        "Không thể tạo báo giá. Yêu cầu phải ở trạng thái đang xử lý (IN_REVIEW) sau khi kiểm tra sản phẩm.",
    });
  }

  const purchaseServiceFee = Number(payload.purchaseServiceFee) || 0;
  if (purchaseServiceFee < 0) {
    throw new ApiError(400, { message: "Phí mua hộ không hợp lệ." });
  }

  const estimatedShippingFee =
    payload.estimatedShippingFee === "" || payload.estimatedShippingFee == null
      ? null
      : Number(payload.estimatedShippingFee);

  if (estimatedShippingFee != null && estimatedShippingFee < 0) {
    throw new ApiError(400, { message: "Phí vận chuyển dự kiến không hợp lệ." });
  }

  const quotedItems = payload.items.map((entry) => {
    const product = item.items.find((row) => row.id === entry.itemId);
    if (!product) {
      throw new ApiError(400, { message: "Sản phẩm trong báo giá không hợp lệ." });
    }

    const unitPrice = Number(entry.unitPrice);
    const quantity = Number(entry.quantity) || product.quantity;

    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      throw new ApiError(400, {
        message: `Vui lòng nhập giá hợp lệ cho "${product.productName}".`,
      });
    }

    product.unitPrice = unitPrice;

    return {
      itemId: product.id,
      unitPrice,
      quantity,
      lineTotal: Math.round(unitPrice * quantity * 100) / 100,
    };
  });

  const totalAmount = calculateQuotationTotal({
    items: quotedItems,
    purchaseServiceFee,
    estimatedShippingFee,
  });

  item.status = "QUOTED";
  item.quotation = {
    purchaseServiceFee,
    estimatedShippingFee,
    totalAmount,
    quotationNote: payload.quotationNote?.trim() || null,
    createdAt: new Date().toISOString(),
    items: quotedItems,
  };

  return {
    message: "Gửi báo giá cho khách hàng thành công.",
    status: "QUOTED",
    totalAmount,
    purchaseRequest: {
      ...item,
      items: item.items.map((row) => ({ ...row })),
      quotation: { ...item.quotation, items: quotedItems.map((row) => ({ ...row })) },
    },
  };
}

export async function createPurchaseRequestQuotation(id, payload) {
  if (isMockMode()) return createPurchaseRequestQuotationMock(id, payload);

  const raw = await apiRequestWithMockFallback(
    `/api/purchase-requests/${id}/quotation`,
    {
      method: "POST",
      body: JSON.stringify(toApiPurchaseRequestQuotationPayload(payload)),
    },
    () => createPurchaseRequestQuotationMock(id, payload)
  );

  return normalizePurchaseRequestQuotationResponse(raw);
}

async function createPurchaseRequestPurchaseOrderMock(id, payload) {
  await mockDelay();

  const item = getMockStore().purchaseRequests.find((entry) => entry.id === id);
  if (!item) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu mua hộ." });
  }

  if (String(item.status || "").toUpperCase() !== "CONFIRMED") {
    throw new ApiError(400, {
      message:
        "Không thể tạo đơn mua hàng. Yêu cầu phải được Customer xác nhận báo giá (CONFIRMED).",
    });
  }

  if (item.purchaseOrder) {
    throw new ApiError(409, {
      message: "Yêu cầu mua hộ này đã có đơn mua hàng. Không thể tạo trùng.",
    });
  }

  if (!item.quotation) {
    throw new ApiError(400, {
      message: "Không tìm thấy báo giá đã xác nhận cho yêu cầu này.",
    });
  }

  const purchaseOrder = {
    id: `PO-${id}`,
    purchaseOrderCode: `PO-${item.requestCode}`,
    supplier: payload.supplier?.trim() || null,
    purchaseNote: payload.purchaseNote?.trim() || null,
    status: "CREATED",
    processingNote: null,
    createdAt: new Date().toISOString(),
  };

  item.purchaseOrder = purchaseOrder;
  item.status = "PURCHASE_ORDER_CREATED";

  registerPurchaseOrderInMockStore({
    ...item,
    items: item.items.map((row) => ({ ...row })),
    purchaseOrder: { ...purchaseOrder },
  });

  return {
    message: "Tạo đơn mua hàng thành công.",
    status: "PURCHASE_ORDER_CREATED",
    purchaseOrder: { ...purchaseOrder },
    purchaseRequest: {
      ...item,
      items: item.items.map((row) => ({ ...row })),
      quotation: item.quotation
        ? { ...item.quotation, items: item.quotation.items.map((row) => ({ ...row })) }
        : null,
      purchaseOrder: { ...purchaseOrder },
    },
  };
}

export async function createPurchaseRequestPurchaseOrder(id, payload) {
  if (isMockMode()) return createPurchaseRequestPurchaseOrderMock(id, payload);

  const raw = await apiRequestWithMockFallback(
    `/api/purchase-requests/${id}/purchase-order`,
    {
      method: "POST",
      body: JSON.stringify(toApiPurchaseRequestPurchaseOrderPayload(payload)),
    },
    () => createPurchaseRequestPurchaseOrderMock(id, payload)
  );

  return normalizePurchaseRequestPurchaseOrderResponse(raw);
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
