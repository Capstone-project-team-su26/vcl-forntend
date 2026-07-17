import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { apiRequest } from "@/utils/apiClient";

/** Seed IDs khớp vcl-BE `ProductTypes` — dùng khi API chưa kịp / offline. */
const PRODUCT_TYPE_SEED_LABELS = {
  "11111111-0000-0000-0000-000000000001": "Điện tử",
  "11111111-0000-0000-0000-000000000002": "Quần áo",
  "11111111-0000-0000-0000-000000000003": "Mỹ phẩm",
  "11111111-0000-0000-0000-000000000004": "Phụ kiện",
  "11111111-0000-0000-0000-000000000005": "Thực phẩm",
  "11111111-0000-0000-0000-000000000006": "Sách",
  "11111111-0000-0000-0000-000000000007": "Đồ chơi",
  "11111111-0000-0000-0000-000000000008": "Đồ gia dụng",
};

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

function normalizeProductTypeFromApi(item) {
  return {
    id: item.id,
    name: item.name ?? item.productTypeName ?? "—",
  };
}

const MOCK_PRODUCT_TYPES = Object.entries(PRODUCT_TYPE_SEED_LABELS).map(
  ([id, name]) => ({ id, name })
);

export async function listProductTypes() {
  if (isMockMode()) {
    await mockDelay();
    return MOCK_PRODUCT_TYPES.map((entry) => ({ ...entry }));
  }

  const raw = await apiRequest("/api/product-types");
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeProductTypeFromApi);
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
