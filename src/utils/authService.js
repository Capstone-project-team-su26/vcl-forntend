import { isMockMode } from "@/utils/mocks/dataSource";
import {
  mockAdminRegisterEmployee,
  mockForgotPassword,
  mockLogin,
  mockResetPassword,
} from "@/utils/mocks/authMocks";
import { apiRequest } from "@/utils/apiClient";

export function login(payload) {
  if (isMockMode()) return mockLogin(payload);

  return apiRequest("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function forgotPassword(payload) {
  if (isMockMode()) return mockForgotPassword(payload);

  return apiRequest("/api/Auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function resetPassword(payload) {
  if (isMockMode()) return mockResetPassword(payload);

  return apiRequest("/api/Auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function adminRegisterEmployee(payload) {
  if (isMockMode()) return mockAdminRegisterEmployee(payload);

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
