import { isMockMode } from "@/shared/config/dataSource";
import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";

async function listUsersMock() {
  await mockDelay();
  return getMockStore().users.map((user) => ({ ...user }));
}

async function lockUserMock(userId) {
  await mockDelay();
  const user = getMockStore().users.find((item) => item.id === userId);
  if (user) {
    user.status = "LOCKED";
    user.lastSeen = "Đã khóa";
  }
  return { message: "Đã khóa tài khoản." };
}

async function unlockUserMock(userId) {
  await mockDelay();
  const user = getMockStore().users.find((item) => item.id === userId);
  if (user) {
    user.status = "ACTIVE";
    user.lastSeen = "Vừa mở khóa";
  }
  return { message: "Đã mở khóa tài khoản." };
}

export async function listUsers() {
  if (isMockMode()) return listUsersMock();

  return apiRequest("/api/User");
}

export function lockUser(userId) {
  if (isMockMode()) return lockUserMock(userId);

  return apiRequest(`/api/User/${userId}/lock`, {
    method: "PUT",
  });
}

export function unlockUser(userId) {
  if (isMockMode()) return unlockUserMock(userId);

  return apiRequest(`/api/User/${userId}/unlock`, {
    method: "PUT",
  });
}
