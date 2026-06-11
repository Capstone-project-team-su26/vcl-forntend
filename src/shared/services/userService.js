import { apiRequest } from "@/shared/services/apiClient";

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
