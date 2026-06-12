import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";

export async function getSalesWorkspace() {
  await mockDelay();
  return { ...getMockStore().staff.sales };
}

export async function getGlobalWarehouseData() {
  await mockDelay();
  const data = getMockStore().staff.globalWarehouse;
  return {
    stats: data.stats.map((item) => ({ ...item })),
    inboundShipments: data.inboundShipments.map((item) => ({ ...item })),
  };
}

export async function getDomesticWarehouseData() {
  await mockDelay();
  const data = getMockStore().staff.domesticWarehouse;
  return {
    stats: data.stats.map((item) => ({ ...item })),
    outboundShipments: data.outboundShipments.map((item) => ({ ...item })),
  };
}
