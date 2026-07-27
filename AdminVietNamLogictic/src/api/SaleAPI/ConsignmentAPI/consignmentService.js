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
    sessionStorage.getItem("accessToken");

  if (!token) {
    throw new Error(
      "Không tìm thấy token. Vui lòng đăng nhập lại."
    );
  }

  return token;
};

const getAuthHeaders = ({
  contentType = false,
} = {}) => {
  const token = getAccessToken();

  return {
    Accept: "text/plain",
    Authorization: `Bearer ${token}`,
    ...(contentType
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),
  };
};

/* =========================
   NORMALIZE
========================= */

const normalizeOrderId = (orderId) => {
  const value = String(
    orderId || ""
  ).trim();

  if (!value) {
    throw new Error(
      "Không tìm thấy mã đơn ký gửi."
    );
  }

  return value;
};

const normalizeText = (value) => {
  return String(value ?? "").trim();
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

const normalizePositiveNumber = (
  value,
  fallback = 0
) => {
  return Math.max(
    0,
    normalizeNumber(value, fallback)
  );
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
   UNIT HELPER
========================= */

/**
 * Kích thước đầu vào: cm
 * Kết quả trả về: m³
 *
 * Công thức:
 * length × width × height × quantity
 * chia 1.000.000
 */
export const calculateVolumeM3FromItems = (
  items = []
) => {
  if (!Array.isArray(items)) {
    return 0;
  }

  const totalVolumeM3 = items.reduce(
    (total, item) => {
      const lengthCm =
        normalizePositiveNumber(
          item?.length
        );

      const widthCm =
        normalizePositiveNumber(
          item?.width
        );

      const heightCm =
        normalizePositiveNumber(
          item?.height
        );

      const quantity = Math.max(
        1,
        Math.trunc(
          normalizeNumber(
            item?.quantity,
            1
          )
        )
      );

      const itemVolumeCm3 =
        lengthCm *
        widthCm *
        heightCm *
        quantity;

      return (
        total +
        itemVolumeCm3 / 1_000_000
      );
    },
    0
  );

  return Number(
    totalVolumeM3.toFixed(6)
  );
};

/**
 * Đổi m³ sang cm³.
 */
export const convertM3ToCm3 = (
  volumeM3
) => {
  const value =
    normalizePositiveNumber(volumeM3);

  return Number(
    (value * 1_000_000).toFixed(2)
  );
};

/* =========================
   QUOTATION PAYLOAD
========================= */

const normalizeAdditionalFees = (
  additionalFees
) => {
  if (!Array.isArray(additionalFees)) {
    return [];
  }

  return additionalFees.map((fee) => ({
    feeId: normalizeText(fee?.feeId),
    code: normalizeText(fee?.code),
    label: normalizeText(fee?.label),
    amount: normalizePositiveNumber(
      fee?.amount
    ),
    enabled:
      fee?.enabled !== false,
  }));
};

export const normalizeQuotationPayload = (
  payload = {}
) => {
  const servicePricingId =
    normalizeText(
      payload?.servicePricingId
    );

  const serviceType =
    normalizeText(payload?.serviceType);

  const salesNote =
    normalizeText(payload?.salesNote);

  const quotation =
    payload?.quotation &&
    typeof payload.quotation ===
      "object"
      ? payload.quotation
      : {};

  return {
    warehouseId: normalizeText(
      payload?.warehouseId
    ),
    servicePricingId,
    serviceType,
    weightKg: normalizePositiveNumber(
      payload?.weightKg
    ),
    volumeM3: normalizePositiveNumber(
      payload?.volumeM3
    ),
    packageCount: Math.max(
      1,
      Math.trunc(
        normalizeNumber(
          payload?.packageCount,
          1
        )
      )
    ),
    declaredValue:
      normalizePositiveNumber(
        payload?.declaredValue
      ),
    salesNote,
    quotation: {
      servicePricingId:
        normalizeText(
          quotation?.servicePricingId
        ) || servicePricingId,
      serviceType:
        normalizeText(
          quotation?.serviceType
        ) || serviceType,
      originCountry:
        normalizeText(
          quotation?.originCountry
        ),
      destinationCountry:
        normalizeText(
          quotation?.destinationCountry
        ),
      unitType:
        normalizeText(
          quotation?.unitType
        ),
      unitPrice:
        normalizePositiveNumber(
          quotation?.unitPrice
        ),
      currency:
        normalizeText(
          quotation?.currency
        ),
      totalWeight:
        normalizePositiveNumber(
          quotation?.totalWeight
        ),
      totalVolume:
        normalizePositiveNumber(
          quotation?.totalVolume
        ),
      volumetricWeight:
        normalizePositiveNumber(
          quotation?.volumetricWeight
        ),
      chargeableWeight:
        normalizePositiveNumber(
          quotation?.chargeableWeight
        ),
      mainServiceAmount:
        normalizePositiveNumber(
          quotation?.mainServiceAmount
        ),
      additionalFees:
        normalizeAdditionalFees(
          quotation?.additionalFees
        ),
      discountPercent:
        normalizePositiveNumber(
          quotation?.discountPercent
        ),
      subtotal:
        normalizePositiveNumber(
          quotation?.subtotal
        ),
      discount:
        normalizePositiveNumber(
          quotation?.discount
        ),
      total:
        normalizePositiveNumber(
          quotation?.total
        ),
      estimatedFreightCharge:
        normalizePositiveNumber(
          quotation
            ?.estimatedFreightCharge
        ),
      serviceFee:
        normalizePositiveNumber(
          quotation?.serviceFee
        ),
      totalEstimatedCost:
        normalizePositiveNumber(
          quotation
            ?.totalEstimatedCost
        ),
      vat: normalizePositiveNumber(
        quotation?.vat
      ),
      importTax:
        normalizePositiveNumber(
          quotation?.importTax
        ),
      salesNote:
        normalizeText(
          quotation?.salesNote
        ) || salesNote,
    },
  };
};

const validateQuotationPayload = (
  payload
) => {
  if (!payload?.warehouseId) {
    throw new Error(
      "Vui lòng chọn kho xử lý."
    );
  }

  if (!payload?.servicePricingId) {
    throw new Error(
      "Vui lòng chọn bảng giá dịch vụ."
    );
  }

  if (!payload?.serviceType) {
    throw new Error(
      "Vui lòng chọn loại dịch vụ."
    );
  }

  if (payload.weightKg <= 0) {
    throw new Error(
      "Khối lượng phải lớn hơn 0 kg."
    );
  }

  if (payload.volumeM3 <= 0) {
    throw new Error(
      "Thể tích phải lớn hơn 0 m³."
    );
  }

  if (payload.packageCount <= 0) {
    throw new Error(
      "Số kiện phải lớn hơn 0."
    );
  }
};

/* =========================
   STATUS PAYLOAD
========================= */

const REVIEW_STATUSES = new Set([
  "APPROVED",
  "REJECTED",
]);

export const normalizeConsignmentStatusPayload =
  (payload = {}) => {
    const status = normalizeText(
      payload?.status
    ).toUpperCase();

    const rejectionReason =
      normalizeText(
        payload?.rejectionReason
      );

    if (!REVIEW_STATUSES.has(status)) {
      throw new Error(
        "Trạng thái chỉ được phép là APPROVED hoặc REJECTED."
      );
    }

    if (
      status === "REJECTED" &&
      rejectionReason.length < 3
    ) {
      throw new Error(
        "Vui lòng nhập lý do từ chối ít nhất 3 ký tự."
      );
    }

    return {
      status,
      rejectionReason:
        status === "REJECTED"
          ? rejectionReason
          : "",
    };
  };

/* =========================
   LẤY DANH SÁCH ĐƠN KÝ GỬI
========================= */

export const getConsignmentsApi =
  async (filters = {}) => {
    const params =
      removeEmptyParams({
        ...filters,

        pageNumber:
          filters?.pageNumber ??
          filters?.page ??
          1,

        pageSize:
          filters?.pageSize ??
          filters?.limit ??
          10,
      });

    const response =
      await axiosInstance.get(
        "/api/orders/consignments",
        {
          params,
          headers: getAuthHeaders(),
        }
      );

    const data =
      getResponseData(response);

    const items =
      Array.isArray(data?.items)
        ? data.items.map(
            (item) => ({
              ...item,

              orderId:
                normalizeText(
                  item?.orderId ??
                    item?.id
                ),

              consignmentCode:
                normalizeText(
                  item?.consignmentCode
                ),

              customerName:
                normalizeText(
                  item?.customerName
                ),

              consignmentType:
                normalizeText(
                  item?.consignmentType
                ),

              status:
                normalizeText(
                  item?.status
                ).toUpperCase(),

              totalWeight:
                normalizePositiveNumber(
                  item?.totalWeight
                ),

              totalVolume:
                normalizePositiveNumber(
                  item?.totalVolume
                ),

              route:
                normalizeText(
                  item?.route
                ),

              receiverName:
                normalizeText(
                  item?.receiverName
                ),

              receiverPhone:
                normalizeText(
                  item?.receiverPhone
                ),

              receiverAddress:
                normalizeText(
                  item?.receiverAddress
                ),

              requiresInspection:
                Boolean(
                  item?.requiresInspection
                ),

              createdAt:
                normalizeText(
                  item?.createdAt
                ),

              warehouseId:
                normalizeText(
                  item?.warehouseId
                ) || null,

              pricingRuleIds:
                Array.isArray(
                  item?.pricingRuleIds
                )
                  ? item.pricingRuleIds
                      .map(normalizeText)
                      .filter(Boolean)
                  : [],

              itemNames:
                Array.isArray(
                  item?.itemNames
                )
                  ? item.itemNames
                      .map(normalizeText)
                      .filter(Boolean)
                  : [],
            })
          )
        : [];

    const pageNumber =
      Math.max(
        1,
        Math.trunc(
          normalizePositiveNumber(
            data?.pageNumber,
            params?.pageNumber ?? 1
          )
        )
      );

    const pageSize =
      Math.max(
        1,
        Math.trunc(
          normalizePositiveNumber(
            data?.pageSize,
            params?.pageSize ?? 10
          )
        )
      );

    const totalCount =
      Math.max(
        0,
        Math.trunc(
          normalizePositiveNumber(
            data?.totalCount,
            items.length
          )
        )
      );

    const totalPagesFromApi =
      Math.max(
        0,
        Math.trunc(
          normalizePositiveNumber(
            data?.totalPages
          )
        )
      );

    const totalPages =
      totalPagesFromApi > 0
        ? totalPagesFromApi
        : totalCount > 0
          ? Math.ceil(
              totalCount /
                pageSize
            )
          : 0;

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,

      hasPreviousPage:
        pageNumber > 1,

      hasNextPage:
        totalPages > 0 &&
        pageNumber < totalPages,

      raw: data,
    };
  };

/* =========================
   LẤY CHI TIẾT ĐƠN KÝ GỬI
========================= */

export const getConsignmentDetailApi =
  async (orderId) => {
    const normalizedOrderId =
      normalizeOrderId(orderId);

    const response =
      await axiosInstance.get(
        `/api/orders/consignments/${encodeURIComponent(
          normalizedOrderId
        )}`,
        {
          headers: getAuthHeaders(),
        }
      );

    const data =
      getResponseData(response);

    if (
      !data ||
      typeof data !== "object"
    ) {
      throw new Error(
        "API không trả về dữ liệu chi tiết đơn ký gửi."
      );
    }

    return {
      ...data,

      orderId:
        normalizeText(
          data?.orderId ??
            data?.id
        ),

      consignmentCode:
        normalizeText(
          data?.consignmentCode
        ),

      status:
        normalizeText(
          data?.status ??
            data?.orderStatus ??
            data?.consignmentStatus
        ).toUpperCase(),

      consignmentType:
        normalizeText(
          data?.consignmentType
        ),

      orderType:
        normalizeText(
          data?.orderType
        ).toUpperCase(),

      totalWeight:
        normalizePositiveNumber(
          data?.totalWeight
        ),

      totalVolume:
        normalizePositiveNumber(
          data?.totalVolume
        ),

      route:
        normalizeText(
          data?.route
        ),

      receiverName:
        normalizeText(
          data?.receiverName
        ),

      receiverPhone:
        normalizeText(
          data?.receiverPhone
        ),

      receiverAddress:
        normalizeText(
          data?.receiverAddress
        ),

      requiresInspection:
        Boolean(
          data?.requiresInspection
        ),

      warehouseId:
        normalizeText(
          data?.warehouseId
        ) || null,

      pricingRuleIds:
        Array.isArray(
          data?.pricingRuleIds
        )
          ? data.pricingRuleIds
              .map(normalizeText)
              .filter(Boolean)
          : [],

      itemNames:
        Array.isArray(
          data?.itemNames
        )
          ? data.itemNames
              .map(normalizeText)
              .filter(Boolean)
          : [],

      items:
        Array.isArray(
          data?.items
        )
          ? data.items
          : [],

      customer:
        data?.customer &&
        typeof data.customer ===
          "object"
          ? data.customer
          : null,

      quotation:
        data?.quotation &&
        typeof data.quotation ===
          "object"
          ? data.quotation
          : null,
    };
  };

/* =========================
   CẬP NHẬT TRẠNG THÁI ĐƠN
   ACCEPTED -> APPROVED / REJECTED
========================= */

export const updateConsignmentStatusApi =
  async (orderId, requestPayload) => {
    const normalizedOrderId =
      normalizeOrderId(orderId);

    const payload =
      normalizeConsignmentStatusPayload(
        requestPayload
      );

    const response =
      await axiosInstance.put(
        `/api/orders/consignments/${encodeURIComponent(
          normalizedOrderId
        )}/status`,
        payload,
        {
          headers: getAuthHeaders({
            contentType: true,
          }),
        }
      );

    return getResponseData(response);
  };

export const approveConsignmentApi =
  async (orderId) => {
    return updateConsignmentStatusApi(
      orderId,
      {
        status: "APPROVED",
        rejectionReason: "",
      }
    );
  };

export const rejectConsignmentApi =
  async (
    orderId,
    rejectionReason
  ) => {
    return updateConsignmentStatusApi(
      orderId,
      {
        status: "REJECTED",
        rejectionReason,
      }
    );
  };

/* =========================
   TẠO BÁO GIÁ TẠM TÍNH
========================= */

export const estimateQuotationApi =
  async (orderId, requestPayload) => {
    const normalizedOrderId =
      normalizeOrderId(orderId);

    const payload =
      normalizeQuotationPayload(
        requestPayload
      );

    validateQuotationPayload(payload);

    const response =
      await axiosInstance.post(
        `/api/orders/${encodeURIComponent(
          normalizedOrderId
        )}/quotation/estimate`,
        payload,
        {
          headers: getAuthHeaders({
            contentType: true,
          }),
        }
      );

    return getResponseData(response);
  };

/* =========================
   GỬI BÁO GIÁ CHÍNH THỨC
========================= */

export const sendQuotationApi =
  async (orderId, requestPayload) => {
    const normalizedOrderId =
      normalizeOrderId(orderId);

    const payload =
      normalizeQuotationPayload(
        requestPayload
      );

    validateQuotationPayload(payload);

    const response =
      await axiosInstance.post(
        `/api/orders/${encodeURIComponent(
          normalizedOrderId
        )}/quotation/send`,
        payload,
        {
          headers: getAuthHeaders({
            contentType: true,
          }),
        }
      );

    return getResponseData(response);
  };

/* =====================================================
   RESTRICTED ITEMS / SERVICE PRICING CONSTANTS
===================================================== */

export const RESTRICTION_TYPE = {
  BANNED: "BANNED",
  RESTRICTED: "RESTRICTED",
  WARNING: "WARNING",
};

export const PRICING_RULE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

export const PRICING_RULE_CODE = {
  WOOD_CRATE: "WOOD_CRATE",
  DOMESTIC_FEE: "DOMESTIC_FEE",
  VAT: "VAT",
  VOLUMETRIC_DIVISOR:
    "VOLUMETRIC_DIVISOR",
  SUR_INSPECTION:
    "SUR_INSPECTION",
  IMPORT_TAX: "IMPORT_TAX",
  SUR_INSURANCE_3PERCENT:
    "SUR_INSURANCE_3PERCENT",
};

const REFERENCE_COUNTRY_LABELS = {
  VN: "Việt Nam",
  VIETNAM: "Việt Nam",

  CN: "Trung Quốc",
  CHINA: "Trung Quốc",

  KR: "Hàn Quốc",
  KOREA: "Hàn Quốc",
  SOUTHKOREA: "Hàn Quốc",

  JP: "Nhật Bản",
  JAPAN: "Nhật Bản",
};

const REFERENCE_SERVICE_TYPE_LABELS = {
  EXPRESS: "Hỏa tốc",
  STANDARD: "Tiêu chuẩn",
  ECONOMY: "Tiết kiệm",
};

const REFERENCE_RESTRICTION_TYPE_LABELS = {
  BANNED: "Cấm vận chuyển",
  RESTRICTED: "Hạn chế vận chuyển",
  WARNING: "Cần lưu ý",
};

const REFERENCE_CALCULATION_TYPE_LABELS = {
  FIXED: "Mức phí cố định",
  PERCENTAGE:
    "Tính theo tỷ lệ phần trăm",
};

/* =====================================================
   REFERENCE HELPERS
===================================================== */

const referenceNormalizeUpperText = (
  value
) => {
  return normalizeText(
    value
  ).toUpperCase();
};

const referenceNormalizeNullableNumber = (
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

const referenceNormalizeBoolean = (
  value,
  fallback = false
) => {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    value === 1 ||
    value === "1" ||
    referenceNormalizeUpperText(
      value
    ) === "TRUE"
  ) {
    return true;
  }

  if (
    value === 0 ||
    value === "0" ||
    referenceNormalizeUpperText(
      value
    ) === "FALSE"
  ) {
    return false;
  }

  return fallback;
};

const referenceGetArrayItems = (
  data
) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(data?.items)
  ) {
    return data.items;
  }

  if (
    Array.isArray(data?.data)
  ) {
    return data.data;
  }

  return [];
};

