import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { normalizeUserFromApi } from "./mappers";

export async function listUsersMock() {
  await mockDelay();
  return getMockStore().users.map((user) =>
    normalizeUserFromApi({
      ...user,
      fullName: user.fullName ?? user.name,
      userType: user.userType ?? (user.role === "Customer" ? "Customer" : "Employee"),
    })
  );
}

export async function lockUserMock(userId) {
  await mockDelay();
  const user = getMockStore().users.find((item) => item.id === userId);
  if (user) {
    user.status = "LOCKED";
    user.lastSeen = "Đã khóa";
  }
  return { message: "Đã khóa tài khoản." };
}

export async function unlockUserMock(userId) {
  await mockDelay();
  const user = getMockStore().users.find((item) => item.id === userId);
  if (user) {
    user.status = "ACTIVE";
    user.lastSeen = "Vừa mở khóa";
  }
  return { message: "Đã mở khóa tài khoản." };
}
