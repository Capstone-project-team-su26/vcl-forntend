import { isMockMode } from "@/utils/mocks/dataSource";
import { listStaffConsignments } from "@/modules/consignments";
import {
  confirmTransferApi,
  createConsolidationApi,
  estimatePriceApi,
  getConsolidationApi,
  listConsolidationsApi,
} from "./api";
import {
  getTransferOptionsMock,
  confirmTransferMock,
  estimatePriceMock,
} from "./mock";

export {
  buildOperationalAnalytics,
  buildConsolidationSummary,
  countConsolidationParcels,
  getConsolidationStatusMeta,
} from "./mappers";

/** Dashboard hiện tổng hợp từ consignments vì BE chưa có endpoint analytics riêng. */
export async function getOperationalDashboard() {
  return listStaffConsignments({
    page: 1,
    pageSize: 2000,
    sortBy: "createdAt",
    sortDir: "desc",
  });
}

export async function createOperationalConsolidation(orderIds) {
  const ids = [...new Set((orderIds ?? []).filter(Boolean))];
  if (!ids.length) throw new TypeError("Cần chọn ít nhất một lô hàng.");
  return createConsolidationApi(ids);
}

export async function listConsolidations(params) {
  const result = await listConsolidationsApi(params);
  return Array.isArray(result) ? result : [];
}

export async function getConsolidationDetail(id) {
  if (!id) throw new TypeError("Thiếu id lô gom hàng.");
  return getConsolidationApi(id);
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