const referenceNormalizeId = (
  value,
  fieldName = "mã dữ liệu"
) => {
  const id =
    normalizeText(value);

  if (!id) {
    throw new Error(
      `Không tìm thấy ${fieldName}.`
    );
  }

  return id;
};

/* =====================================================
   REFERENCE DISPLAY HELPERS
===================================================== */

export const getCountryDisplayName = (
  value
) => {
  const normalizedValue =
    referenceNormalizeUpperText(
      value
    ).replace(
      /[^A-Z0-9]/g,
      ""
    );

  return (
    REFERENCE_COUNTRY_LABELS[
      normalizedValue
    ] ||
    normalizeText(value) ||
    "Chưa xác định"
  );
};

export const getServiceTypeDisplayName = (
  value
) => {
  const normalizedValue =
    referenceNormalizeUpperText(
      value
    );

  return (
    REFERENCE_SERVICE_TYPE_LABELS[
      normalizedValue
    ] ||
    normalizeText(value) ||
    "Chưa xác định"
  );
};

export const getRestrictionTypeDisplayName =
  (value) => {
    const normalizedValue =
      referenceNormalizeUpperText(
        value
      );

    return (
      REFERENCE_RESTRICTION_TYPE_LABELS[
        normalizedValue
      ] ||
      "Loại hạn chế khác"
    );
  };

