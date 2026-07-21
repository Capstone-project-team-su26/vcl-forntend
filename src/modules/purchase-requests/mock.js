import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";
import { registerPurchaseOrderInMockStore } from "@/modules/purchase-orders/mock";

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

export async function listPurchaseRequestsMock(params = {}) {
  await mockDelay();
  const page = Math.max(1, Number(params.page ?? params.pageNumber) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 5);
  const filtered = filterPurchaseRequests(getMockStore().purchaseRequests, params);
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    totalCount,
    pageNumber: page,
    pageSize,
    totalPages,
  };
}

export async function getPurchaseRequestMock(id) {
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

export async function updatePurchaseRequestStatusMock(id, { status, reason }) {
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

export async function createPurchaseRequestQuotationMock(id, payload) {
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

export async function createPurchaseRequestPurchaseOrderMock(id, payload) {
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
