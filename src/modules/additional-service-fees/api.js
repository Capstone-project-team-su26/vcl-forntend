import { apiRequest } from "@/utils/apiClient";
import {
  normalizeAdditionalServiceFeeFromApi,
  normalizeAdditionalServiceFeeListResponse,
  toApiPricingRuleFromAdditionalFeePayload,
} from "./mappers";
import { filterAdditionalServiceFees, validateFeePayload } from "./mock";

const PRICING_RULES_PATH = "/api/pricing-rules";

function buildQuery({ search, isActive }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive === true || isActive === "true") params.set("isActive", "true");
  if (isActive === false || isActive === "false") params.set("isActive", "false");
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function getPricingRuleAsFee(id) {
  const raw = await apiRequest(`${PRICING_RULES_PATH}/${encodeURIComponent(id)}`);
  return normalizeAdditionalServiceFeeFromApi(raw?.data ?? raw);
}

/**
 * @param {{ search?: string; isActive?: boolean | string }} params
 */
export async function listAdditionalServiceFeesApi(params = {}) {
  const raw = await apiRequest(`${PRICING_RULES_PATH}${buildQuery(params)}`);
  const items = normalizeAdditionalServiceFeeListResponse(raw);
  return filterAdditionalServiceFees(items, params);
}

export async function createAdditionalServiceFeeApi(payload) {
  const data = validateFeePayload(payload, { requireAll: true });
  const raw = await apiRequest(PRICING_RULES_PATH, {
    method: "POST",
    body: JSON.stringify(toApiPricingRuleFromAdditionalFeePayload(data)),
  });

  const fee = normalizeAdditionalServiceFeeFromApi(raw?.data ?? raw?.fee ?? raw);
  return { message: raw?.message || "Thêm loại phí thành công.", fee };
}

export async function updateAdditionalServiceFeeApi(id, payload) {
  const existing = await getPricingRuleAsFee(id);
  const merged = { ...existing, ...validateFeePayload({ ...existing, ...payload }) };

  const raw = await apiRequest(`${PRICING_RULES_PATH}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(toApiPricingRuleFromAdditionalFeePayload(merged)),
  });

  const fee = await getPricingRuleAsFee(id).catch(() =>
    normalizeAdditionalServiceFeeFromApi(raw?.data ?? raw?.fee ?? { ...merged, id })
  );
  return { message: raw?.message || "Cập nhật loại phí thành công.", fee };
}

export async function deleteAdditionalServiceFeeApi(id) {
  return apiRequest(`${PRICING_RULES_PATH}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
