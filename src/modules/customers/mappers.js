export function normalizeCustomerFromApi(item) {
  const id = item.id ?? item.customerId;

  return {
    id,
    customerCode: item.customerCode ?? item.code ?? id,
    fullName: item.fullName ?? item.name ?? "—",
    email: item.email ?? null,
    phone: item.phone ?? item.phoneNumber ?? null,
    address: item.address ?? null,
    companyName: item.companyName ?? item.company ?? null,
    taxId: item.taxId ?? item.taxCode ?? null,
    status: String(item.status ?? "ACTIVE").toUpperCase(),
  };
}

export function toApiCustomerPayload(payload) {
  return {
    fullName: payload.fullName?.trim(),
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim(),
    address: payload.address?.trim() || null,
    companyName: payload.companyName?.trim() || null,
    taxId: payload.taxId?.trim() || null,
    status: payload.status || "ACTIVE",
  };
}

export function normalizeCustomerListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeCustomerFromApi);
}
