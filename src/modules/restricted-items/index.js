import { isMockMode } from "@/utils/mocks/dataSource";
import {
  listRestrictedItemsApi,
  createRestrictedItemApi,
  updateRestrictedItemApi,
  deleteRestrictedItemApi,
} from "./api";
import {
  listRestrictedItemsMock,
  createRestrictedItemMock,
  updateRestrictedItemMock,
  deleteRestrictedItemMock,
} from "./mock";

export { normalizeRestrictedItemFromApi, toApiRestrictedItemPayload } from "./mappers";
export { restrictedItemsSeed } from "./seed";

export const RESTRICTION_TYPE_LABELS = {
  PROHIBITED: "Cấm tuyệt đối",
  RESTRICTED: "Hạn chế",
  CONDITIONAL: "Có điều kiện",
};

/**
 * @param {{ search?: string; restrictionType?: string }} params
 */
export async function listRestrictedItems(params = {}) {
  if (isMockMode()) return listRestrictedItemsMock(params);
  return listRestrictedItemsApi(params);
}

export async function createRestrictedItem(payload) {
  if (isMockMode()) return createRestrictedItemMock(payload);
  return createRestrictedItemApi(payload);
}

export async function updateRestrictedItem(id, payload) {
  if (isMockMode()) return updateRestrictedItemMock(id, payload);
  return updateRestrictedItemApi(id, payload);
}

export async function deleteRestrictedItem(id) {
  if (isMockMode()) return deleteRestrictedItemMock(id);
  return deleteRestrictedItemApi(id);
}

export function formatRestrictedCountry(country) {
  if (!country) return "Tất cả quốc gia";
  return country;
}
