function normalizePackageConfigurationStatus(item) {
  const raw = String(item.status ?? "").toUpperCase();
  if (raw === "INACTIVE") return "INACTIVE";
  if (raw === "ACTIVE") return "ACTIVE";
  return item.isActive === false ? "INACTIVE" : "ACTIVE";
}

export function normalizePackageConfigurationFromApi(item) {
  const status = normalizePackageConfigurationStatus(item);

  return {
    id: item.id,
    // BE swagger: configCode / configName (aliases kept for mock + older payloads)
    code: item.configCode ?? item.configurationCode ?? item.code ?? "",
    name: item.configName ?? item.configurationName ?? item.name ?? "",
    length: item.length ?? item.lengthCm ?? null,
    width: item.width ?? item.widthCm ?? null,
    height: item.height ?? item.heightCm ?? null,
    maxWeight: item.maxWeight ?? item.maxWeightKg ?? null,
    packageFee: item.packageFee ?? item.packageFeeAmount ?? null,
    estimatedFee:
      item.estimatedFee == null || item.estimatedFee === ""
        ? null
        : Number(item.estimatedFee),
    status,
    isActive: status === "ACTIVE",
  };
}

export function toApiPackageConfigurationPayload(payload) {
  const status =
    payload.status ??
    (payload.isActive === false ? "INACTIVE" : payload.isActive === true ? "ACTIVE" : undefined);

  const body = {
    configCode: payload.code?.trim(),
    configName: payload.name?.trim(),
    length: payload.length === "" || payload.length == null ? null : Number(payload.length),
    width: payload.width === "" || payload.width == null ? null : Number(payload.width),
    height: payload.height === "" || payload.height == null ? null : Number(payload.height),
    maxWeight:
      payload.maxWeight === "" || payload.maxWeight == null
        ? null
        : Number(payload.maxWeight),
    packageFee:
      payload.packageFee === "" || payload.packageFee == null
        ? null
        : Number(payload.packageFee),
  };

  if (status) body.status = status;
  if (payload.isActive !== undefined) body.isActive = payload.isActive !== false;

  return body;
}
