import { apiRequest } from "@/utils/apiClient";
import {
  normalizePurchaseOrderFromApi,
  normalizePurchaseOrderStatusUpdate,
  toApiPurchaseOrderStatusPayload,
} from "./mappers";

export async function getPurchaseOrderApi(id) {
  const raw = await apiRequest(`/api/purchase-orders/${id}`);
  return normalizePurchaseOrderFromApi(raw);
}

export async function updatePurchaseOrderStatusApi(id, payload) {
  const raw = await apiRequest(`/api/purchase-orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(toApiPurchaseOrderStatusPayload(payload)),
  });

  return normalizePurchaseOrderStatusUpdate(raw);
}
