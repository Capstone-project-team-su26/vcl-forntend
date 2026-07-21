import { isMockMode } from "@/utils/mocks/dataSource";
import { confirmTransferApi, estimatePriceApi } from "./api";
import {
  getOperationalDashboardMock,
  getTransferOptionsMock,
  confirmTransferMock,
  estimatePriceMock,
} from "./mock";

/** BE đã bỏ /api/Operations/* — demo UI dùng mock. */
export async function getOperationalDashboard() {
  return getOperationalDashboardMock();
}

export async function getTransferOptions() {
  return getTransferOptionsMock();
}

export async function confirmTransfer(payload) {
  if (isMockMode()) return confirmTransferMock(payload);
  return confirmTransferApi(payload);
}

export async function estimatePrice(payload) {
  if (isMockMode()) return estimatePriceMock(payload);
  return estimatePriceApi(payload);
}
