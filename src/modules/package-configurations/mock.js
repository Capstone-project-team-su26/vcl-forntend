import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore, nextMockId } from "@/utils/mocks/mockStore";
import { ApiError } from "@/utils/apiError";

export const PACKAGE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

function normalizeStatus(status, isActive) {
  const raw = String(status ?? "").toUpperCase();
  if (raw === PACKAGE_STATUS.INACTIVE) return PACKAGE_STATUS.INACTIVE;
  if (raw === PACKAGE_STATUS.ACTIVE) return PACKAGE_STATUS.ACTIVE;
  return isActive === false ? PACKAGE_STATUS.INACTIVE : PACKAGE_STATUS.ACTIVE;
}

export function validatePackageConfigurationPayload(payload, { requireCode = false } = {}) {
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

export async function listPackageConfigurationsMock() {
  await mockDelay();
  return getMockStore().packageConfigurations.map((item) => ({ ...item }));
}

export async function createPackageConfigurationMock(payload) {
  await mockDelay();
  validatePackageConfigurationPayload(payload, { requireCode: true });

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

export async function updatePackageConfigurationMock(id, payload) {
  await mockDelay();
  validatePackageConfigurationPayload(payload);

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

export async function deactivatePackageConfigurationMock(id) {
  await mockDelay();
  return updatePackageConfigurationMock(id, {
    status: PACKAGE_STATUS.INACTIVE,
    isActive: false,
  });
}

export function getPackageStatusFromItem(item) {
  return normalizeStatus(item?.status, item?.isActive);
}
