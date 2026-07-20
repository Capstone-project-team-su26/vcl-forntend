import { isMockMode } from "@/utils/mocks/dataSource";
import { apiRequest } from "@/utils/apiClient";

/** Login qua Route Handler — server set cookie HttpOnly đã ký. */
export function loginApi(payload) {
  const headers =
    isMockMode() && process.env.NODE_ENV === "development"
      ? { "x-vcl-data-source": "mock" }
      : undefined;

  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
    headers,
  });
}

export function forgotPasswordApi(payload) {
  return apiRequest("/api/Auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function resetPasswordApi(payload) {
  return apiRequest("/api/Auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function adminRegisterEmployeeApi(payload) {
  const body = {
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    role: payload.role,
  };
  // ponytail: Swagger RegisterRequest chưa liệt kê region; BE dùng để map Warehouse + region.
  if (payload.region) body.region = payload.region;

  return apiRequest("/api/User", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
