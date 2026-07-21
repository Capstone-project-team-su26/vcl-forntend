import { isMockMode } from "@/utils/mocks/dataSource";
import {
  loginApi,
  forgotPasswordApi,
  resetPasswordApi,
  adminRegisterEmployeeApi,
} from "./api";
import {
  forgotPasswordMock,
  resetPasswordMock,
  adminRegisterEmployeeMock,
} from "./mock";

export function login(payload) {
  return loginApi(payload);
}

export function forgotPassword(payload) {
  if (isMockMode()) return forgotPasswordMock(payload);
  return forgotPasswordApi(payload);
}

export function resetPassword(payload) {
  if (isMockMode()) return resetPasswordMock(payload);
  return resetPasswordApi(payload);
}

export function adminRegisterEmployee(payload) {
  if (isMockMode()) return adminRegisterEmployeeMock(payload);
  return adminRegisterEmployeeApi(payload);
}
