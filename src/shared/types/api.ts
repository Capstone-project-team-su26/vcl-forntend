export interface CustomerRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  address: string;
}

export interface VerifyCustomerOtpRequest {
  email: string;
  otp: string;
}

export interface ResendCustomerOtpRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminRegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  userId: string;
  fullName: string;
  role: string;
}

export interface MessageResponse {
  message: string;
}

export interface VerifyOtpResponse extends MessageResponse {
  customerId: string;
}

export interface CreatedUserResponse {
  id: string;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
}

export { ApiError } from "@/shared/utils/apiError";
