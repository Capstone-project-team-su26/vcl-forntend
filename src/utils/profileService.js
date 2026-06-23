import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { apiRequest } from "@/utils/apiClient";

async function getProfileMock() {
  await mockDelay();
  return { ...getMockStore().profile };
}

async function updateProfileMock(payload) {
  await mockDelay();
  Object.assign(getMockStore().profile, payload);
  return {
    message: "Cập nhật hồ sơ thành công.",
    profile: { ...getMockStore().profile },
  };
}

async function activateProfileMock(payload) {
  await mockDelay();
  Object.assign(getMockStore().profile, payload, { setupProgress: 100 });
  return {
    message: "Kích hoạt tài khoản thành công.",
    profile: { ...getMockStore().profile },
  };
}

export async function getProfile() {
  if (isMockMode()) return getProfileMock();

  return apiRequest("/api/Profile");
}

export async function updateProfile(payload) {
  if (isMockMode()) return updateProfileMock(payload);

  return apiRequest("/api/Profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function activateProfile(payload) {
  if (isMockMode()) return activateProfileMock(payload);

  return apiRequest("/api/Profile/activate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
