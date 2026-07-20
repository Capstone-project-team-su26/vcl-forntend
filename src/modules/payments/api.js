import { apiRequest } from "@/utils/apiClient";
import { listConsignments } from "@/modules/consignments";
import { normalizeOrderPaymentHistory } from "./mappers";

/** Trạng thái đơn có khả năng đã phát sinh thanh toán — giảm N+1. */
const LIKELY_PAID_ORDER_STATUSES = new Set([
  "WAITING_DEPOSIT",
  "WAITING_PAYMENT",
  "DEPOSIT_PAID",
  "WAITING_FINAL_PAYMENT",
  "PAYMENT_CONFIRMED",
  "PAID",
  "APPROVED",
  "IN_PROGRESS",
  "IN_WAREHOUSE",
  "WAREHOUSE_RECEIVED",
  "COMPLETED",
]);

export async function getOrderPaymentHistoryApi(orderId) {
  const raw = await apiRequest(
    `/api/orders/${encodeURIComponent(orderId)}/payments/history`
  );
  return normalizeOrderPaymentHistory(raw);
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(items.length, 1)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

/**
 * Gom l�9ch sử thanh toán từ các �ơn ký gửi gần �ây.
 * BE chưa có list toàn cục � FE gọi history theo order (gi�:i hạn + pool).
 */
export async function listFlattenedPaymentHistoryApi({
  orderPageSize = 60,
  concurrency = 5,
} = {}) {
  const list = await listConsignments({ page: 1, pageSize: orderPageSize });
  const orders = (list?.items ?? []).filter((order) => {
    const status = String(order.status ?? "").toUpperCase();
    return LIKELY_PAID_ORDER_STATUSES.has(status);
  });

  const histories = await mapPool(orders, concurrency, async (order) => {
    const orderId = order.id ?? order.orderId;
    try {
      return await getOrderPaymentHistoryApi(orderId);
    } catch {
      return null;
    }
  });

  return histories.filter(Boolean).flatMap((history) => history.payments);
}
