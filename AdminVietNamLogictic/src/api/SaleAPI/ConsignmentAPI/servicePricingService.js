import axiosInstance from "../../axiosInstance";

/* =========================
   RESPONSE / AUTH HELPERS
========================= */

const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? null;

const getAccessToken = () => {
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    throw new Error(
      "Không tìm thấy token. Vui lòng đăng nhập lại."
    );
  }

  return token;
};

const getAuthHeaders = () => ({
  Accept: "*/*",
  Authorization: `Bearer ${getAccessToken()}`,
});

const normalizeText = (value) =>
  String(value ?? "").trim();

const normalizeUpperText = (value) =>
  normalizeText(value).toUpperCase();

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const removeEmptyParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );

const getArrayItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

/* =========================
   NORMALIZE SERVICE PRICING
========================= */

export const normalizeServicePricing = (
  pricing = {}
) => ({
  id: normalizeText(pricing?.id),
  carrierId: normalizeText(pricing?.carrierId),
  serviceType: normalizeUpperText(
    pricing?.serviceType
  ),
  originCountry: normalizeUpperText(
    pricing?.originCountry
  ),
  destinationCountry: normalizeUpperText(
    pricing?.destinationCountry
  ),
  unitType: normalizeUpperText(
    pricing?.unitType
  ),
  price: normalizeNumber(pricing?.price, 0),
  currency:
    normalizeUpperText(pricing?.currency) ||
    "VND",
  effectiveDate: pricing?.effectiveDate || null,
});

/* =========================
   GET SERVICE PRICINGS
========================= */

export const getServicePricingsApi = async (
  filters = {}
) => {
  const response = await axiosInstance.get(
    "/api/service-pricings",
    {
      params: removeEmptyParams(filters),
      headers: getAuthHeaders(),
    }
  );

  const data = getResponseData(response);

  return getArrayItems(data)
    .map(normalizeServicePricing)
    .filter(
      (pricing) =>
        Boolean(pricing.id) &&
        Boolean(pricing.serviceType) &&
        Boolean(pricing.originCountry) &&
        Boolean(pricing.destinationCountry) &&
        Boolean(pricing.unitType)
    );
};

/* =========================
   MAP TO SELECT OPTIONS
========================= */

export const mapServicePricingsToOptions = (
  servicePricings = []
) => {
  if (!Array.isArray(servicePricings)) {
    return [];
  }

  return servicePricings.map((pricing) => {
    const serviceLabel =
      pricing.serviceType === "EXPRESS"
        ? "Hỏa tốc"
        : pricing.serviceType === "STANDARD"
          ? "Tiêu chuẩn"
          : pricing.serviceType === "ECONOMY"
            ? "Tiết kiệm"
            : pricing.serviceType;

    const unitLabel =
      pricing.unitType === "KG"
        ? "kg"
        : pricing.unitType === "M3"
          ? "m³"
          : pricing.unitType === "PACKAGE"
            ? "kiện"
            : pricing.unitType;

    const priceLabel = new Intl.NumberFormat(
      "vi-VN",
      {
        style: "currency",
        currency: pricing.currency || "VND",
        maximumFractionDigits: 0,
      }
    ).format(
      normalizeNumber(pricing.price, 0)
    );

    return {
      value: pricing.id,
      label:
        `${serviceLabel} • ` +
        `${pricing.originCountry} → ` +
        `${pricing.destinationCountry} • ` +
        `${priceLabel}/${unitLabel}`,

      ...pricing,

      searchText: [
        serviceLabel,
        pricing.serviceType,
        pricing.originCountry,
        pricing.destinationCountry,
        pricing.unitType,
        pricing.price,
        pricing.currency,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });
};

/* =========================
   FIND / FILTER HELPERS
========================= */

export const findServicePricingById = (
  servicePricings = [],
  servicePricingId
) => {
  if (!Array.isArray(servicePricings)) {
    return null;
  }

  const normalizedId =
    normalizeText(servicePricingId);

  if (!normalizedId) {
    return null;
  }

  return (
    servicePricings.find(
      (pricing) =>
        normalizeText(pricing?.id) ===
        normalizedId
    ) || null
  );
};

export const filterServicePricings = (
  servicePricings = [],
  filters = {}
) => {
  if (!Array.isArray(servicePricings)) {
    return [];
  }

  const serviceType = normalizeUpperText(
    filters?.serviceType
  );
  const originCountry = normalizeUpperText(
    filters?.originCountry
  );
  const destinationCountry =
    normalizeUpperText(
      filters?.destinationCountry
    );
  const unitType = normalizeUpperText(
    filters?.unitType
  );
  const carrierId = normalizeText(
    filters?.carrierId
  );

  return servicePricings.filter((pricing) => {
    if (
      serviceType &&
      pricing.serviceType !== serviceType
    ) {
      return false;
    }

    if (
      originCountry &&
      pricing.originCountry !== originCountry
    ) {
      return false;
    }

    if (
      destinationCountry &&
      pricing.destinationCountry !==
        destinationCountry
    ) {
      return false;
    }

    if (
      unitType &&
      pricing.unitType !== unitType
    ) {
      return false;
    }

    if (
      carrierId &&
      pricing.carrierId !== carrierId
    ) {
      return false;
    }

    return true;
  });
};

export const findMatchingServicePricing = (
  servicePricings = [],
  filters = {}
) => {
  const matches = filterServicePricings(
    servicePricings,
    filters
  );

  if (matches.length === 0) {
    return null;
  }

  return [...matches].sort((a, b) => {
    const dateA = new Date(
      a?.effectiveDate || 0
    ).getTime();

    const dateB = new Date(
      b?.effectiveDate || 0
    ).getTime();

    return dateB - dateA;
  })[0];
};

const servicePricingService = {
  normalizeServicePricing,
  getServicePricingsApi,
  mapServicePricingsToOptions,
  findServicePricingById,
  filterServicePricings,
  findMatchingServicePricing,
};

export default servicePricingService;
