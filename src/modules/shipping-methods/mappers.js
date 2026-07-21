export function normalizeShippingMethodFromApi(item) {
  const services = item.additionalServices ?? item.extraServices ?? [];

  return {
    id: item.id ?? item.shippingMethodId,
    code: item.code ?? item.shippingServiceType ?? item.methodCode,
    name: item.name ?? item.shippingMethodName ?? item.title ?? "—",
    description: item.description ?? item.desc ?? null,
    estimatedDeliveryTime:
      item.estimatedDeliveryTime ?? item.estimatedTime ?? item.eta ?? null,
    applicableConditions: item.applicableConditions ?? item.conditions ?? null,
    internalNotes: item.internalNotes ?? item.internalNote ?? item.note ?? null,
    isActive: item.isActive !== false,
    additionalServices: services.map((service) => ({
      id: service.id ?? service.serviceId,
      name: service.name ?? service.serviceName ?? "—",
      description: service.description ?? service.desc ?? null,
    })),
  };
}

export function toApiShippingMethodPayload(payload) {
  return {
    name: payload.name?.trim(),
    code: payload.code?.trim(),
    description: payload.description?.trim() || null,
    estimatedDeliveryTime: payload.estimatedDeliveryTime?.trim() || null,
    applicableConditions: payload.applicableConditions?.trim() || null,
    internalNotes: payload.internalNotes?.trim() || null,
    isActive: payload.isActive !== false,
  };
}

export function normalizeShippingMethodListResponse(raw) {
  const data = raw?.data ?? raw;
  const items = Array.isArray(data) ? data : data?.items ?? [];
  return items.map(normalizeShippingMethodFromApi);
}
