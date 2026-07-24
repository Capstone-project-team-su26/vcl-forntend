export const DOCUMENT_GROUPS = [
  { key: "COMMERCIAL", label: "Chứng từ thương mại", icon: "lucide:receipt-text" },
  { key: "CUSTOMS", label: "Hồ sơ hải quan", icon: "lucide:landmark" },
  { key: "CARRIER_PORT", label: "Hãng tàu & cảng", icon: "lucide:ship" },
  { key: "POST_DEPARTURE", label: "Sau khi tàu chạy", icon: "lucide:files" },
];

export const LOAD_TYPE_LABELS = {
  FCL: "FCL · Nguyên container",
  LCL: "LCL · Hàng lẻ",
};

export const CUSTOMS_STATUS_LABELS = {
  NOT_DECLARED: "Chưa khai",
  SUBMITTED: "Đã truyền tờ khai",
  INSPECTION: "Đang kiểm tra",
  CLEARED: "Đã thông quan",
};

export const CUSTOMS_CHANNEL_LABELS = {
  GREEN: "Luồng xanh",
  YELLOW: "Luồng vàng",
  RED: "Luồng đỏ",
  UNASSIGNED: "Chưa phân luồng",
};

const PROCEDURE_STATUS_META = {
  PREPARING: { label: "Đang chuẩn bị", tone: "neutral", icon: "lucide:clipboard-list" },
  CUSTOMS_PROCESSING: {
    label: "Đang thông quan",
    tone: "info",
    icon: "lucide:scan-line",
  },
  READY_TO_LOAD: {
    label: "Sẵn sàng xếp tàu",
    tone: "success",
    icon: "lucide:badge-check",
  },
  AT_RISK: { label: "Có nguy cơ trễ", tone: "danger", icon: "lucide:triangle-alert" },
  COMPLETED: { label: "Đã hoàn tất", tone: "success", icon: "lucide:circle-check-big" },
};

const DOCUMENT_STATUS_META = {
  NOT_STARTED: { label: "Chưa có", tone: "neutral", icon: "lucide:circle-dashed" },
  IN_PROGRESS: { label: "Đang xử lý", tone: "warning", icon: "lucide:clock-3" },
  SUBMITTED: { label: "Đã nộp", tone: "info", icon: "lucide:send" },
  APPROVED: { label: "Đã duyệt", tone: "success", icon: "lucide:circle-check" },
  ISSUE: { label: "Có vướng mắc", tone: "danger", icon: "lucide:circle-alert" },
  NOT_APPLICABLE: { label: "Không áp dụng", tone: "neutral", icon: "lucide:minus" },
};

const REQUIREMENT_META = {
  LEGAL_REQUIRED: { label: "Bắt buộc", tone: "danger" },
  CONDITIONAL: { label: "Theo điều kiện", tone: "warning" },
  OPERATIONAL: { label: "Vận hành", tone: "info" },
};

const DONE_DOCUMENT_STATUSES = new Set(["SUBMITTED", "APPROVED"]);

function normalizeKey(value, fallback) {
  const key = String(value ?? "").trim().toUpperCase();
  return key || fallback;
}

function toTimestamp(value) {
  if (!value) return Number.NaN;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
}

function normalizeDocument(document, index, now) {
  const requirement = normalizeKey(document?.requirement, "OPERATIONAL");
  const normalized = {
    id: document?.id ?? document?.code ?? `document-${index + 1}`,
    code: document?.code ?? "",
    label: document?.label ?? "Chứng từ chưa đặt tên",
    group: normalizeKey(document?.group, "COMMERCIAL"),
    requirement,
    status: normalizeKey(document?.status, "NOT_STARTED"),
    blocking: document?.blocking ?? requirement === "LEGAL_REQUIRED",
    dueAt: document?.dueAt ?? null,
    owner: document?.owner ?? "",
    reference: document?.reference ?? "",
    note: document?.note ?? "",
  };
  const dueTimestamp = toTimestamp(normalized.dueAt);
  return {
    ...normalized,
    isOverdue:
      !isDocumentDone(normalized) &&
      Number.isFinite(dueTimestamp) &&
      dueTimestamp < now.getTime(),
  };
}

function normalizeCutoff(cutoff, index, now) {
  const dueAt = cutoff?.dueAt ?? null;
  const dueTimestamp = toTimestamp(dueAt);
  return {
    id: cutoff?.id ?? `cutoff-${index + 1}`,
    label: cutoff?.label ?? "Cut-off",
    dueAt,
    completed: Boolean(cutoff?.completed),
    isOverdue:
      !cutoff?.completed && Number.isFinite(dueTimestamp) && dueTimestamp < now.getTime(),
  };
}

export function isDocumentDone(document) {
  return DONE_DOCUMENT_STATUSES.has(normalizeKey(document?.status, "NOT_STARTED"));
}

