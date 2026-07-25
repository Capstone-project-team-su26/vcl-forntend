import axiosInstance from "../../axiosInstance";

/* =========================
   RESPONSE HELPER
========================= */

const getResponseData = (response) => {
  return (
    response?.data?.data ??
    response?.data ??
    null
  );
};

/* =========================
   TOKEN HELPER
========================= */

const getAccessToken = () => {
  const token =
    sessionStorage.getItem(
      "accessToken"
    );

  if (!token) {
    throw new Error(
      "Không tìm thấy token. Vui lòng đăng nhập lại."
    );
  }

  return token;
};

const getAuthHeaders = () => {
  return {
    Accept: "*/*",
    Authorization:
      `Bearer ${getAccessToken()}`,
  };
};

/* =========================
   NORMALIZE HELPERS
========================= */

const normalizeText = (value) => {
  return String(value ?? "").trim();
};

const normalizeUpperText = (
  value
) => {
  return normalizeText(
    value
  ).toUpperCase();
};

const normalizeNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const normalizeNullableNumber = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const normalizeBoolean = (value) => {
  return value === true;
};

const removeEmptyParams = (
  params = {}
) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  );
};

/* =========================
   ARRAY RESPONSE HELPER
========================= */

const getArrayItems = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

/* =========================
   PRODUCT TYPE NORMALIZE
========================= */

const normalizeProductType = (
  item = {}
) => {
  return {
    id: normalizeText(item?.id),
    name: normalizeText(item?.name),
  };
};

/* =========================
   WAREHOUSE NORMALIZE
========================= */

const normalizeWarehouse = (
  warehouse = {}
) => {
  return {
    id: normalizeText(
      warehouse?.id
    ),

    name: normalizeText(
      warehouse?.name
    ),

    code: normalizeText(
      warehouse?.code
    ),

    address: normalizeText(
      warehouse?.address
    ),

    warehouseType:
      normalizeText(
        warehouse?.warehouseType
      ),

    isActive:
      warehouse?.isActive === true,
  };
};

/* =========================
   SERVICE PRICING NORMALIZE
========================= */

const normalizeServicePricing = (
  pricing = {}
) => {
  return {
    id: normalizeText(
      pricing?.id
    ),

    carrierId: normalizeText(
      pricing?.carrierId
    ),

    serviceType:
      normalizeUpperText(
        pricing?.serviceType
      ),

    originCountry:
      normalizeUpperText(
        pricing?.originCountry
      ),

    destinationCountry:
      normalizeUpperText(
        pricing?.destinationCountry
      ),

    unitType:
      normalizeUpperText(
        pricing?.unitType
      ),

    price: normalizeNumber(
      pricing?.price,
      0
    ),

    currency:
      normalizeUpperText(
        pricing?.currency
      ) || "VND",

    effectiveDate:
      pricing?.effectiveDate || null,
  };
};

/* =========================
   PRICING RULE NORMALIZE
========================= */

const normalizePricingRule = (
  rule = {}
) => {
  return {
    id: normalizeText(rule?.id),

    servicePricingId:
      normalizeText(
        rule?.servicePricingId
      ) || null,

    ruleName: normalizeText(
      rule?.ruleName
    ),

    ruleCode: normalizeText(
      rule?.ruleCode
    ),

    ruleType: normalizeText(
      rule?.ruleType
    ),

    conditionType:
      normalizeText(
        rule?.conditionType
      ) || null,

    conditionValue:
      rule?.conditionValue !==
        undefined &&
      rule?.conditionValue !== null &&
      rule?.conditionValue !== ""
        ? normalizeText(
            rule?.conditionValue
          )
        : null,

    calculationType:
      normalizeText(
        rule?.calculationType
      ),

    value: normalizeNumber(
      rule?.value,
      0
    ),

    minAmount:
      normalizeNullableNumber(
        rule?.minAmount
      ),

    maxAmount:
      normalizeNullableNumber(
        rule?.maxAmount
      ),

    isRequired:
      normalizeBoolean(
        rule?.isRequired
      ),

    status: normalizeText(
      rule?.status
    ),

    description:
      normalizeText(
        rule?.description
      ),

    createdAt:
      rule?.createdAt || null,

    updatedAt:
      rule?.updatedAt || null,
  };
};

/* =========================
   GET PRODUCT TYPES
========================= */

export const getProductTypesApi =
  async () => {
    const response =
      await axiosInstance.get(
        "/api/product-types",
        {
          headers:
            getAuthHeaders(),
        }
      );

    const data =
      getResponseData(response);

    return getArrayItems(data)
      .map(normalizeProductType)
      .filter(
        (item) =>
          Boolean(item.id) &&
          Boolean(item.name)
      );
  };

