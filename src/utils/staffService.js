import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";

async function getSalesWorkspaceMock() {
  await mockDelay();
  return { ...getMockStore().staff.sales };
}

async function getGlobalWarehouseDataMock() {
  await mockDelay();
  const data = getMockStore().staff.globalWarehouse;
  return {
    stats: data.stats.map((item) => ({ ...item })),
    inboundShipments: data.inboundShipments.map((item) => ({ ...item })),
  };
}

async function getDomesticWarehouseDataMock() {
  await mockDelay();
  const data = getMockStore().staff.domesticWarehouse;
  return {
    stats: data.stats.map((item) => ({ ...item })),
    outboundShipments: data.outboundShipments.map((item) => ({ ...item })),
  };
}

export async function getSalesWorkspace() {
  if (isMockMode()) return getSalesWorkspaceMock();

  return apiRequest("/api/Staff/sales");
}

export async function getGlobalWarehouseData() {
  if (isMockMode()) return getGlobalWarehouseDataMock();

  return apiRequest("/api/Staff/global-warehouse");
}

export async function getDomesticWarehouseData() {
  if (isMockMode()) return getDomesticWarehouseDataMock();

  return apiRequest("/api/Staff/domestic-warehouse");
}
