import axiosInstance from "../../axiosInstance";

/* =========================================================
   CONSTANTS
========================================================= */

export const PURCHASE_REQUEST_STATUS = {
  PENDING_REVIEW: "PENDING_REVIEW",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  QUOTATION_SENT: "QUOTATION_SENT",
  WAITING_DEPOSIT: "WAITING_DEPOSIT",
  DEPOSIT_PAID: "DEPOSIT_PAID",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const PURCHASE_SHIPPING_OPTION = {
  STANDARD: "STANDARD",
  EXPRESS: "EXPRESS",
  ECONOMY: "ECONOMY",
};

/* =========================================================
   RESPONSE HELPER
========================================================= */

const getResponseData = (response) => {
  return (
    response?.data?.data ??
    response?.data ??
    null
  );
};

/* =========================================================
   TOKEN HELPER
========================================================= */

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
    Authorization: `Bearer ${getAccessToken()}`,
  };
};

/* =========================================================
   PARAMS HELPER
========================================================= */

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

const normalizePositiveInteger = (
  value,
  fallback
) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return fallback;
  }

  return Math.trunc(number);
};

const normalizeText = (value) => {
  return String(value ?? "").trim();
};

const normalizeUpperText = (
  value
) => {
  return normalizeText(value)
    .toUpperCase();
};

/* =========================================================
   ERROR HELPER
========================================================= */

const getApiErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.title ||
    error?.message ||
    fallbackMessage
  );
};

/* =========================================================
   NORMALIZE LIST ITEM
========================================================= */

const normalizePurchaseRequestListItem =
  (item = {}) => {
    return {
      purchaseRequestId:
        item?.purchaseRequestId ?? "",

      purchaseCode:
        item?.purchaseCode ?? "",

      customerId:
        item?.customerId ?? "",

      route:
        item?.route ?? "",

      shippingOption:
        item?.shippingOption ?? null,

      receiverName:
        item?.receiverName ?? "",

      itemCount:
        Number(item?.itemCount) || 0,

      totalQuantity:
        Number(
          item?.totalQuantity
        ) || 0,

      status:
        item?.status ?? "",

      generalNote:
        item?.generalNote ?? "",

      createdAt:
        item?.createdAt ?? null,

      items:
        Array.isArray(item?.items)
          ? item.items.map(
              (
                purchaseItem = {}
              ) => ({
                productName:
                  purchaseItem
                    ?.productName ?? "",

                quantity:
                  Number(
                    purchaseItem
                      ?.quantity
                  ) || 0,
              })
            )
          : [],
    };
  };

/* =========================================================
   NORMALIZE LIST RESPONSE
========================================================= */

const normalizePurchaseRequestPage =
  (
    data = {},
    fallbackParams = {}
  ) => {
    const items =
      Array.isArray(data?.items)
        ? data.items.map(
            normalizePurchaseRequestListItem
          )
        : [];

    const pageNumber =
      normalizePositiveInteger(
        data?.pageNumber,
        normalizePositiveInteger(
          fallbackParams?.pageNumber,
          1
        )
      );

    const pageSize =
      normalizePositiveInteger(
        data?.pageSize,
        normalizePositiveInteger(
          fallbackParams?.pageSize,
          10
        )
      );

    const totalCount = Math.max(
      0,
      Number(data?.totalCount) ||
        items.length
    );

    const totalPages = Math.max(
      1,
      normalizePositiveInteger(
        data?.totalPages,
        Math.ceil(
          totalCount / pageSize
        ) || 1
      )
    );

    return {
      items,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
    };
  };

/* =========================================================
   NORMALIZE DETAIL ITEM
========================================================= */

const normalizePurchaseRequestItem =
  (item = {}) => {
    return {
      itemId:
        item?.itemId ?? "",

      productLink:
        item?.productLink ?? "",

      sourceWebsite:
        item?.sourceWebsite ?? "",

      productType:
        item?.productType ?? "",

      productName:
        item?.productName ?? "",

      quantity:
        Number(item?.quantity) || 0,

      attributes:
        item?.attributes ?? "",

      note:
        item?.note ?? "",

      imageUrls:
        Array.isArray(
          item?.imageUrls
        )
          ? item.imageUrls
              .map(normalizeText)
              .filter(Boolean)
          : [],
    };
  };

/* =========================================================
   NORMALIZE DETAIL RESPONSE
========================================================= */

