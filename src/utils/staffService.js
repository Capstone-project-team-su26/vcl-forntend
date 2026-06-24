import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";

async function getSalesWorkspaceMock() {
  await mockDelay();
  return { ...getMockStore().staff.sales };
}

export async function getSalesWorkspace() {
  if (isMockMode()) return getSalesWorkspaceMock();

  return apiRequest("/api/Staff/sales");
}
