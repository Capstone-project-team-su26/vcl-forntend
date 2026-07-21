export function normalizeProductTypeFromApi(item) {
  return {
    id: item.id,
    name: item.name ?? item.productTypeName ?? "—",
  };
}