export const getCalculationTypeDisplayName =
  (value) => {
    const normalizedValue =
      referenceNormalizeUpperText(
        value
      );

    return (
      REFERENCE_CALCULATION_TYPE_LABELS[
        normalizedValue
      ] ||
      "Cách tính theo cấu hình"
    );
  };

export const formatVnd = (
  value
) => {
  return new Intl.NumberFormat(
    "vi-VN",
    {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }
  ).format(
    normalizePositiveNumber(
      value
    )
  );
};

export const formatEffectiveDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
};

/* =====================================================
   RESTRICTED ITEMS NORMALIZE
===================================================== */

export const normalizeRestrictedItem = (
  item = {}
) => {
  const restrictionType =
    referenceNormalizeUpperText(
      item?.restrictionType
    );

  const country =
    normalizeText(item?.country);

  return {
    ...item,

    id:
      normalizeText(item?.id),

    itemName:
      normalizeText(
        item?.itemName
      ),

    country,

    countryDisplayName:
      getCountryDisplayName(
        country
      ),

    restrictionType,

    restrictionTypeDisplayName:
      getRestrictionTypeDisplayName(
        restrictionType
      ),

    note:
      normalizeText(item?.note),

    isActive:
      referenceNormalizeBoolean(
        item?.isActive
      ),
  };
};

