import { listStaffConsignments } from "@/modules/consignments";

function padCount(value) {
  return String(value ?? 0).padStart(2, "0");
}

function buildStatsFromCounts({ pending = 0, inProgress = 0, total = 0 } = {}) {
  return {
    stats: [
      {
        label: "CH�S DUY� T",
        value: padCount(pending),
        subtext: "Yêu cầu PENDING_REVIEW",
      },
      {
        label: "ĐANG XỬ LÝ",
        value: padCount(inProgress),
        subtext: "Đang xử lý / nhập kho",
      },
      {
        label: "T�NG Y�`U CẦU",
        value: padCount(total),
        subtext: "Tất cả trạng thái",
      },
    ],
  };
}

/** T�"ng quan Sales � lấy từ `/api/orders/consignments` (BE chưa có `/api/Staff/sales`). */
export async function getSalesWorkspaceApi() {
  const [pending, inProgress, inWarehouse, warehouseReceived, all] = await Promise.all([
    listStaffConsignments({ page: 1, pageSize: 1, status: "PENDING_REVIEW" }),
    listStaffConsignments({ page: 1, pageSize: 1, status: "IN_PROGRESS" }),
    listStaffConsignments({ page: 1, pageSize: 1, status: "IN_WAREHOUSE" }),
    listStaffConsignments({ page: 1, pageSize: 1, status: "WAREHOUSE_RECEIVED" }),
    listStaffConsignments({ page: 1, pageSize: 1 }),
  ]);

  return buildStatsFromCounts({
    pending: pending.totalCount,
    inProgress:
      inProgress.totalCount + inWarehouse.totalCount + warehouseReceived.totalCount,
    total: all.totalCount,
  });
}
