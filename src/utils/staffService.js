import { isMockMode } from "@/utils/mocks/dataSource";
import { mockDelay } from "@/utils/mocks/mockDelay";
import { getMockStore } from "@/utils/mocks/mockStore";
import { listStaffConsignments } from "@/utils/orderConsignmentService";

async function getSalesWorkspaceMock() {
  await mockDelay();
  return { ...getMockStore().staff.sales };
}

function padCount(value) {
  return String(value ?? 0).padStart(2, "0");
}

function buildStatsFromCounts({ pending = 0, inProgress = 0, total = 0 } = {}) {
  return {
    stats: [
      {
        label: "CHỜ DUYỆT",
        value: padCount(pending),
        subtext: "Yêu cầu PENDING_REVIEW",
      },
      {
        label: "ĐANG XỬ LÝ",
        value: padCount(inProgress),
        subtext: "Đang xử lý / nhập kho",
      },
      {
        label: "TỔNG YÊU CẦU",
        value: padCount(total),
        subtext: "Tất cả trạng thái",
      },
    ],
  };
}

/** Tổng quan Sales — lấy từ `/api/orders/consignments` (BE chưa có `/api/Staff/sales`). */
async function getSalesWorkspaceFromApi() {
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

export async function getSalesWorkspace() {
  if (isMockMode()) return getSalesWorkspaceMock();

  return getSalesWorkspaceFromApi();
}