/* =====================================================
   SERVICE PRICING NORMALIZE
===================================================== */

export const normalizeServicePricing = (
  pricing = {}
) => {
  const serviceType =
    normalizeText(
      pricing?.serviceType
    );

  const originCountry =
    normalizeText(
      pricing?.originCountry
    );

  const destinationCountry =
    normalizeText(
      pricing?.destinationCountry
    );

  const currency =
    referenceNormalizeUpperText(
      pricing?.currency
    ) || "VND";

  return {
    ...pricing,

    id:
      normalizeText(pricing?.id),

    carrierId:
      normalizeText(
        pricing?.carrierId
      ) || null,

    serviceType,

    serviceTypeDisplayName:
      getServiceTypeDisplayName(
        serviceType
      ),

    originCountry,

    originCountryDisplayName:
      getCountryDisplayName(
        originCountry
      ),

    destinationCountry,

    destinationCountryDisplayName:
      getCountryDisplayName(
        destinationCountry
      ),

    routeDisplayName:
      `${getCountryDisplayName(
        originCountry
      )} → ${getCountryDisplayName(
        destinationCountry
      )}`,

    unitType:
      referenceNormalizeUpperText(
        pricing?.unitType
      ),

    price:
      normalizePositiveNumber(
        pricing?.price
      ),

    formattedPrice:
      currency === "VND"
        ? formatVnd(
            pricing?.price
          )
        : `${normalizePositiveNumber(
            pricing?.price
          )} ${currency}`,

    currency,

    effectiveDate:
      normalizeText(
        pricing?.effectiveDate
      ),

    effectiveDateDisplay:
      formatEffectiveDate(
        pricing?.effectiveDate
      ),

    boxPricingRules:
      Array.isArray(
        pricing?.boxPricingRules
      )
        ? pricing.boxPricingRules
        : [],
  };
};

