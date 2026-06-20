import { isMockMode } from "@/shared/config/dataSource";
import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";

async function getOperationalDashboardMock() {
  await mockDelay();
  const { dashboard } = getMockStore();
  return {
    userName: dashboard.userName,
    activeShipments: dashboard.activeShipments,
    stats: dashboard.stats.map((item) => ({ ...item })),
    recentActivity: dashboard.recentActivity.map((item) => ({ ...item })),
    fuelSurchargeRate: dashboard.fuelSurchargeRate,
  };
}

async function getTransferOptionsMock() {
  await mockDelay();
  const { transfer } = getMockStore();
  return {
    packageTypes: transfer.packageTypes.map((item) => ({ ...item })),
    serviceLevels: transfer.serviceLevels.map((item) => ({ ...item })),
    summary: { ...transfer.summary },
  };
}

async function confirmTransferMock(payload) {
  await mockDelay();
  const trackingId = `SW-${Math.floor(Math.random() * 90000 + 10000)}`;

  getMockStore().dashboard.recentActivity.unshift({
    id: trackingId,
    recipient: payload.recipientName || "New Shipment",
    destination: payload.city || "Vietnam",
    status: "Pending",
    date: "Today",
    statusColor: "text-ink",
  });

  return {
    message: "Tạo vận chuyển thành công.",
    trackingId,
    total: getMockStore().transfer.summary.total,
  };
}

async function estimatePriceMock({ destination, packageType }) {
  await mockDelay();
  const base = packageType === "pallet" ? 85 : packageType === "envelope" ? 12.5 : 24.8;
  const multiplier = destination?.toLowerCase().includes("international") ? 1.35 : 1;
  const total = Math.round(base * multiplier * 100) / 100;

  return {
    estimatedPrice: total,
    currency: "USD",
    etaDays: packageType === "pallet" ? "7-10" : "2-3",
  };
}

export async function getOperationalDashboard() {
  if (isMockMode()) return getOperationalDashboardMock();

  return apiRequest("/api/Operations/dashboard");
}

export async function getTransferOptions() {
  if (isMockMode()) return getTransferOptionsMock();

  return apiRequest("/api/Operations/transfer/options");
}

export async function confirmTransfer(payload) {
  if (isMockMode()) return confirmTransferMock(payload);

  return apiRequest("/api/Operations/transfer", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function estimatePrice(payload) {
  if (isMockMode()) return estimatePriceMock(payload);

  return apiRequest("/api/Operations/estimate-price", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
