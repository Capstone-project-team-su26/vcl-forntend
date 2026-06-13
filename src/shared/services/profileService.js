import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";

export async function getProfile() {
  await mockDelay();
  return { ...getMockStore().profile };
}

export async function updateProfile(payload) {
  await mockDelay();
  Object.assign(getMockStore().profile, payload);
  return { message: "Cập nhật hồ sơ thành công.", profile: { ...getMockStore().profile } };
}

export async function activateProfile(payload) {
  await mockDelay();
  Object.assign(getMockStore().profile, payload, { setupProgress: 100 });
  return { message: "Kích hoạt tài khoản thành công.", profile: { ...getMockStore().profile } };
}
