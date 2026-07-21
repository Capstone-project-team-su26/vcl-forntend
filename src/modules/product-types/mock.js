import { mockDelay } from "@/utils/mocks/mockDelay";

/** Seed IDs khớp vcl-BE `ProductTypes` — dùng khi API chưa kịp / offline. */
export const PRODUCT_TYPE_SEED_LABELS = {
  "11111111-0000-0000-0000-000000000001": "Điện tử",
  "11111111-0000-0000-0000-000000000002": "Quần áo",
  "11111111-0000-0000-0000-000000000003": "Mỹ phẩm",
  "11111111-0000-0000-0000-000000000004": "Phụ kiện",
  "11111111-0000-0000-0000-000000000005": "Thực phẩm",
  "11111111-0000-0000-0000-000000000006": "Sách",
  "11111111-0000-0000-0000-000000000007": "Đồ chơi",
  "11111111-0000-0000-0000-000000000008": "Đồ gia dụng",
};

const MOCK_PRODUCT_TYPES = Object.entries(PRODUCT_TYPE_SEED_LABELS).map(
  ([id, name]) => ({ id, name })
);

export async function listProductTypesMock() {
  await mockDelay();
  return MOCK_PRODUCT_TYPES.map((entry) => ({ ...entry }));
}
