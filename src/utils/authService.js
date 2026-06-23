import { isMockMode } from "@/utils/mocks/dataSource";
import {
  mockAdminRegisterEmployee,
  mockForgotPassword,
  mockLogin,
  mockRegisterCustomer,
  mockResendCustomerOtp,
  mockResetPassword,
  mockVerifyCustomerOtp,
} from "@/utils/mocks/authMocks";
import { apiRequest } from "@/utils/apiClient";

export function registerCustomer(payload) {
  if (isMockMode()) return mockRegisterCustomer(payload);

  return apiRequest("/api/Auth/customer/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function verifyCustomerOtp(payload) {
  if (isMockMode()) return mockVerifyCustomerOtp(payload);

  return apiRequest("/api/Auth/customer/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function resendCustomerOtp(email) {
  if (isMockMode()) return mockResendCustomerOtp(email);

  return apiRequest("/api/Auth/customer/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

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

  return apiRequest("/api/User", {
    method: "POST",
    body: JSON.stringify({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      role: payload.role,
    }),
  });
}