const normalizePurchaseRequestDetail =
  (data = {}) => {
    return {
      purchaseRequestId:
        data?.purchaseRequestId ?? "",

      purchaseCode:
        data?.purchaseCode ?? "",

      customerId:
        data?.customerId ?? "",

      customerName:
        data?.customerName ?? "",

      createdByName:
        data?.createdByName ?? "",

      route:
        data?.route ?? "",

      shippingOption:
        data?.shippingOption ?? null,

      receiverName:
        data?.receiverName ?? "",

      receiverPhone:
        data?.receiverPhone ?? "",

      receiverAddress:
        data?.receiverAddress ?? "",

      requiresPacking:
        Boolean(
          data?.requiresPacking
        ),

      requiresWoodenCrate:
        Boolean(
          data?.requiresWoodenCrate
        ),

      requiresInsurance:
        Boolean(
          data?.requiresInsurance
        ),

      pricingRuleIds:
        Array.isArray(
          data?.pricingRuleIds
        )
          ? data.pricingRuleIds
              .map(normalizeText)
              .filter(Boolean)
          : [],

      generalNote:
        data?.generalNote ?? "",

      status:
        data?.status ?? "",

      reason:
        data?.reason ?? null,

      createdAt:
        data?.createdAt ?? null,

      totalQuantity:
        Number(
          data?.totalQuantity
        ) || 0,

      items:
        Array.isArray(data?.items)
          ? data.items.map(
              normalizePurchaseRequestItem
            )
          : [],

      quotation:
        data?.quotation ?? null,
    };
  };

/* =========================================================
   VALIDATE ID
========================================================= */

const validatePurchaseRequestId =
  (purchaseRequestId) => {
    const normalizedId =
      normalizeText(
        purchaseRequestId
      );

    if (!normalizedId) {
      throw new Error(
        "Không tìm thấy purchaseRequestId."
      );
    }

    return normalizedId;
  };

/* =========================================================
   GET PURCHASE REQUEST LIST
   GET /api/purchase-requests
========================================================= */

/**
 * @param {Object} filters
 * @param {number} filters.pageNumber
 * @param {number} filters.pageSize
 * @param {string} filters.status
 * @param {string} filters.search
 * @param {string} filters.customerId
 * @param {string} filters.route
 * @param {string} filters.shippingOption
 * @param {string} filters.fromDate
 * @param {string} filters.toDate
 */
export const getPurchaseRequestsApi =
  async (filters = {}) => {
    const params =
      removeEmptyParams({
        pageNumber:
          normalizePositiveInteger(
            filters?.pageNumber,
            1
          ),

        pageSize:
          normalizePositiveInteger(
            filters?.pageSize,
            10
          ),

        status:
          filters?.status
            ? normalizeUpperText(
                filters.status
              )
            : undefined,

        search:
          normalizeText(
            filters?.search
          ) || undefined,

        customerId:
          normalizeText(
            filters?.customerId
          ) || undefined,

        route:
          normalizeText(
            filters?.route
          ) || undefined,

        shippingOption:
          filters?.shippingOption
            ? normalizeUpperText(
                filters.shippingOption
              )
            : undefined,

        fromDate:
          normalizeText(
            filters?.fromDate
          ) || undefined,

        toDate:
          normalizeText(
            filters?.toDate
          ) || undefined,
      });

    try {
      const response =
        await axiosInstance.get(
          "/api/purchase-requests",
          {
            params,
            headers:
              getAuthHeaders(),
          }
        );

      const data =
        getResponseData(response);

      return normalizePurchaseRequestPage(
        data,
        params
      );
    } catch (error) {
      console.error(
        "GET PURCHASE REQUESTS ERROR:",
        error
      );

      throw new Error(
        getApiErrorMessage(
          error,
          "Không thể lấy danh sách yêu cầu mua hộ."
        )
      );
    }
  };

/* =========================================================
   GET PURCHASE REQUEST DETAIL
   GET /api/purchase-requests/{purchaseRequestId}
========================================================= */

export const getPurchaseRequestDetailApi =
  async (purchaseRequestId) => {
    const normalizedId =
      validatePurchaseRequestId(
        purchaseRequestId
      );

    try {
      const response =
        await axiosInstance.get(
          `/api/purchase-requests/${normalizedId}`,
          {
            headers:
              getAuthHeaders(),
          }
        );

      const data =
        getResponseData(response);

      return normalizePurchaseRequestDetail(
        data
      );
    } catch (error) {
      console.error(
        "GET PURCHASE REQUEST DETAIL ERROR:",
        error
      );

      throw new Error(
        getApiErrorMessage(
          error,
          "Không thể lấy chi tiết yêu cầu mua hộ."
        )
      );
    }
  };

/* =========================================================
   DEFAULT EXPORT
========================================================= */

const purchaseRequestService = {
  getPurchaseRequestsApi,
  getPurchaseRequestDetailApi,
};

export default purchaseRequestService;
