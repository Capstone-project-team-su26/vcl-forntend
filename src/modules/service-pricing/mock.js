import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

function filterServicePricings(items, { search, isActive }) {
  let filtered = items;

  if (isActive === true || isActive === "true") {
    filtered = filtered.filter((item) => item.isActive);
  } else if (isActive === false || isActive === "false") {
    filtered = filtered.filter((item) => !item.isActive);
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((item) => {
      const haystack = [
        item.carrierId,
        item.carrierName,
        item.serviceType,
        item.originCountry,
        item.destinationCountry,
        item.warehouseId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return filtered.map((item) => ({ ...item }));
}

export async function listServicePricingsMock(params = {}) {
  await mockDelay();
  return filterServicePricings(getMockStore().servicePricings, params);
}

export async function createServicePricingMock(data) {
  await mockDelay();
  const item = { id: nextMockId("SP"), ...data };
  getMockStore().servicePricings.unshift(item);
  return { message: "Thêm giá dịch vụ chính thành công.", item: { ...item } };
}

export async function updateServicePricingMock(id, data) {
  await mockDelay();
  const item = getMockStore().servicePricings.find((entry) => entry.id === id);
  if (!item) throw new ApiError(404, { message: "Không tìm thấy giá dịch vụ chính." });

  Object.assign(item, data);
  return { message: "Cập nhật giá dịch vụ chính thành công.", item: { ...item } };
}

/** Merge existing mock row into payload before normalize (API path does not merge). */
export function getMockServicePricing(id) {
  return getMockStore().servicePricings.find((entry) => entry.id === id) ?? null;
}

export async function deleteServicePricingMock(id) {
  await mockDelay();
  const store = getMockStore();
  const index = store.servicePricings.findIndex((entry) => entry.id === id);
  if (index < 0) throw new ApiError(404, { message: "Không tìm thấy giá dịch vụ chính." });
  store.servicePricings.splice(index, 1);
  return { message: "Đã xóa giá dịch vụ chính." };
}

export async function listInternationalWarehousesMock() {
  await mockDelay();
  return getMockStore().internationalWarehouses.map((entry) => ({ ...entry }));
}
