import { mockDelay } from "@/utils/mocks/mockDelay";
import { resolveMockAccount } from "@/utils/mocks/mockAccounts";

function mockAuthResponse({ email, role, fullName }) {
  return {
    token: `mock-token-${role.toLowerCase()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    userId: `mock-${role.toLowerCase()}-001`,
    fullName,
    role,
    email,
  };
}

export async function mockLogin({ email }) {
  await mockDelay();

  const account = resolveMockAccount(email);
  if (!account) {
    const error = new Error("Email không thuộc tài khoản nhân viên.");
    error.status = 401;
    throw error;
  }

  return mockAuthResponse(account);
}

export async function mockForgotPassword() {
  await mockDelay();
  return { message: "Đã gửi liên kết đặt lại mật khẩu." };
}

export async function mockResetPassword() {
  await mockDelay();
  return { message: "Đặt lại mật khẩu thành công." };
}

export async function mockAdminRegisterEmployee(payload) {
  await mockDelay();
  return {
    message: "Tạo nhân viên thành công.",
    user: {
      id: `mock-user-${Date.now()}`,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    },
  };
}