/* =====================================================
   PRICING RULE NORMALIZE
===================================================== */

export const normalizePricingRule = (
  rule = {}
) => {
  const status =
    referenceNormalizeUpperText(
      rule?.status
    );

  const calculationType =
    referenceNormalizeUpperText(
      rule?.calculationType
    );

  return {
    ...rule,

    id:
      normalizeText(rule?.id),

    servicePricingId:
      normalizeText(
        rule?.servicePricingId
      ) || null,

    ruleName:
      normalizeText(
        rule?.ruleName
      ),

    ruleCode:
      referenceNormalizeUpperText(
        rule?.ruleCode
      ),

    ruleType:
      referenceNormalizeUpperText(
        rule?.ruleType
      ),

    conditionType:
      normalizeText(
        rule?.conditionType
      ) || null,

    conditionValue:
      normalizeText(
        rule?.conditionValue
      ) || null,

    calculationType,

    calculationTypeDisplayName:
      getCalculationTypeDisplayName(
        calculationType
      ),

    value:
      normalizePositiveNumber(
        rule?.value
      ),

    minAmount:
      referenceNormalizeNullableNumber(
        rule?.minAmount
      ),

    maxAmount:
      referenceNormalizeNullableNumber(
        rule?.maxAmount
      ),

    isRequired:
      referenceNormalizeBoolean(
        rule?.isRequired
      ),

    status,

    isActive:
      status ===
      PRICING_RULE_STATUS.ACTIVE,

    description:
      normalizeText(
        rule?.description
      ),

    createdAt:
      normalizeText(
        rule?.createdAt
      ),

    updatedAt:
      normalizeText(
        rule?.updatedAt
      ) || null,
  };
};