/* =========================
   GET WAREHOUSES
========================= */

export const getWarehousesApi =
  async (filters = {}) => {
    const response =
      await axiosInstance.get(
        "/api/warehouses",
        {
          params:
            removeEmptyParams(
              filters
            ),

          headers:
            getAuthHeaders(),
        }
      );

    const data =
      getResponseData(response);

    return getArrayItems(data)
      .map(normalizeWarehouse)
      .filter(
        (warehouse) =>
          Boolean(warehouse.id) &&
          Boolean(warehouse.name)
      );
  };

/* =========================
   GET ACTIVE WAREHOUSES
========================= */

export const getActiveWarehousesApi =
  async (filters = {}) => {
    const response =
      await axiosInstance.get(
        "/api/warehouses/active",
        {
          params:
            removeEmptyParams(
              filters
            ),

          headers:
            getAuthHeaders(),
        }
      );

    const data =
      getResponseData(response);

    return getArrayItems(data)
      .map(normalizeWarehouse)
      .filter(
        (warehouse) =>
          Boolean(warehouse.id) &&
          Boolean(warehouse.name) &&
          warehouse.isActive === true
      );
  };

/* =========================
   GET ORIGIN WAREHOUSES
========================= */

export const getOriginWarehousesApi =
  async (filters = {}) => {
    const warehouses =
      await getActiveWarehousesApi(
        filters
      );

    return warehouses.filter(
      (warehouse) =>
        normalizeUpperText(
          warehouse?.warehouseType
        ) === "ORIGIN"
    );
  };

/* =========================
   GET DESTINATION WAREHOUSES
========================= */

export const getDestinationWarehousesApi =
  async (filters = {}) => {
    const warehouses =
      await getActiveWarehousesApi(
        filters
      );

    return warehouses.filter(
      (warehouse) =>
        normalizeUpperText(
          warehouse?.warehouseType
        ) === "DESTINATION"
    );
  };

/* =========================
   MAP WAREHOUSE OPTIONS
========================= */

