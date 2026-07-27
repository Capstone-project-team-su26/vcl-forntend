import axiosInstance from "../../axiosInstance";
import { API_ENDPOINTS } from "../../apiEndpoints";

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
   COMMON HELPERS
========================= */

const normalizeText = (value) => {
  return String(value ?? "").trim();
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  const normalizedValue =
    normalizeText(value).toLowerCase();

  return [
    "true",
    "1",
    "active",
    "enabled",
  ].includes(normalizedValue);
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

  if (Array.isArray(data?.customers)) {
    return data.customers;
  }

  return [];
};

/* =========================
   NORMALIZE CUSTOMER
========================= */

export const normalizeCustomer = (
  customer = {}
) => {
  const id =
    normalizeText(
      customer?.id
    ) ||
    normalizeText(
      customer?.customerId
    ) ||
    normalizeText(
      customer?.userId
    );

  const fullName =
    normalizeText(
      customer?.fullName
    ) ||
    normalizeText(
      customer?.name
    ) ||
    normalizeText(
      customer?.customerName
    );

  return {
    id,
    customerId: id,

    customerCode:
      normalizeText(
        customer?.customerCode
      ) ||
      normalizeText(
        customer?.code
      ),

    fullName,

    email:
      normalizeText(
        customer?.email
      ),

    phone:
      normalizeText(
        customer?.phone
      ) ||
      normalizeText(
        customer?.phoneNumber
      ),

    address:
      normalizeText(
        customer?.address
      ),

    country:
      normalizeText(
        customer?.country
      ),

    region:
      normalizeText(
        customer?.region
      ),

    status:
      normalizeText(
        customer?.status
      ).toUpperCase(),

    isActive:
      customer?.isActive !==
        undefined
        ? normalizeBoolean(
            customer?.isActive
          )
        : normalizeText(
            customer?.status
          ).toUpperCase() ===
          "ACTIVE",

    createdAt:
      customer?.createdAt || null,

    updatedAt:
      customer?.updatedAt || null,

    raw: customer,
  };
};

/* =========================
   GET CUSTOMERS
========================= */

/**
 * GET /api/customers
 *
 * Có thể truyền bộ lọc:
 * {
 *   search,
 *   status,
 *   page,
 *   pageSize
 * }
 */
export const getCustomersApi = async (
  filters = {}
) => {
  const response =
    await axiosInstance.get(
      API_ENDPOINTS.customers.list,
      {
        params:
          removeEmptyParams(filters),

        headers:
          getAuthHeaders(),
      }
    );

  const data =
    getResponseData(response);

  return getArrayItems(data)
    .map(normalizeCustomer)
    .filter(
      (customer) =>
        Boolean(customer.id)
    );
};


/* =========================
   GET CUSTOMER BY ID
========================= */

/**
 * GET /api/customers/{customerId}
 */
export const getCustomerByIdApi = async (
  customerId
) => {
  const normalizedCustomerId =
    normalizeText(customerId);

  if (!normalizedCustomerId) {
    throw new Error(
      "Không tìm thấy mã khách hàng."
    );
  }

  const response =
    await axiosInstance.get(
      API_ENDPOINTS.customers.detail(normalizedCustomerId),
      {
        headers:
          getAuthHeaders(),
      }
    );

  const data =
    getResponseData(response);

  if (!data) {
    return null;
  }

  return normalizeCustomer(data);
};

/* =========================
   GET ACTIVE CUSTOMERS
========================= */

export const getActiveCustomersApi =
  async (filters = {}) => {
    const customers =
      await getCustomersApi(filters);

    return customers.filter(
      (customer) =>
        customer.isActive === true
    );
  };

/* =========================
   MAP CUSTOMER OPTIONS
========================= */

export const mapCustomersToOptions = (
  customers = []
) => {
  if (!Array.isArray(customers)) {
    return [];
  }

  return customers
    .filter(
      (customer) =>
        Boolean(customer?.id)
    )
    .map((customer) => {
      const fullName =
        normalizeText(
          customer?.fullName
        ) || "Khách hàng";

      const phone =
        normalizeText(
          customer?.phone
        );

      const email =
        normalizeText(
          customer?.email
        );

      const customerCode =
        normalizeText(
          customer?.customerCode
        );

      const extraInfo = [
        customerCode,
        phone,
        email,
      ]
        .filter(Boolean)
        .join(" • ");

      return {
        value: customer.id,

        label: extraInfo
          ? `${fullName} — ${extraInfo}`
          : fullName,

        id: customer.id,
        customerId: customer.id,
        customerCode,
        fullName,
        phone,
        email,
        address:
          customer?.address || "",
        status:
          customer?.status || "",
        isActive:
          customer?.isActive === true,

        searchText: [
          fullName,
          customerCode,
          phone,
          email,
          customer?.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    });
};

/* =========================
   FIND CUSTOMER BY ID
========================= */

export const findCustomerById = (
  customers = [],
  customerId
) => {
  if (!Array.isArray(customers)) {
    return null;
  }

  const normalizedId =
    normalizeText(customerId);

  if (!normalizedId) {
    return null;
  }

  return (
    customers.find(
      (customer) =>
        normalizeText(
          customer?.id ??
            customer?.customerId
        ) === normalizedId
    ) || null
  );
};

/* =========================
   DEFAULT EXPORT
========================= */

const customerService = {
  normalizeCustomer,

  getCustomersApi,
  getCustomerByIdApi,
  getActiveCustomersApi,

  mapCustomersToOptions,
  findCustomerById,
};

export default customerService;
