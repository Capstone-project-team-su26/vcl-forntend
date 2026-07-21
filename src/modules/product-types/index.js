import { isMockMode } from "@/utils/mocks/dataSource";
import { listProductTypesApi } from "./api";
import { listProductTypesMock, PRODUCT_TYPE_SEED_LABELS } from "./mock";

export { normalizeProductTypeFromApi } from "./mappers";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isProductTypeId(value) {
  return UUID_RE.test(String(value ?? "").trim());
}

/**
 * Nhãn hiển thị loại hàng — không bao giờ trả GUID thô.
 * @param {string|null|undefined} value id hoặc tên
 * @param {Record<string, string>} [extraById] map từ API (id → name)
 * @returns {string|null}
 */
export function formatProductTypeLabel(value, extraById = {}) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "—" || raw.toUpperCase() === "GENERAL") return null;

  if (isProductTypeId(raw)) {
    const key = raw.toLowerCase();
    return (
      extraById[key] ||
      extraById[raw] ||
      PRODUCT_TYPE_SEED_LABELS[key] ||
      PRODUCT_TYPE_SEED_LABELS[raw] ||
      null
    );
  }

  return raw;
}

export async function listProductTypes() {
  if (isMockMode()) return listProductTypesMock();
  return listProductTypesApi();
}

export function productTypeLabelMap(types = []) {
  const map = { ...PRODUCT_TYPE_SEED_LABELS };
  for (const entry of types) {
    if (!entry?.id || !entry?.name) continue;
    map[String(entry.id).toLowerCase()] = entry.name;
    map[String(entry.id)] = entry.name;
  }
  return map;
}
