import { apiRequest } from "@/utils/apiClient";
import {
  normalizePackageConfigurationFromApi,
  toApiPackageConfigurationPayload,
} from "./mappers";
import { validatePackageConfigurationPayload } from "./mock";

export async function listPackageConfigurationsApi() {
  const raw = await apiRequest("/api/package-configurations");
  const items = Array.isArray(raw) ? raw : raw?.data ?? raw?.items ?? [];
  return items.map(normalizePackageConfigurationFromApi);
}

export async function createPackageConfigurationApi(payload) {
  validatePackageConfigurationPayload(payload, { requireCode: true });
  const raw = await apiRequest("/api/package-configurations", {
    method: "POST",
    body: JSON.stringify(toApiPackageConfigurationPayload(payload)),
  });

  const item = normalizePackageConfigurationFromApi(raw?.item ?? raw?.data ?? raw);
  return { message: raw?.message || "Thêm cấu hình đóng gói thành công.", item };
}

export async function updatePackageConfigurationApi(id, payload) {
  validatePackageConfigurationPayload(payload);
  const raw = await apiRequest(`/api/package-configurations/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPackageConfigurationPayload(payload)),
  });

  const item = normalizePackageConfigurationFromApi(raw?.item ?? raw?.data ?? { ...payload, id });
  return { message: raw?.message || "Cập nhật cấu hình đóng gói thành công.", item };
}

export async function deactivatePackageConfigurationApi(id) {
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
