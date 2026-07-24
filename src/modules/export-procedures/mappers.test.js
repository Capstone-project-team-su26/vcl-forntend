import { describe, expect, test } from "bun:test";
import {
  buildDocumentProgress,
  buildExportProcedureSummary,
  getNearestCutoff,
  normalizeExportProcedure,
} from "./mappers";

const NOW = new Date("2026-07-24T12:00:00+07:00");

describe("export procedure progress", () => {
  test("bỏ qua mục không áp dụng và tính mục đã nộp là hoàn thành", () => {
    const progress = buildDocumentProgress(
      [
        { status: "APPROVED", blocking: true },
        { status: "SUBMITTED", blocking: true },
        { status: "IN_PROGRESS", blocking: false },
        { status: "NOT_APPLICABLE", blocking: true },
      ],
      NOW
    );

    expect(progress).toMatchObject({
      applicableCount: 3,
      completedCount: 2,
      percent: 67,
      missingCount: 1,
      blockerCount: 0,
    });
  });

  test("coi lỗi hoặc quá hạn ở mục chặn là blocker", () => {
    const progress = buildDocumentProgress(
      [
        {
          status: "IN_PROGRESS",
          blocking: true,
          dueAt: "2026-07-24T08:00:00+07:00",
        },
        { status: "ISSUE", blocking: true },
        { status: "NOT_STARTED", blocking: false, dueAt: "2026-07-23T08:00:00+07:00" },
      ],
      NOW
    );

    expect(progress).toMatchObject({
      overdueCount: 2,
      issueCount: 1,
      blockerCount: 2,
    });
  });

  test("chọn cut-off chưa hoàn thành gần nhất và đánh dấu quá hạn", () => {
    const nearest = getNearestCutoff(
      [
        { id: "done", dueAt: "2026-07-23T10:00:00+07:00", completed: true },
        { id: "future", dueAt: "2026-07-25T10:00:00+07:00" },
        { id: "overdue", dueAt: "2026-07-24T10:00:00+07:00" },
      ],
      NOW
    );

    expect(nearest).toMatchObject({ id: "overdue", isOverdue: true });
  });
});

describe("export procedure normalization", () => {
  test("LCL bỏ VGM không áp dụng khỏi tiến độ và đang ở trạng thái thông quan", () => {
    const item = normalizeExportProcedure(
      {
        id: "lcl",
        loadType: "LCL",
        etd: "2026-07-26T12:00:00+07:00",
        customs: { status: "INSPECTION", channel: "YELLOW" },
        documents: [
          { code: "INVOICE", status: "APPROVED", requirement: "LEGAL_REQUIRED" },
          { code: "VGM", status: "NOT_APPLICABLE", requirement: "OPERATIONAL" },
        ],
      },
      { now: NOW }
    );

    expect(item.progress).toMatchObject({ applicableCount: 1, percent: 100 });
    expect(item.status).toBe("CUSTOMS_PROCESSING");
  });

  test("lô đã thông quan và xong mọi mục chặn sẵn sàng xếp tàu", () => {
    const item = normalizeExportProcedure(
      {
        id: "ready",
        etd: "2026-07-26T12:00:00+07:00",
        customs: { status: "CLEARED", channel: "GREEN" },
        documents: [
          {
            code: "DECLARATION",
            status: "APPROVED",
            requirement: "LEGAL_REQUIRED",
            blocking: true,
          },
          {
            code: "FINAL_BL",
            status: "NOT_STARTED",
            requirement: "OPERATIONAL",
            blocking: false,
          },
        ],
      },
      { now: NOW }
    );

    expect(item.status).toBe("READY_TO_LOAD");
  });

  test("tổng hợp đúng các trạng thái chính", () => {
    expect(
      buildExportProcedureSummary([
        { status: "AT_RISK" },
        { status: "CUSTOMS_PROCESSING" },
        { status: "READY_TO_LOAD" },
        { status: "COMPLETED" },
      ])
    ).toEqual({ total: 4, atRisk: 1, customsProcessing: 1, readyToLoad: 1 });
  });
});