/* =====================================================
   RESTRICTED ITEMS API
===================================================== */

export const getRestrictedItemsApi =
  async (filters = {}) => {
    const response =
      await axiosInstance.get(
        "/api/restricted-items",
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

    return referenceGetArrayItems(
      data
    )
      .map(
        normalizeRestrictedItem
      )
      .filter(
        (item) =>
          Boolean(item.id)
      );
  };

export const getRestrictedItemDetailApi =
  async (restrictedItemId) => {
    const id =
      referenceNormalizeId(
        restrictedItemId,
        "mã hàng hạn chế"
      );

    const response =
      await axiosInstance.get(
        `/api/restricted-items/${encodeURIComponent(
          id
        )}`,
        {
          headers:
            getAuthHeaders(),
        }
      );

    return normalizeRestrictedItem(
      getResponseData(response) ||
      {}
    );
  };

export const getActiveRestrictedItemsApi =
  async (filters = {}) => {
    const items =
      await getRestrictedItemsApi(
        filters
      );

    return items.filter(
      (item) =>
        item.isActive
    );
  };

/* =====================================================
   SERVICE PRICINGS API
===================================================== */

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

    return referenceGetArrayItems(
      data
    )
      .map(
        normalizeServicePricing
      )
      .filter(
        (pricing) =>
          Boolean(pricing.id)
      );
  };

