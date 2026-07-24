import { isMockMode } from "@/utils/mocks/dataSource";
import { listExportProceduresApi } from "./api";
import { listExportProceduresMock } from "./mock";
import { normalizeExportProcedureList } from "./mappers";

export {
  buildDocumentProgress,
  buildExportProcedureSummary,
  CUSTOMS_CHANNEL_LABELS,
  CUSTOMS_STATUS_LABELS,
  DOCUMENT_GROUPS,
  getDocumentStatusMeta,
  getExportProcedureStatusMeta,
  getNearestCutoff,
  getRequirementMeta,
  isDocumentDone,
  LOAD_TYPE_LABELS,
  normalizeExportProcedure,
} from "./mappers";

export async function listExportProcedures() {
  let payload;

  if (isMockMode()) {
    payload = await listExportProceduresMock();
  } else {
    try {
      payload = await listExportProceduresApi();
    } catch (error) {
      if (error?.status !== 404) throw error;
      payload = await listExportProceduresMock();
    }
  }

  return normalizeExportProcedureList(payload);
}
