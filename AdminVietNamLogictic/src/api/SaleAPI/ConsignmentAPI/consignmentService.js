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

    // Cân nặng giữ nguyên theo kg
    weightKg: normalizePositiveNumber(
      payload?.weightKg
    ),

    // API nhận thể tích theo m³
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

      /*
       * Theo dữ liệu API response của bạn,
       * quotation.totalVolume đang là cm³.
       */
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
   LẤY DANH SÁCH ĐƠN KÝ GỬI
========================= */

export const getConsignmentsApi =
  async (filters = {}) => {
    const params =
      removeEmptyParams(filters);

    const response =
      await axiosInstance.get(
        "/api/orders/consignments",
        {
          params,
          headers: getAuthHeaders(),
        }
      );

    return getResponseData(response);
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

    return getResponseData(response);
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