export const getServicePricingDetailApi =
  async (servicePricingId) => {
    const id =
      referenceNormalizeId(
        servicePricingId,
        "mã bảng giá dịch vụ"
      );

    const response =
      await axiosInstance.get(
        `/api/service-pricings/${encodeURIComponent(
          id
        )}`,
        {
          headers:
            getAuthHeaders(),
        }
      );

    return normalizeServicePricing(
      getResponseData(response) ||
      {}
    );
  };

/* =====================================================
   PRICING RULES API
===================================================== */

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

    return referenceGetArrayItems(
      data
    )
      .map(
        normalizePricingRule
      )
      .filter(
        (rule) =>
          Boolean(rule.id)
      );
  };

export const getPricingRuleDetailApi =
  async (pricingRuleId) => {
    const id =
      referenceNormalizeId(
        pricingRuleId,
        "mã quy tắc tính phí"
      );

    const response =
      await axiosInstance.get(
        `/api/pricing-rules/${encodeURIComponent(
          id
        )}`,
        {
          headers:
            getAuthHeaders(),
        }
      );

    return normalizePricingRule(
      getResponseData(response) ||
      {}
    );
  };

export const getActivePricingRulesApi =
  async (filters = {}) => {
    const rules =
      await getPricingRulesApi(
        filters
      );

    return rules.filter(
      (rule) =>
        rule.isActive
    );
  };

/* =====================================================
   LOOKUP / FILTER HELPERS
===================================================== */

export const findRestrictedItemById = (
  items = [],
  restrictedItemId
) => {
  const id =
    normalizeText(
      restrictedItemId
    );

  if (
    !Array.isArray(items) ||
    !id
  ) {
    return null;
  }

  return (
    items.find(
      (item) =>
        normalizeText(
          item?.id
        ) === id
    ) || null
  );
};

export const findServicePricingById = (
  pricings = [],
  servicePricingId
) => {
  const id =
    normalizeText(
      servicePricingId
    );

  if (
    !Array.isArray(pricings) ||
    !id
  ) {
    return null;
  }

  return (
    pricings.find(
      (pricing) =>
        normalizeText(
          pricing?.id
        ) === id
    ) || null
  );
};

export const findPricingRuleById = (
  rules = [],
  pricingRuleId
) => {
  const id =
    normalizeText(
      pricingRuleId
    );

  if (
    !Array.isArray(rules) ||
    !id
  ) {
    return null;
  }

  return (
    rules.find(
      (rule) =>
        normalizeText(
          rule?.id
        ) === id
    ) || null
  );
};

export const findPricingRuleByCode = (
  rules = [],
  ruleCode
) => {
  const code =
    referenceNormalizeUpperText(
      ruleCode
    );

  if (
    !Array.isArray(rules) ||
    !code
  ) {
    return null;
  }

  return (
    rules.find(
      (rule) =>
        referenceNormalizeUpperText(
          rule?.ruleCode
        ) === code
    ) || null
  );
};

