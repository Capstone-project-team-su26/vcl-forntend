import { mockDelay } from "@/shared/mocks/mockDelay";
import { getMockStore } from "@/shared/mocks/mockStore";
import { apiRequest } from "@/shared/services/apiClient";

export async function listUsers() {
  await mockDelay();
  return getMockStore().users.map((user) => ({ ...user }));
}

export function lockUser(userId) {
  return apiRequest(`/api/User/${userId}/lock`, {
    method: "PUT",
  });
}

export function unlockUser(userId) {
  return apiRequest(`/api/User/${userId}/unlock`, {
    method: "PUT",
  });
}
