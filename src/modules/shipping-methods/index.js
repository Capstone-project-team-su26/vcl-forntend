import { isMockMode } from "@/utils/mocks/dataSource";
import {
  listShippingMethodsApi,
  createShippingMethodApi,
  updateShippingMethodApi,
  deleteShippingMethodApi,
} from "./api";
import {
  listShippingMethodsMock,
  createShippingMethodMock,
  updateShippingMethodMock,
  deleteShippingMethodMock,
} from "./mock";

export {
  normalizeShippingMethodFromApi,
  normalizeShippingMethodListResponse,
  toApiShippingMethodPayload,
} from "./mappers";

/**
 * @param {{ search?: string; isActive?: boolean | string; activeOnly?: boolean }} params
 */
export async function listShippingMethods(params = {}) {
  const activeOnly = params.activeOnly === true;

  if (isMockMode()) {
    return listShippingMethodsMock({
      search: params.search,
      isActive: params.isActive,
      activeOnly,
    });
  }

  return listShippingMethodsApi({
    search: params.search,
    isActive: params.isActive,
    activeOnly,
  });
}

export async function createShippingMethod(payload) {
  if (isMockMode()) return createShippingMethodMock(payload);
  return createShippingMethodApi(payload);
}

export async function updateShippingMethod(id, payload) {
  if (isMockMode()) return updateShippingMethodMock(id, payload);
  return updateShippingMethodApi(id, payload);
}

export async function deleteShippingMethod(id) {
  if (isMockMode()) return deleteShippingMethodMock(id);
  return deleteShippingMethodApi(id);
}
