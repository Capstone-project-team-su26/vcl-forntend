import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";

export async function getSalesWorkspaceMock() {
  await mockDelay();
  return { ...getMockStore().staff.sales };
}
