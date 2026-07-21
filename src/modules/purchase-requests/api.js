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

function buildQuery({ search, status, pageNumber = 1, pageSize = 5 }) {
  const params = new URLSearchParams();
  params.set("pageNumber", String(pageNumber));
  params.set("pageSize", String(pageSize));
  if (search) params.set("searchKeyword", search);
  // BE dùng PENDING_REVIEW; FE normalize về PENDING để UI thống nhất.
  if (status) {
    params.set("status", status === "PENDING" ? "PENDING_REVIEW" : status);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listPurchaseRequestsApi(params = {}) {
  const pageNumber = params.page ?? params.pageNumber ?? 1;
  const pageSize = params.pageSize ?? 5;

  try {
    const raw = await apiRequest(
      `/api/purchase-requests${buildQuery({
        search: params.search,
        status: params.status,
        pageNumber,
        pageSize,
      })}`
    );
    return normalizePurchaseRequestListResponse(raw, { pageNumber, pageSize });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return {
        items: [],
        totalCount: 0,
        pageNumber,
        pageSize,
        totalPages: 1,
      };
    }
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
