import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/shared/mocks/mockStore";

const STATUS_STYLES = {
  Pending: "bg-warning-bg text-warning-text",
  Approved: "bg-success-bg text-success-text",
  Processing: "bg-info-bg text-info-text",
  Draft: "bg-surface text-muted",
};

export async function listPurchaseRequests() {
  await mockDelay();
  return getMockStore().purchaseRequests.map((item) => ({ ...item }));
}

export async function createPurchaseRequest(payload) {
  await mockDelay();

  const request = {
    id: nextMockId("PR"),
    productLink: payload.productLink || "",
    productName: payload.productName,
    quantity: Number(payload.quantity) || 0,
    destination: payload.destination,
    status: payload.status || "Pending",
    statusClass: STATUS_STYLES[payload.status || "Pending"],
    requiredBy: payload.requiredBy || "",
  };

  getMockStore().purchaseRequests.unshift(request);
  return { message: "Gửi yêu cầu mua hàng thành công.", request };
}

export async function savePurchaseRequestDraft(payload) {
  await mockDelay();
  return createPurchaseRequest({ ...payload, status: "Draft" });
}

export function getWarehouses() {
  return getMockStore().transfer.warehouses;
}
