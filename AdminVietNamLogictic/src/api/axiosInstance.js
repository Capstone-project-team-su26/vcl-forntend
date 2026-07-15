import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(
    /\/+$/,
    "",
  );

if (!baseURL) {
  throw new Error(
    "Không tìm thấy VITE_API_BASE_URL trong file .env",
  );
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default axiosInstance;