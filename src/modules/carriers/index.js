import { isMockMode } from "@/utils/mocks/dataSource";
import {
  listCarriersApi,
  createCarrierApi,
  updateCarrierApi,
  deleteCarrierApi,
} from "./api";
import {
  listCarriersMock,
  createCarrierMock,
  updateCarrierMock,
  deleteCarrierMock,
} from "./mock";

export {
  normalizeCarrierFromApi,
  normalizeCarrierListResponse,
  toApiCarrierPayload,
} from "./mappers";

export const CARRIER_TYPE_LABELS = {
  CARRIER: "Hãng vận chuyển",
  FORWARDER: "Forwarder",
};

/**
 * @param {{ search?: string; isActive?: boolean | string; activeOnly?: boolean }} params
 */
export async function listCarriers(params = {}) {
  const activeOnly = params.activeOnly === true;

  if (isMockMode()) {
    return listCarriersMock({
      search: params.search,
      isActive: params.isActive,
      activeOnly,
    });
  }

  return listCarriersApi({
    search: params.search,
    isActive: params.isActive,
    activeOnly,
  });
}

export async function createCarrier(payload) {
  if (isMockMode()) return createCarrierMock(payload);
  return createCarrierApi(payload);
}

export async function updateCarrier(id, payload) {
  if (isMockMode()) return updateCarrierMock(id, payload);
  return updateCarrierApi(id, payload);
}

export async function deleteCarrier(id) {
  if (isMockMode()) return deleteCarrierMock(id);
  return deleteCarrierApi(id);
}
