import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import {
  normalizeReceivingNoteCreateResponse,
  normalizeReceivingNoteFromApi,
  normalizeWarehouseListResponse,
  resolveConsignmentPackageCount,
  toApiReceivingNotePayload,
} from "@/utils/apiMappers";
import { getStaffConsignment } from "@/utils/orderConsignmentService";

/** Trạng thái phiếu còn hiệu lực — không cho tạo lại. */
export const ACTIVE_RECEIVING_NOTE_STATUSES = ["ACTIVE", "PENDING", "OPEN", "IN_EFFECT"];

export const RECEIVING_NOTE_STATUS_LABELS = {
  ACTIVE: "Đang hiệu lực",
  PENDING: "Chờ tiếp nhận",
  OPEN: "Đang mở",
  IN_EFFECT: "Đang hiệu lực",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  CLOSED: "Đã đóng",
};

export function isActiveReceivingNoteStatus(status) {
  if (!status) return false;
  return ACTIVE_RECEIVING_NOTE_STATUSES.includes(String(status).toUpperCase());
}

export function canCreateReceivingNote(consignment, existingNote) {
  if (!consignment || consignment.status !== "APPROVED") return false;
  if (!existingNote) return true;
  return !isActiveReceivingNoteStatus(existingNote.status);
}

export function getExpectedItems(consignment) {
  if (Array.isArray(consignment?.items) && consignment.items.length > 0) {
    return consignment.items.map((item) => ({
      productName: item.productName ?? "—",
      quantity: item.quantity ?? 0,
      weight: item.weight,
    }));
  }

  if (consignment?.productName) {
    return [
      {
        productName: consignment.productName,
        quantity: consignment.quantity ?? 0,
      },
    ];
  }

  return [];
}

/** Số kiện dự kiến — khớp chi tiết đơn / báo giá. */
export function getExpectedPackageCount(consignment) {
  return (
    resolveConsignmentPackageCount({
      packageCount: consignment?.packageCount,
      items: consignment?.items,
      quantity: consignment?.quantity,
    }) ?? 0
  );
}

export function getExpectedTotalQuantity(consignment) {
  const packages = getExpectedPackageCount(consignment);
  if (packages > 0) return packages;

  const items = getExpectedItems(consignment);
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

async function listWarehousesMock() {
  await mockDelay();
  return getMockStore().warehouses.map((item) => ({ ...item }));
}

async function getActiveReceivingNoteMock(consignmentOrderId) {
  await mockDelay();
  const note = getMockStore().warehouseReceivingNotes.find(
    (entry) =>
      entry.consignmentOrderId === consignmentOrderId &&
      isActiveReceivingNoteStatus(entry.status)
  );
  return note ? { ...note } : null;
}

async function createReceivingNoteMock({ consignmentOrderId, warehouseId, warehouseNote }) {
  await mockDelay();

  const consignment = getMockStore().staffConsignments.find((item) => item.id === consignmentOrderId);
  if (!consignment) {
    throw new ApiError(404, { message: "Không tìm thấy yêu cầu ký gửi." });
  }
  if (consignment.status !== "APPROVED") {
    throw new ApiError(400, { message: "Chỉ tạo phiếu tiếp nhận kho từ yêu cầu đã duyệt (APPROVED)." });
  }

  const existing = await getActiveReceivingNoteMock(consignmentOrderId);
  if (existing) {
    throw new ApiError(409, {
      message: "Yêu cầu đã có phiếu tiếp nhận kho đang hiệu lực.",
    });
  }

  const warehouse = getMockStore().warehouses.find((item) => item.id === warehouseId);
  if (!warehouse) {
    throw new ApiError(400, { message: "Kho tiếp nhận không hợp lệ." });
  }

  const receivingNoteCode = `WRN-${Date.now().toString().slice(-8)}`;
  const entry = {
    id: nextMockId("WRN"),
    receivingNoteCode,
    consignmentOrderId,
    warehouseId,
    warehouseName: warehouse.name,
    warehouseNote: warehouseNote?.trim() || "",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  getMockStore().warehouseReceivingNotes.unshift(entry);

  return {
    message: "Gửi phiếu tiếp nhận kho thành công. Kho nhận thông tin online trên hệ thống.",
    receivingNote: { ...entry },
  };
}

export async function listReceivingWarehouses() {
  if (isMockMode()) return listWarehousesMock();

  const raw = await apiRequest("/api/warehouses/active");
  return normalizeWarehouseListResponse(raw);
}

export async function getActiveReceivingNoteByConsignment(consignmentOrderId) {
  if (isMockMode()) return getActiveReceivingNoteMock(consignmentOrderId);

  try {
    const raw = await apiRequest(
      `/api/warehouse-receiving-notes/by-consignment/${consignmentOrderId}`
    );
    return normalizeReceivingNoteFromApi(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getReceivingNotePageData(consignmentOrderId) {
  const [consignment, warehouses, receivingNote] = await Promise.all([
    getStaffConsignment(consignmentOrderId),
    listReceivingWarehouses(),
    getActiveReceivingNoteByConsignment(consignmentOrderId),
  ]);

  return {
    consignment,
    warehouses,
    receivingNote,
    canCreate: canCreateReceivingNote(consignment, receivingNote),
  };
}

export async function createReceivingNote(payload) {
  if (isMockMode()) return createReceivingNoteMock(payload);

  const raw = await apiRequest("/api/warehouse-receiving-notes", {
    method: "POST",
    body: JSON.stringify(toApiReceivingNotePayload(payload)),
  });

  return normalizeReceivingNoteCreateResponse(raw);
}
