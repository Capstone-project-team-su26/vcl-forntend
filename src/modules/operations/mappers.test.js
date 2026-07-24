import { describe, expect, test } from "bun:test";
import {
  buildConsolidationSummary,
  buildOperationalAnalytics,
  countConsolidationParcels,
  getConsolidationStatusMeta,
} from "./mappers";

const NOW = new Date("2026-07-24T12:00:00+07:00");

function consignment(id, createdAt, status, extra = {}) {
  return {
    id,
    createdAt,
    status,
    consignmentType: "STANDARD",
    route: "Hà Nội → TP.HCM",
    totalWeight: 10,
    ...extra,
  };
}

describe("buildOperationalAnalytics", () => {
  test("lọc đúng kỳ hiện tại và kỳ so sánh", () => {
    const result = buildOperationalAnalytics(
      [
        consignment("current", "2026-07-23T08:00:00+07:00", "APPROVED"),
        consignment("previous", "2026-07-16T08:00:00+07:00", "APPROVED"),
        consignment("old", "2026-07-01T08:00:00+07:00", "APPROVED"),
      ],
      { days: 7, now: NOW }
    );

    expect(result.rows.map((item) => item.id)).toEqual(["current"]);
    expect(result.kpis.find((item) => item.key === "total")).toMatchObject({
      value: 1,
      previousValue: 1,
      change: 0,
    });
  });

  test("áp dụng bộ lọc trạng thái và loại hàng", () => {
    const result = buildOperationalAnalytics(
      [
        consignment("express", "2026-07-23T08:00:00+07:00", "COMPLETED", {
          consignmentType: "EXPRESS",
        }),
        consignment("standard", "2026-07-22T08:00:00+07:00", "COMPLETED"),
        consignment("moving", "2026-07-21T08:00:00+07:00", "IN_PROGRESS", {
          consignmentType: "EXPRESS",
        }),
      ],
      { days: 7, status: "COMPLETED", consignmentType: "EXPRESS", now: NOW }
    );

    expect(result.rows.map((item) => item.id)).toEqual(["express"]);
    expect(result.kpis.find((item) => item.key === "completed")?.value).toBe(1);
  });

  test("gom bucket biểu đồ và tổng trọng lượng", () => {
    const result = buildOperationalAnalytics(
      [
        consignment("one", "2026-07-23T08:00:00+07:00", "IN_PROGRESS"),
        consignment("two", "2026-07-23T10:00:00+07:00", "IN_PROGRESS", {
          totalWeight: 25,
        }),
      ],
      { days: 7, now: NOW }
    );
    const bucket = result.trend.find((item) => item.date === "2026-07-23");

    expect(bucket).toMatchObject({ count: 2, totalWeight: 35 });
    expect(result.totalWeight).toBe(35);
  });

  test("xếp hạng tuyến và phân bổ trạng thái", () => {
    const result = buildOperationalAnalytics(
      [
        consignment("one", "2026-07-23T08:00:00+07:00", "APPROVED"),
        consignment("two", "2026-07-22T08:00:00+07:00", "APPROVED"),
        consignment("three", "2026-07-21T08:00:00+07:00", "COMPLETED", {
          route: "Đà Nẵng → TP.HCM",
        }),
      ],
      { days: 7, now: NOW }
    );

    expect(result.topRoutes[0]).toMatchObject({ route: "Hà Nội → TP.HCM", count: 2 });
    expect(result.statusBreakdown[0]).toMatchObject({
      status: "APPROVED",
      count: 2,
      percent: 67,
    });
  });
  test("gom alias trạng thái khi lọc và phân bổ", () => {
    const result = buildOperationalAnalytics(
      [
        consignment("deposit", "2026-07-23T08:00:00+07:00", "WAITING_DEPOSIT"),
        consignment("payment", "2026-07-22T08:00:00+07:00", "WAITING_PAYMENT"),
        consignment("checkin", "2026-07-21T08:00:00+07:00", "CHECKED_IN"),
      ],
      { days: 7, status: "WAITING_DEPOSIT", now: NOW }
    );

    expect(result.rows.map((item) => item.id).sort()).toEqual(["deposit", "payment"]);

    const all = buildOperationalAnalytics(
      [
        consignment("deposit", "2026-07-23T08:00:00+07:00", "WAITING_DEPOSIT"),
        consignment("payment", "2026-07-22T08:00:00+07:00", "WAITING_PAYMENT"),
        consignment("checkin", "2026-07-21T08:00:00+07:00", "CHECKED_IN"),
      ],
      { days: 7, now: NOW }
    );

    expect(all.statusBreakdown).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: "WAITING_DEPOSIT", count: 2 }),
        expect.objectContaining({ status: "IN_WAREHOUSE", count: 1 }),
      ])
    );
  });
});

describe("consolidation helpers", () => {
  const batch = (status, orders) => ({ status, totalWeight: 10, totalVolume: 0.5, orders });
  const order = (parcelCount) => ({ parcels: Array.from({ length: parcelCount }, (_, i) => ({ id: i })) });

  test("map trạng thái không phân biệt hoa thường, fallback neutral", () => {
    expect(getConsolidationStatusMeta("waiting")).toMatchObject({ tone: "warning" });
    expect(getConsolidationStatusMeta("CONSOLIDATED")).toMatchObject({ label: "Đã gom" });
    expect(getConsolidationStatusMeta("SOMETHING_NEW")).toMatchObject({
      label: "SOMETHING_NEW",
      tone: "neutral",
    });
  });

  test("đếm kiện và tổng hợp summary", () => {
    const items = [
      batch("waiting", [order(2), order(1)]),
      batch("COMPLETED", [order(3)]),
      batch("waiting", null),
    ];

    expect(countConsolidationParcels(items[0])).toBe(3);
    expect(buildConsolidationSummary(items)).toEqual({
      batches: 3,
      waiting: 2,
      orders: 3,
      parcels: 6,
      totalWeight: 30,
      totalVolume: 1.5,
    });
    expect(buildConsolidationSummary(null).batches).toBe(0);
  });
});
