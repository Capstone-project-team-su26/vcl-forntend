import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequestWithMockFallback } from "@/utils/apiClient";
import { normalizeShippingMethodListResponse } from "@/utils/apiMappers";

async function listShippingMethodsMock({ activeOnly = true } = {}) {
  await mockDelay();

  let items = getMockStore().shippingMethods.map((item) => ({ ...item }));

  if (activeOnly) {
    items = items.filter((item) => item.isActive);
  }

  return items;
}

function buildQuery({ activeOnly }) {
  const params = new URLSearchParams();
  if (activeOnly) params.set("isActive", "true");
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * @param {{ activeOnly?: boolean }} params
 */
export async function listShippingMethods(params = {}) {
  const activeOnly = params.activeOnly !== false;

  if (isMockMode()) return listShippingMethodsMock({ activeOnly });

  const raw = await apiRequestWithMockFallback(
    `/api/shipping-methods${buildQuery({ activeOnly })}`,
    {},
    () => listShippingMethodsMock({ activeOnly })
  );
  const items = normalizeShippingMethodListResponse(raw);

  return activeOnly ? items.filter((item) => item.isActive) : items;
}
