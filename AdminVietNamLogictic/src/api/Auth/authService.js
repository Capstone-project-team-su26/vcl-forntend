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

const getAccessToken = () => {
  const token = sessionStorage.getItem(
    "accessToken"
  );

  if (!token) {
    throw new Error(
      "Không tìm thấy token. Vui lòng đăng nhập lại."
    );
  }

  return token;
};

/* =========================
   ĐĂNG NHẬP
========================= */

export const loginApi = async ({
  email,
  password,
}) => {
  const response = await axiosInstance.post(
    "/api/Auth/login",
    {
      email: String(email || "").trim(),
      password,
    }
  );

  return getResponseData(response);
};

/* =========================
   LẤY THÔNG TIN PROFILE
========================= */

export const getUserProfileApi = async () => {
  const token = getAccessToken();

  const response = await axiosInstance.get(
    "/api/User/profile",
    {
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return getResponseData(response);
};

/* =========================
   CẬP NHẬT PROFILE
========================= */

export const updateUserProfileApi = async ({
  fullName,
  phone,
  country,
  address,
}) => {
  const token = getAccessToken();

  const payload = {
    fullName: String(fullName || "").trim(),
    phone: String(phone || "").trim(),
    country: String(country || "").trim(),
    address: String(address || "").trim(),
  };

  if (!payload.fullName) {
    throw new Error(
      "Vui lòng nhập họ và tên."
    );
  }

  const response = await axiosInstance.put(
    "/api/User/profile",
    payload,
    {
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return getResponseData(response);
};