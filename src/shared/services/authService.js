import { apiRequest } from "@/shared/services/apiClient";

export function registerCustomer(payload) {
  return apiRequest("/api/Auth/customer/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function verifyCustomerOtp(payload) {
  return apiRequest("/api/Auth/customer/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function resendCustomerOtp(email) {
  return apiRequest("/api/Auth/customer/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export function login(payload) {
  return apiRequest("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function forgotPassword(payload) {
  return apiRequest("/api/Auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function resetPassword(payload) {
  return apiRequest("/api/Auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function adminRegisterEmployee(payload) {
  return apiRequest("/api/Auth/admin/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
