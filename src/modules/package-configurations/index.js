import { isMockMode } from "@/utils/mocks/dataSource";
import { formatMoney } from "@/modules/service-pricing";
import {
  listPackageConfigurationsApi,
  createPackageConfigurationApi,
  updatePackageConfigurationApi,
  deactivatePackageConfigurationApi,
} from "./api";
import {
  PACKAGE_STATUS,
  listPackageConfigurationsMock,
  createPackageConfigurationMock,
  updatePackageConfigurationMock,
  deactivatePackageConfigurationMock,
  getPackageStatusFromItem,
} from "./mock";

export { formatMoney };
export {
  normalizePackageConfigurationFromApi,
  toApiPackageConfigurationPayload,
} from "./mappers";

export { PACKAGE_STATUS };

export const PACKAGE_STATUS_LABELS = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Vô hiệu",
};

export async function listPackageConfigurations() {
  if (isMockMode()) return listPackageConfigurationsMock();
  return listPackageConfigurationsApi();
}

export async function createPackageConfiguration(payload) {
  if (isMockMode()) return createPackageConfigurationMock(payload);
  return createPackageConfigurationApi(payload);
}

export async function updatePackageConfiguration(id, payload) {
  if (isMockMode()) return updatePackageConfigurationMock(id, payload);
  return updatePackageConfigurationApi(id, payload);
}

export async function deactivatePackageConfiguration(id) {
  if (isMockMode()) return deactivatePackageConfigurationMock(id);
  return deactivatePackageConfigurationApi(id);
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
  return getPackageStatusFromItem(item);
}
