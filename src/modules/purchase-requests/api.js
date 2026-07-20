import { apiRequest } from "@/utils/apiClient";
import { ApiError } from "@/utils/apiError";
import {
  normalizePurchaseRequestFromApi,
  normalizePurchaseRequestListResponse,
  normalizePurchaseRequestStatusUpdate,
  toApiPurchaseRequestStatusPayload,
  toApiPurchaseRequestQuotationPayload,
  normalizePurchaseRequestQuotationResponse,
  toApiPurchaseRequestPurchaseOrderPayload,
  normalizePurchaseRequestPurchaseOrderResponse,
} from "./mappers";

function buildQuery({ search, status }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listPurchaseRequestsApi(params = {}) {
  try {
    const raw = await apiRequest(`/api/purchase-requests${buildQuery(params)}`);
    return normalizePurchaseRequestListResponse(raw);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function getPurchaseRequestApi(id) {
  const raw = await apiRequest(`/api/purchase-requests/${id}`);
  return normalizePurchaseRequestFromApi(raw);
}

export async function updatePurchaseRequestStatusApi(id, payload) {
  const raw = await apiRequest(`/api/purchase-requests/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(toApiPurchaseRequestStatusPayload(payload)),
  });

  return normalizePurchaseRequestStatusUpdate(raw);
}

export async function createPurchaseRequestQuotationApi(id, payload) {
  const raw = await apiRequest(`/api/purchase-requests/${id}/quotation`, {
    method: "POST",
    body: JSON.stringify(toApiPurchaseRequestQuotationPayload(payload)),
  });

  return normalizePurchaseRequestQuotationResponse(raw);
}

export async function createPurchaseRequestPurchaseOrderApi(id, payload) {
  const raw = await apiRequest(`/api/purchase-requests/${id}/purchase-order`, {
    method: "POST",
    body: JSON.stringify(toApiPurchaseRequestPurchaseOrderPayload(payload)),
  });

  return normalizePurchaseRequestPurchaseOrderResponse(raw);
}
