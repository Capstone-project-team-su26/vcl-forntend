import { apiRequest } from "@/utils/apiClient";

export function listExportProceduresApi() {
  return apiRequest("/api/export-procedures");
}
