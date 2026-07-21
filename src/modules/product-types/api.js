import { apiRequest } from "@/utils/apiClient";
import { normalizeProductTypeFromApi } from "./mappers";

export async function listProductTypesApi() {
  const raw = await apiRequest("/api/product-types");
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeProductTypeFromApi);
}
