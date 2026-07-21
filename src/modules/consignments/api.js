import { apiRequest } from "@/utils/apiClient";
import {
  normalizeConsignmentDetail,
  normalizeConsignmentListResponse,
  normalizeConsignmentStatusUpdate,
  normalizeStaffConsignmentCreateResponse,
  normalizeValidateItemsResponse,
  toApiCreateQuotationRequest,
  toApiStaffConsignmentPayload,
  toApiValidateItemsPayload,
} from "./mappers";
import {
  toFilterArray,
  filterConsignments,
  sortItems,
  paginateItems,
} from "./mock";

function buildQuery({ page, pageSize, status, search, consignmentType }) {
  const params = new URLSearchParams();
  params.set("pageNumber", String(page));
  params.set("pageSize", String(pageSize));
  if (status) params.set("status", status);
  if (search) params.set("searchCode", search);
  if (consignmentType) params.set("consignmentType", consignmentType);
  return params.toString();
}

async function fetchAllConsignmentSummaries({ status, search, consignmentType, maxPages = 20 } = {}) {
  const pageSize = 100;
  const items = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const raw = await apiRequest(
      `/api/orders/consignments?${buildQuery({
        page,
        pageSize,
        status,
        search,
        consignmentType,
      })}`
    );
    const batch = normalizeConsignmentListResponse(raw, { page, pageSize });
    items.push(...(batch.items ?? []));

    if (page >= (batch.totalPages ?? 1)) break;
  }

  return items;
}

function needsCustomerHydration(detail) {
  if (!detail?.customerId) return false;
  const hasCustomerName = detail.customerName && detail.customerName !== "—";
  const hasSenderName = Boolean(detail.senderName);
  return !hasCustomerName && !hasSenderName;
}

async function hydrateConsignmentCustomer(detail) {
  if (!needsCustomerHydration(detail)) return detail;

  try {
    const { getCustomer } = await import("@/modules/customers");
    const customer = await getCustomer(detail.customerId);
    if (!customer?.fullName || customer.fullName === "—") return detail;

    return {
      ...detail,
      customer,
      customerName: customer.fullName,
      senderName: detail.senderName ?? customer.fullName,
      senderPhone: detail.senderPhone ?? customer.phone ?? null,
      senderAddress: detail.senderAddress ?? customer.address ?? null,
    };
  } catch {
    // ponytail: BE detail thiếu customer — hydrate best-effort, không chặn xem đơn
    return detail;
  }
}

/**
 * @param {{
 *   page?: number;
 *   pageSize?: number;
 *   status?: string | string[];
 *   search?: string;
 *   consignmentType?: string | string[];
 *   dateFrom?: string;
 *   dateTo?: string;
 *   sortBy?: "code" | "customerName" | "consignmentType" | "status" | "createdAt";
 *   sortDir?: "asc" | "desc";
 * }} params
 */
export async function listStaffConsignmentsApi(params = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const statuses = toFilterArray(params.status);
  const types = toFilterArray(params.consignmentType);
  const needsClientFilter = Boolean(
    types.length || params.dateFrom || params.dateTo || params.sortBy || statuses.length > 1
  );

  if (needsClientFilter) {
    const allItems = await fetchAllConsignmentSummaries({
      status: statuses.length === 1 ? statuses[0] : undefined,
      search: params.search,
    });
    const filtered = sortItems(
      filterConsignments(allItems, {
        status: statuses,
        search: params.search,
        consignmentType: types,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
      }),
      params.sortBy,
      params.sortDir
    );
    return paginateItems(filtered, { page, pageSize });
  }

  const raw = await apiRequest(
    `/api/orders/consignments?${buildQuery({
      page,
      pageSize,
      status: statuses[0],
      search: params.search,
    })}`
  );

  return normalizeConsignmentListResponse(raw, { page, pageSize });
}

export async function getStaffConsignmentApi(id) {
  const raw = await apiRequest(`/api/orders/consignments/${id}`);
  return hydrateConsignmentCustomer(normalizeConsignmentDetail(raw));
}

/**
 * @param {string} orderId
 * @param {{ status: "APPROVED" | "REJECTED"; rejectionReason?: string }} payload
 */
export async function updateStaffConsignmentStatusApi(orderId, payload) {
  const raw = await apiRequest(`/api/orders/consignments/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return normalizeConsignmentStatusUpdate(raw);
}

export async function createConsignmentOrderApi(payload) {
  return apiRequest("/api/orders/consignments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function validateConsignmentItemsApi(payload) {
  const raw = await apiRequest("/api/orders/consignments/validate-items", {
    method: "POST",
    body: JSON.stringify(toApiValidateItemsPayload(payload)),
  });

  return normalizeValidateItemsResponse(raw);
}

export async function createStaffConsignmentApi(payload) {
  const raw = await apiRequest("/api/staff/consignments", {
    method: "POST",
    body: JSON.stringify(toApiStaffConsignmentPayload(payload)),
  });

  return normalizeStaffConsignmentCreateResponse(raw);
}

export async function acceptConsignmentQuotationApi(orderId, quotationId) {
  const raw = await apiRequest(
    `/api/quotations/${encodeURIComponent(quotationId ?? orderId)}/accept`,
    { method: "PUT" }
  );

  return normalizeConsignmentStatusUpdate(raw);
}

export async function rejectConsignmentQuotationApi(orderId, payload = {}) {
  const raw = await apiRequest(
    `/api/orders/${encodeURIComponent(orderId)}/quotation/reject`,
    {
      method: "POST",
      body: JSON.stringify({ rejectionReason: payload.rejectionReason?.trim() }),
    }
  );

  return normalizeConsignmentStatusUpdate(raw);
}

export async function sendConsignmentQuotationApi(orderId, payload) {
  const apiPayload = toApiCreateQuotationRequest(payload, { forSend: true });

  const raw = await apiRequest(
    `/api/orders/${encodeURIComponent(orderId)}/quotation/send`,
    {
      method: "POST",
      body: JSON.stringify(apiPayload),
    }
  );

  return normalizeConsignmentStatusUpdate(raw);
}
