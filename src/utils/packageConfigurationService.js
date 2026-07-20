import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";
import {
  normalizePackageConfigurationFromApi,
  toApiPackageConfigurationPayload,
} from "@/utils/apiMappers";
import { ApiError } from "@/utils/apiError";
import { formatMoney } from "@/utils/servicePricingService";

export { formatMoney };

export const PACKAGE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const PACKAGE_STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Vô hiệu",
};

function normalizeStatus(status, isActive) {
  const raw = String(status ?? "").toUpperCase();
  if (raw === PACKAGE_STATUS.INACTIVE) return PACKAGE_STATUS.INACTIVE;
  if (raw === PACKAGE_STATUS.ACTIVE) return PACKAGE_STATUS.ACTIVE;
  return isActive === false ? PACKAGE_STATUS.INACTIVE : PACKAGE_STATUS.ACTIVE;
}

function validatePayload(payload, { requireCode = false } = {}) {
  const code = payload.code?.trim();
  const name = payload.name?.trim();

  if (requireCode && !code) {
    throw new ApiError(400, { message: "Vui lòng nhập mã cấu hình." });
  }
  if (payload.name !== undefined && !name) {
    throw new ApiError(400, { message: "Vui lòng nhập tên cấu hình." });
  }

  for (const [field, label] of [
    ["length", "Chiều dài"],
    ["width", "Chiều rộng"],
    ["height", "Chiều cao"],
    ["maxWeight", "Khối lượng tối đa"],
  ]) {
    if (payload[field] === undefined || payload[field] === "") continue;
    const value = Number(payload[field]);
    if (!Number.isFinite(value) || value <= 0) {
      throw new ApiError(400, { message: `${label} phải lớn hơn 0.` });
    }
  }

  if (payload.packageFee !== undefined && payload.packageFee !== "") {
    const fee = Number(payload.packageFee);
    if (!Number.isFinite(fee) || fee < 0) {
      throw new ApiError(400, { message: "Phí vỏ thùng không hợp lệ." });
    }
  }
}

function buildMockItem(payload, existing) {
  const status = normalizeStatus(payload.status, payload.isActive ?? existing?.isActive);
  return {
    id: existing?.id ?? nextMockId("PC"),
    code: payload.code?.trim() ?? existing?.code ?? "",
    name: payload.name?.trim() ?? existing?.name ?? "",
    length: Number(payload.length ?? existing?.length ?? 0),
    width: Number(payload.width ?? existing?.width ?? 0),
    height: Number(payload.height ?? existing?.height ?? 0),
    maxWeight: Number(payload.maxWeight ?? existing?.maxWeight ?? 0),
    packageFee: Number(payload.packageFee ?? existing?.packageFee ?? 0),
    status,
    isActive: status === PACKAGE_STATUS.ACTIVE,
  };
}

async function listPackageConfigurationsMock() {
  await mockDelay();
  return getMockStore().packageConfigurations.map((item) => ({ ...item }));
}

async function createPackageConfigurationMock(payload) {
  await mockDelay();
  validatePayload(payload, { requireCode: true });

  const duplicate = getMockStore().packageConfigurations.some(
    (item) => item.code.toLowerCase() === payload.code.trim().toLowerCase()
  );
  if (duplicate) {
    throw new ApiError(400, { message: "Mã cấu hình đã tồn tại." });
  }

  const item = buildMockItem({
    ...payload,
    status: payload.status ?? PACKAGE_STATUS.ACTIVE,
    isActive: payload.isActive !== false,
  });
  getMockStore().packageConfigurations.unshift(item);
  return { message: "Thêm cấu hình đóng gói thành công.", item: { ...item } };
}

async function updatePackageConfigurationMock(id, payload) {
  await mockDelay();
  validatePayload(payload);

  const store = getMockStore();
  const index = store.packageConfigurations.findIndex((entry) => entry.id === id);
  if (index < 0) {
    throw new ApiError(404, { message: "Không tìm thấy cấu hình đóng gói." });
  }

  const current = store.packageConfigurations[index];
  const item = buildMockItem(payload, current);
  store.packageConfigurations[index] = item;
  return { message: "Cập nhật cấu hình đóng gói thành công.", item: { ...item } };
}

async function deactivatePackageConfigurationMock(id) {
  await mockDelay();
  return updatePackageConfigurationMock(id, {
    status: PACKAGE_STATUS.INACTIVE,
    isActive: false,
  });
}

export async function listPackageConfigurations() {
  if (isMockMode()) return listPackageConfigurationsMock();

  const raw = await apiRequest("/api/package-configurations");
  const items = Array.isArray(raw) ? raw : raw?.data ?? raw?.items ?? [];
  return items.map(normalizePackageConfigurationFromApi);
}

export async function createPackageConfiguration(payload) {
  if (isMockMode()) return createPackageConfigurationMock(payload);

  validatePayload(payload, { requireCode: true });
  const raw = await apiRequest("/api/package-configurations", {
    method: "POST",
    body: JSON.stringify(toApiPackageConfigurationPayload(payload)),
  });

  const item = normalizePackageConfigurationFromApi(raw?.item ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm cấu hình đóng gói thành công.", item };
}

export async function updatePackageConfiguration(id, payload) {
  if (isMockMode()) return updatePackageConfigurationMock(id, payload);

  validatePayload(payload);
  const raw = await apiRequest(`/api/package-configurations/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPackageConfigurationPayload(payload)),
  });

  const item = normalizePackageConfigurationFromApi(raw?.item ?? raw?.data ?? { ...payload, id });
  return { message: raw?.message || "Cập nhật cấu hình đóng gói thành công.", item };
}

export async function deactivatePackageConfiguration(id) {
  if (isMockMode()) return deactivatePackageConfigurationMock(id);

  const raw = await apiRequest(`/api/package-configurations/${id}`, {
    method: "DELETE",
  });

  if (raw?.item || raw?.data) {
    const item = normalizePackageConfigurationFromApi(raw.item ?? raw.data);
    return { message: raw?.message || "Đã vô hiệu hóa cấu hình đóng gói.", item };
  }

  return {
    message: raw?.message || "Đã vô hiệu hóa cấu hình đóng gói.",
    item: null,
    id,
  };
}

export function formatDimensions(item) {
  if (!item) return "—";
  const { length, width, height } = item;
  if (length == null && width == null && height == null) return "—";
  return `${length ?? "—"} × ${width ?? "—"} × ${height ?? "—"} cm`;
}

export function formatMaxWeight(weight) {
  if (weight == null || weight === "") return "—";
  const numeric = Number(weight);
  if (Number.isNaN(numeric)) return "—";
  return `${numeric} kg`;
}

export function getPackageStatus(item) {
  return normalizeStatus(item?.status, item?.isActive);
}