export const mapWarehousesToOptions = (
  warehouses = []
) => {
  if (!Array.isArray(warehouses)) {
    return [];
  }

  return warehouses
    .filter(
      (warehouse) =>
        Boolean(warehouse?.id) &&
        Boolean(warehouse?.name)
    )
    .map((warehouse) => {
      const id = normalizeText(
        warehouse?.id
      );

      const name = normalizeText(
        warehouse?.name
      );

      const code = normalizeText(
        warehouse?.code
      );

      const address = normalizeText(
        warehouse?.address
      );

      const warehouseType =
        normalizeText(
          warehouse?.warehouseType
        );

      const label = code
        ? `${name} (${code})`
        : name;

      return {
        value: id,
        label,

        id,
        name,
        code,
        address,
        warehouseType,

        isActive:
          warehouse?.isActive === true,

        searchText: [
          name,
          code,
          address,
          warehouseType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    });
};

/* =========================
   FIND WAREHOUSE BY ID
========================= */

export const findWarehouseById = (
  warehouses = [],
  warehouseId
) => {
  if (!Array.isArray(warehouses)) {
    return null;
  }

  const normalizedId =
    normalizeText(warehouseId);

  if (!normalizedId) {
    return null;
  }

  return (
    warehouses.find(
      (warehouse) =>
        normalizeText(
          warehouse?.id
        ) === normalizedId
    ) || null
  );
};

/* =========================
   FIND WAREHOUSE BY CODE
========================= */

export const findWarehouseByCode = (
  warehouses = [],
  warehouseCode
) => {
  if (!Array.isArray(warehouses)) {
    return null;
  }

  const normalizedCode =
    normalizeUpperText(
      warehouseCode
    );

  if (!normalizedCode) {
    return null;
  }

  return (
    warehouses.find(
      (warehouse) =>
        normalizeUpperText(
          warehouse?.code
        ) === normalizedCode
    ) || null
  );
};

/* =========================
   GET SERVICE PRICINGS
========================= */

export const getServicePricingsApi =
  async (filters = {}) => {
    const response =
      await axiosInstance.get(
        "/api/service-pricings",
        {
          params:
            removeEmptyParams(
              filters
            ),

          headers:
            getAuthHeaders(),
        }
      );

    const data =
      getResponseData(response);

    return getArrayItems(data)
      .map(
        normalizeServicePricing
      )
      .filter(
        (pricing) =>
          Boolean(pricing.id) &&
          Boolean(
            pricing.serviceType
          ) &&
          Boolean(
            pricing.originCountry
          ) &&
          Boolean(
            pricing.destinationCountry
          ) &&
          Boolean(
            pricing.unitType
          )
      );
  };

/* =========================
   MAP SERVICE PRICING OPTIONS
========================= */

export const mapServicePricingsToOptions =
  (servicePricings = []) => {
    if (
      !Array.isArray(
        servicePricings
      )
    ) {
      return [];
    }

    return servicePricings.map(
      (pricing) => {
        const serviceLabel =
          pricing.serviceType ===
          "EXPRESS"
            ? "Hỏa tốc"
            : pricing.serviceType ===
                "STANDARD"
              ? "Tiêu chuẩn"
              : pricing.serviceType;

        const unitLabel =
          pricing.unitType === "KG"
            ? "kg"
            : pricing.unitType ===
                "M3"
              ? "m³"
              : pricing.unitType ===
                  "PACKAGE"
                ? "kiện"
                : pricing.unitType;

        const priceLabel =
          new Intl.NumberFormat(
            "vi-VN",
            {
              style: "currency",
              currency:
                pricing.currency ||
                "VND",
              maximumFractionDigits: 0,
            }
          ).format(
            normalizeNumber(
              pricing.price,
              0
            )
          );

        const label =
          `${serviceLabel} • ` +
          `${pricing.originCountry} → ` +
          `${pricing.destinationCountry} • ` +
          `${priceLabel}/${unitLabel}`;

        return {
          value: pricing.id,
          label,

          id: pricing.id,
          carrierId:
            pricing.carrierId,
          serviceType:
            pricing.serviceType,
          originCountry:
            pricing.originCountry,
          destinationCountry:
            pricing.destinationCountry,
          unitType:
            pricing.unitType,
          price: pricing.price,
          currency:
            pricing.currency,
          effectiveDate:
            pricing.effectiveDate,

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
      }
    );
  };

/* =========================
   FIND SERVICE PRICING BY ID
========================= */

export const findServicePricingById = (
  servicePricings = [],
  servicePricingId
) => {
  if (
    !Array.isArray(
      servicePricings
    )
  ) {
    return null;
  }

  const normalizedId =
    normalizeText(
      servicePricingId
    );

  if (!normalizedId) {
    return null;
  }

  return (
    servicePricings.find(
      (pricing) =>
        normalizeText(
          pricing?.id
        ) === normalizedId
    ) || null
  );
};

/* =========================
   FILTER SERVICE PRICINGS
========================= */

export const filterServicePricings = (
  servicePricings = [],
  filters = {}
) => {
  if (
    !Array.isArray(
      servicePricings
    )
  ) {
    return [];
  }

  const serviceType =
    normalizeUpperText(
      filters?.serviceType
    );

  const originCountry =
    normalizeUpperText(
      filters?.originCountry
    );

  const destinationCountry =
    normalizeUpperText(
      filters?.destinationCountry
    );

  const unitType =
    normalizeUpperText(
      filters?.unitType
    );

  const carrierId =
    normalizeText(
      filters?.carrierId
    );

  return servicePricings.filter(
    (pricing) => {
      if (
        serviceType &&
        pricing.serviceType !==
          serviceType
      ) {
        return false;
      }

      if (
        originCountry &&
        pricing.originCountry !==
          originCountry
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
        pricing.carrierId !==
          carrierId
      ) {
        return false;
      }

      return true;
    }
  );
};

/* =========================
   FIND MATCHING SERVICE PRICING
========================= */

export const findMatchingServicePricing =
  (
    servicePricings = [],
    filters = {}
  ) => {
    const matches =
      filterServicePricings(
        servicePricings,
        filters
      );

    if (matches.length === 0) {
      return null;
    }

    return [...matches].sort(
      (a, b) => {
        const dateA = new Date(
          a?.effectiveDate || 0
        ).getTime();

        const dateB = new Date(
          b?.effectiveDate || 0
        ).getTime();

        return dateB - dateA;
      }
    )[0];
  };

/* =========================
   GET PRICING RULES
========================= */

export const getPricingRulesApi =
  async (filters = {}) => {
    const response =
      await axiosInstance.get(
        "/api/pricing-rules",
        {
          params:
            removeEmptyParams(
              filters
            ),

          headers:
            getAuthHeaders(),
        }
      );

    const data =
      getResponseData(response);

    return getArrayItems(data)
      .map(normalizePricingRule)
      .filter(
        (rule) =>
          Boolean(rule.id) &&
          Boolean(rule.ruleCode)
      );
  };

/* =========================
   GET ACTIVE PRICING RULES
========================= */

export const getActivePricingRulesApi =
  async (filters = {}) => {
    const rules =
      await getPricingRulesApi(
        filters
      );

    return rules.filter(
      (rule) =>
        normalizeUpperText(
          rule?.status
        ) === "ACTIVE"
    );
  };

/* =========================
   GET ALL MASTER DATA
========================= */

export const getConsignmentMasterDataApi =
  async ({
    warehouseFilters = {},
    servicePricingFilters = {},
    pricingRuleFilters = {},
    activeWarehousesOnly = true,
    activeRulesOnly = true,
  } = {}) => {
    const [
      productTypes,
      warehouses,
      servicePricings,
      pricingRules,
    ] = await Promise.all([
      getProductTypesApi(),

      activeWarehousesOnly
        ? getActiveWarehousesApi(
            warehouseFilters
          )
        : getWarehousesApi(
            warehouseFilters
          ),

      getServicePricingsApi(
        servicePricingFilters
      ),

      activeRulesOnly
        ? getActivePricingRulesApi(
            pricingRuleFilters
          )
        : getPricingRulesApi(
            pricingRuleFilters
          ),
    ]);

    return {
      productTypes,

      warehouses,

      warehouseOptions:
        mapWarehousesToOptions(
          warehouses
        ),

      originWarehouses:
        warehouses.filter(
          (warehouse) =>
            normalizeUpperText(
              warehouse
                ?.warehouseType
            ) === "ORIGIN"
        ),

      destinationWarehouses:
        warehouses.filter(
          (warehouse) =>
            normalizeUpperText(
              warehouse
                ?.warehouseType
            ) ===
            "DESTINATION"
        ),

      servicePricings,

      servicePricingOptions:
        mapServicePricingsToOptions(
          servicePricings
        ),

      pricingRules,
    };
  };

/* =========================
   FIND RULE BY CODE
========================= */

export const findPricingRuleByCode = (
  pricingRules = [],
  ruleCode
) => {
  if (!Array.isArray(pricingRules)) {
    return null;
  }

  const normalizedCode =
    normalizeUpperText(
      ruleCode
    );

  if (!normalizedCode) {
    return null;
  }

  return (
    pricingRules.find(
      (rule) =>
        normalizeUpperText(
          rule?.ruleCode
        ) === normalizedCode
    ) || null
  );
};

/* =========================
   GET RULE VALUE
========================= */

export const getPricingRuleValue = (
  pricingRules = [],
  ruleCode,
  fallback = 0
) => {
  const rule =
    findPricingRuleByCode(
      pricingRules,
      ruleCode
    );

  if (!rule) {
    return fallback;
  }

  return normalizeNumber(
    rule?.value,
    fallback
  );
};

/* =========================
   MAP RULES BY CODE
========================= */

export const mapPricingRulesByCode = (
  pricingRules = []
) => {
  if (!Array.isArray(pricingRules)) {
    return {};
  }

  return pricingRules.reduce(
    (result, rule) => {
      const code =
        normalizeUpperText(
          rule?.ruleCode
        );

      if (code) {
        result[code] = rule;
      }

      return result;
    },
    {}
  );
};

/* =========================
   COMMON PRICING VALUES
========================= */

export const getCommonPricingValues = (
  pricingRules = []
) => {
  return {
    woodCrateFee:
      getPricingRuleValue(
        pricingRules,
        "WOOD_CRATE",
        0
      ),

    domesticFee:
      getPricingRuleValue(
        pricingRules,
        "DOMESTIC_FEE",
        0
      ),

    volumetricDivisor:
      getPricingRuleValue(
        pricingRules,
        "VOLUMETRIC_DIVISOR",
        5000
      ),

    inspectionFee:
      getPricingRuleValue(
        pricingRules,
        "SUR_INSPECTION",
        0
      ),

    insurancePercent:
      getPricingRuleValue(
        pricingRules,
        "SUR_INSURANCE_3PERCENT",
        0
      ),
  };
};

/* =========================
   DEFAULT EXPORT
========================= */

const consignmentMasterService = {
  getProductTypesApi,

  getWarehousesApi,
  getActiveWarehousesApi,
  getOriginWarehousesApi,
  getDestinationWarehousesApi,

  mapWarehousesToOptions,
  findWarehouseById,
  findWarehouseByCode,

  getServicePricingsApi,
  mapServicePricingsToOptions,
  findServicePricingById,
  filterServicePricings,
  findMatchingServicePricing,

  getPricingRulesApi,
  getActivePricingRulesApi,

  getConsignmentMasterDataApi,

  findPricingRuleByCode,
  getPricingRuleValue,
  mapPricingRulesByCode,
  getCommonPricingValues,
};

export default consignmentMasterService;