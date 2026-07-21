const TTL_MS = 5 * 60 * 1000;
const cache = new Map();
const inflight = new Map();

/**
 * @param {string} [id] — omit = clear all
 */
export function clearConsignmentDetailCache(id) {
  if (id) {
    cache.delete(id);
    inflight.delete(id);
    return;
  }
  cache.clear();
  inflight.clear();
}

/**
 * Detail ký gửi có cache TTL + dedupe in-flight (tránh N request trùng khi đổi trang / remount).
 * @param {string} id
 */
export async function getCachedConsignmentDetail(id) {
  if (!id) return null;

  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.data;
  }

  const pending = inflight.get(id);
  if (pending) return pending;

  const request = (async () => {
    const { getStaffConsignment } = await import("@/modules/consignments");
    return getStaffConsignment(id);
  })()
    .then((data) => {
      cache.set(id, { at: Date.now(), data });
      inflight.delete(id);
      return data;
    })
    .catch((error) => {
      inflight.delete(id);
      throw error;
    });

  inflight.set(id, request);
  return request;
}

/** Gộp summary list + detail để card đủ SP / SĐT / địa chỉ / kiểm hàng. */
export function mergeSummaryWithDetail(summary, detail) {
  if (!summary) return null;
  if (!detail) return summary;

  const fromItems = Array.isArray(detail.items)
    ? detail.items.map((entry) => entry?.productName).filter(Boolean)
    : [];
  const productNames =
    fromItems.length > 0
      ? fromItems
      : detail.productName
        ? [detail.productName]
        : Array.isArray(summary.productNames)
          ? summary.productNames
          : [];

  return {
    ...summary,
    consignmentCode: detail.consignmentCode ?? summary.consignmentCode,
    customerName: detail.customerName || summary.customerName,
    receiverName: detail.receiverName ?? summary.receiverName,
    receiverPhone: detail.receiverPhone ?? summary.receiverPhone,
    receiverAddress: detail.receiverAddress ?? summary.receiverAddress,
    requiresInspection:
      detail.requiresInspection === true || summary.requiresInspection === true,
    productNames,
    consignmentType: detail.consignmentType ?? summary.consignmentType,
    // List API là nguồn status mới hơn; cache detail (TTL 5’) không được ghi đè.
    status: summary.status ?? detail.status,
    totalWeight: detail.totalWeight ?? summary.totalWeight,
    totalVolume: detail.totalVolume ?? summary.totalVolume,
    totalVolumeM3: detail.totalVolumeM3 ?? summary.totalVolumeM3,
    packageCount: detail.packageCount ?? summary.packageCount,
    items: detail.items ?? summary.items,
    route: detail.route ?? summary.route,
    destination: detail.destination ?? summary.destination,
    warehouseName: detail.warehouseName ?? summary.warehouseName,
  };
}

/**
 * Fetch detail cho một trang list, concurrency giới hạn.
 * @param {string[]} ids
 * @param {{ concurrency?: number }} [options]
 * @returns {Promise<Record<string, object>>}
 */
export async function fetchConsignmentDetailsByIds(ids, { concurrency = 3 } = {}) {
  const unique = [...new Set(ids.filter(Boolean))];
  const result = {};
  let index = 0;

  async function worker() {
    while (index < unique.length) {
      const current = unique[index];
      index += 1;
      try {
        result[current] = await getCachedConsignmentDetail(current);
      } catch {
        // ponytail: card vẫn hiện summary nếu 1 detail fail.
      }
    }
  }

  const pool = Array.from({ length: Math.min(concurrency, unique.length) }, () => worker());
  await Promise.all(pool);
  return result;
}
