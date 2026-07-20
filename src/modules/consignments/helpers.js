/** Status helpers / formatters — shared by index + mock (avoid circular imports). */

export const CONSIGNMENT_APPROVABLE_STATUSES = ["QUOTATION_CONFIRMED", "DEPOSIT_PAID"];
/** @deprecated Dùng CONSIGNMENT_APPROVABLE_STATUSES */
export const CONSIGNMENT_APPROVABLE_STATUS = "QUOTATION_CONFIRMED";

export function canStaffSendConsignmentQuotation(detail) {
  if (!detail) return false;
  return detail.status === "PENDING_REVIEW" || detail.status === "QUOTATION_REJECTED";
}

export function canCustomerAcceptConsignmentQuotation(detail) {
  if (!detail) return false;
  return detail.status === "QUOTATION_SENT" && Boolean(detail.quotation);
}

export function canCustomerRejectConsignmentQuotation(detail) {
  if (!detail) return false;
  return detail.status === "QUOTATION_SENT" && Boolean(detail.quotation);
}

export function canStaffUpdateConsignmentStatus(status) {
  return CONSIGNMENT_APPROVABLE_STATUSES.includes(status);
}

/** Sales chỉ từ chối yêu cầu trước khi gửi báo giá. */
export function canStaffRejectConsignmentStatus(status) {
  return status === "PENDING_REVIEW";
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value ?? "")
  );
}

/** Mã hiển thị cho người dùng — không dùng orderId UUID nội bộ. */
export function formatConsignmentDisplayCode(detail) {
  if (!detail) return null;
  if (detail.consignmentCode) return detail.consignmentCode;
  if (detail.id && !isUuid(detail.id)) return detail.id;
  return null;
}

export function formatConsignmentPageTitle(detail) {
  return formatConsignmentDisplayCode(detail) ?? "Yêu cầu ký gửi";
}

export function formatConsignmentDate(isoDate) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
