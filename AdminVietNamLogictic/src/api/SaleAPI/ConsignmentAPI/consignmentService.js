import axiosInstance from "../axiosInstance";

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
  const token = sessionStorage.getItem("accessToken");

  if (!token) {
    throw new Error(
      "Không tìm thấy token. Vui lòng đăng nhập lại."
    );
  }

  return token;
};

/* =========================
   XÓA PARAM RỖNG
========================= */

const removeEmptyParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return (
        value !== undefined &&
        value !== null &&
        value !== ""
      );
    })
  );
};

/* =========================
   LẤY DANH SÁCH ĐƠN KÝ GỬI
   KHÔNG TRUYỀN PHÂN TRANG
========================= */

export const getConsignmentsApi = async (
  filters = {}
) => {
  const token = getAccessToken();

  const params = removeEmptyParams(filters);

  const response = await axiosInstance.get(
    "/api/orders/consignments",
    {
      params,
      headers: {
        Accept: "text/plain",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return getResponseData(response);
};