export const filterRestrictedItems = (
  items = [],
  filters = {}
) => {
  if (!Array.isArray(items)) {
    return [];
  }

  const keyword =
    normalizeText(
      filters?.keyword
    ).toLowerCase();

  const country =
    referenceNormalizeUpperText(
      filters?.country
    );

  const restrictionType =
    referenceNormalizeUpperText(
      filters?.restrictionType
    );

  const activeOnly =
    filters?.activeOnly === true;

  return items.filter((item) => {
    const normalized =
      normalizeRestrictedItem(
        item
      );

    const matchesKeyword =
      !keyword ||
      [
        normalized.itemName,
        normalized.note,
        normalized.countryDisplayName,
        normalized
          .restrictionTypeDisplayName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    const matchesCountry =
      !country ||
      referenceNormalizeUpperText(
        normalized.country
      ) === country ||
      referenceNormalizeUpperText(
        normalized
          .countryDisplayName
      ) === country;

    const matchesType =
      !restrictionType ||
      normalized.restrictionType ===
        restrictionType;

    const matchesActive =
      !activeOnly ||
      normalized.isActive;

    return (
      matchesKeyword &&
      matchesCountry &&
      matchesType &&
      matchesActive
    );
  });
};

export const filterServicePricings = (
  pricings = [],
  filters = {}
) => {
  if (!Array.isArray(pricings)) {
    return [];
  }

  const serviceType =
    referenceNormalizeUpperText(
      filters?.serviceType
    );

  const originCountry =
    referenceNormalizeUpperText(
      filters?.originCountry
    );

  const destinationCountry =
    referenceNormalizeUpperText(
      filters?.destinationCountry
    );

  return pricings.filter(
    (pricing) => {
      const normalized =
        normalizeServicePricing(
          pricing
        );

      const matchesServiceType =
        !serviceType ||
        referenceNormalizeUpperText(
          normalized.serviceType
        ) === serviceType;

      const matchesOrigin =
        !originCountry ||
        referenceNormalizeUpperText(
          normalized.originCountry
        ) === originCountry;

      const matchesDestination =
        !destinationCountry ||
        referenceNormalizeUpperText(
          normalized
            .destinationCountry
        ) === destinationCountry;

      return (
        matchesServiceType &&
        matchesOrigin &&
        matchesDestination
      );
    }
  );
};

export const mapServicePricingsToOptions =
  (pricings = []) => {
    if (!Array.isArray(pricings)) {
      return [];
    }

    return pricings.map(
      (pricing) => {
        const normalized =
          normalizeServicePricing(
            pricing
          );

        return {
          value: normalized.id,

          label:
            `${normalized.serviceTypeDisplayName} • ` +
            `${normalized.routeDisplayName} • ` +
            `${normalized.formattedPrice}/${normalized.unitType}`,

          ...normalized,

          searchText: [
            normalized
              .serviceTypeDisplayName,
            normalized
              .routeDisplayName,
            normalized
              .formattedPrice,
            normalized.unitType,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        };
      }
    );
  };

export const mapPricingRulesToOptions =
  (rules = []) => {
    if (!Array.isArray(rules)) {
      return [];
    }

    return rules.map((rule) => {
      const normalized =
        normalizePricingRule(rule);

      return {
        value: normalized.id,

        label:
          `${normalized.ruleName} • ` +
          `${normalized.calculationTypeDisplayName}`,

        ...normalized,

        searchText: [
          normalized.ruleName,
          normalized.ruleCode,
          normalized.ruleType,
          normalized.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    });
  };

/* =====================================================
   DEFAULT EXPORT
===================================================== */

const consignmentService = {
  calculateVolumeM3FromItems,
  convertM3ToCm3,

  normalizeQuotationPayload,
  normalizeConsignmentStatusPayload,

  getConsignmentsApi,
  getConsignmentDetailApi,

  updateConsignmentStatusApi,
  approveConsignmentApi,
  rejectConsignmentApi,

  estimateQuotationApi,
  sendQuotationApi,

  RESTRICTION_TYPE,
  PRICING_RULE_STATUS,
  PRICING_RULE_CODE,

  getCountryDisplayName,
  getServiceTypeDisplayName,
  getRestrictionTypeDisplayName,
  getCalculationTypeDisplayName,
  formatVnd,
  formatEffectiveDate,

  normalizeRestrictedItem,
  normalizeServicePricing,
  normalizePricingRule,

  getRestrictedItemsApi,
  getRestrictedItemDetailApi,
  getActiveRestrictedItemsApi,

  getServicePricingsApi,
  getServicePricingDetailApi,

  getPricingRulesApi,
  getPricingRuleDetailApi,
  getActivePricingRulesApi,

  findRestrictedItemById,
  findServicePricingById,
  findPricingRuleById,
  findPricingRuleByCode,

  filterRestrictedItems,
  filterServicePricings,

  mapServicePricingsToOptions,
  mapPricingRulesToOptions,
};

export default consignmentService;
