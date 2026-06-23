import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";

const STATUS_STYLES = {
  Pending: "bg-warning-bg text-warning-text",
  Approved: "bg-success-bg text-success-text",
  Processing: "bg-info-bg text-info-text",
  Draft: "bg-surface text-muted",
};

async function listPurchaseRequestsMock() {
  await mockDelay();
  return getMockStore().purchaseRequests.map((item) => ({ ...item }));
}

async function createPurchaseRequestMock(payload) {
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

export async function listPurchaseRequests() {
  if (isMockMode()) return listPurchaseRequestsMock();

  return apiRequest("/api/PurchaseRequest");
}

export async function createPurchaseRequest(payload) {
  if (isMockMode()) return createPurchaseRequestMock(payload);

  return apiRequest("/api/PurchaseRequest", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function savePurchaseRequestDraft(payload) {
  if (isMockMode()) return createPurchaseRequestMock({ ...payload, status: "Draft" });

  return apiRequest("/api/PurchaseRequest/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getWarehouses() {
  if (isMockMode()) return getMockStore().transfer.warehouses;

  return apiRequest("/api/Warehouse");
}