export function buildDocumentProgress(documents, now = new Date()) {
  const applicable = (Array.isArray(documents) ? documents : []).filter(
    (document) => normalizeKey(document?.status, "NOT_STARTED") !== "NOT_APPLICABLE"
  );
  const completed = applicable.filter(isDocumentDone);
  const blockers = applicable.filter((document) => {
    if (!document.blocking || isDocumentDone(document)) return false;
    const isIssue = normalizeKey(document.status, "NOT_STARTED") === "ISSUE";
    const dueTimestamp = toTimestamp(document.dueAt);
    return isIssue || (Number.isFinite(dueTimestamp) && dueTimestamp < now.getTime());
  });

  return {
    applicableCount: applicable.length,
    completedCount: completed.length,
    percent: applicable.length ? Math.round((completed.length / applicable.length) * 100) : 100,
    missingCount: applicable.length - completed.length,
    issueCount: applicable.filter(
      (document) => normalizeKey(document.status, "NOT_STARTED") === "ISSUE"
    ).length,
    overdueCount: applicable.filter((document) => {
      if (isDocumentDone(document)) return false;
      const dueTimestamp = toTimestamp(document.dueAt);
      return Number.isFinite(dueTimestamp) && dueTimestamp < now.getTime();
    }).length,
    blockerCount: blockers.length,
  };
}

export function getNearestCutoff(cutoffs, now = new Date()) {
  const pending = (Array.isArray(cutoffs) ? cutoffs : [])
    .map((cutoff, index) => normalizeCutoff(cutoff, index, now))
    .filter((cutoff) => !cutoff.completed && Number.isFinite(toTimestamp(cutoff.dueAt)))
    .sort((a, b) => toTimestamp(a.dueAt) - toTimestamp(b.dueAt));

  return pending[0] ?? null;
}

function deriveProcedureStatus(batch, progress, cutoffs, now) {
  const nearestCutoff = getNearestCutoff(cutoffs, now);
  const hasBlockingRisk = progress.blockerCount > 0 || Boolean(nearestCutoff?.isOverdue);
  const customsStatus = normalizeKey(batch?.customs?.status, "NOT_DECLARED");
  const etdTimestamp = toTimestamp(batch?.etd);
  const departed = Number.isFinite(etdTimestamp) && etdTimestamp < now.getTime();

  if (progress.percent === 100 && customsStatus === "CLEARED" && departed) return "COMPLETED";
  if (hasBlockingRisk) return "AT_RISK";
  if (["SUBMITTED", "INSPECTION"].includes(customsStatus)) return "CUSTOMS_PROCESSING";

  const blockingDocuments = batch.documents.filter(
    (document) => document.blocking && document.status !== "NOT_APPLICABLE"
  );
  if (customsStatus === "CLEARED" && blockingDocuments.every(isDocumentDone)) {
    return "READY_TO_LOAD";
  }
  return "PREPARING";
}

export function normalizeExportProcedure(batch, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date(options.now ?? Date.now());
  const documents = (Array.isArray(batch?.documents) ? batch.documents : []).map(
    (document, index) => normalizeDocument(document, index, now)
  );
  const cutoffs = (Array.isArray(batch?.cutoffs) ? batch.cutoffs : []).map((cutoff, index) =>
    normalizeCutoff(cutoff, index, now)
  );
  const base = {
    id: batch?.id ?? batch?.jobCode ?? "",
    jobCode: batch?.jobCode ?? "—",
    masterCode: batch?.masterCode ?? "",
    bookingNumber: batch?.bookingNumber ?? "—",
    loadType: normalizeKey(batch?.loadType, "FCL"),
    carrier: batch?.carrier ?? "—",
    vesselVoyage: batch?.vesselVoyage ?? "—",
    originPort: batch?.originPort ?? "—",
    destinationPort: batch?.destinationPort ?? "—",
    customerName: batch?.customerName ?? "—",
    etd: batch?.etd ?? null,
    isDemo: Boolean(batch?.isDemo),
    customs: {
      declarationNumber: batch?.customs?.declarationNumber ?? "",
      status: normalizeKey(batch?.customs?.status, "NOT_DECLARED"),
      channel: normalizeKey(batch?.customs?.channel, "UNASSIGNED"),
    },
    cutoffs,
    documents,
  };
  const progress = buildDocumentProgress(documents, now);
  const nearestCutoff = getNearestCutoff(cutoffs, now);
  const status = deriveProcedureStatus(base, progress, cutoffs, now);

  return { ...base, progress, nearestCutoff, status };
}

export function normalizeExportProcedureList(payload, options = {}) {
  const source = Array.isArray(payload) ? payload : payload?.items;
  return (Array.isArray(source) ? source : []).map((batch) =>
    normalizeExportProcedure(batch, options)
  );
}

export function buildExportProcedureSummary(items) {
  const batches = Array.isArray(items) ? items : [];
  return {
    total: batches.length,
    atRisk: batches.filter((item) => item.status === "AT_RISK").length,
    customsProcessing: batches.filter((item) => item.status === "CUSTOMS_PROCESSING").length,
    readyToLoad: batches.filter((item) => item.status === "READY_TO_LOAD").length,
  };
}

export function getExportProcedureStatusMeta(status) {
  const key = normalizeKey(status, "PREPARING");
  return PROCEDURE_STATUS_META[key] ?? {
    label: key,
    tone: "neutral",
    icon: "lucide:circle-help",
  };
}

export function getDocumentStatusMeta(status) {
  const key = normalizeKey(status, "NOT_STARTED");
  return DOCUMENT_STATUS_META[key] ?? {
    label: key,
    tone: "neutral",
    icon: "lucide:circle-help",
  };
}

export function getRequirementMeta(requirement) {
  const key = normalizeKey(requirement, "OPERATIONAL");
  return REQUIREMENT_META[key] ?? { label: key, tone: "neutral" };
}
