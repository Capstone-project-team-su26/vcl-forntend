/** Shared private helpers for API mappers. */

export const RESTRICTION_FROM_API = {
  prohibited: "PROHIBITED",
  banned: "PROHIBITED",
  restricted: "RESTRICTED",
  warning: "CONDITIONAL",
  conditional: "CONDITIONAL",
};

export const RESTRICTION_TO_API = {
  PROHIBITED: "Prohibited",
  RESTRICTED: "Restricted",
  CONDITIONAL: "Warning",
};

export function getInitials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function formatUserDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Tên hiển thị từ vài key BE thường dùng; bỏ "—" giả. */
export function pickDisplayName(...candidates) {
  for (const value of candidates) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text && text !== "—") return text;
  }
  return null;
}

export function resolveCustomerDisplayName(item) {
  const customer = item?.customer;
  return pickDisplayName(
    customer?.fullName,
    customer?.name,
    item?.customerName,
    item?.customerFullName
  );
}

export function resolvePartyFromApi(item, role) {
  const nested = item?.[role];
  const prefix = role; // sender | receiver
  return {
    name: pickDisplayName(
      item?.[`${prefix}Name`],
      nested?.fullName,
      nested?.name,
      nested?.customerName
    ),
    phone: pickDisplayName(
      item?.[`${prefix}Phone`],
      nested?.phone,
      nested?.phoneNumber
    ),
    address: pickDisplayName(item?.[`${prefix}Address`], nested?.address),
  };
}

/** URL ảnh upload (Cloudinary) hoặc file ảnh trực tiếp — khác link sản phẩm (Taobao, 1688…). */
export function isImageReferenceUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    if (host.includes("cloudinary.com") || path.includes("/image/upload")) return true;
    if (/\.(jpe?g|png|gif|webp|avif|bmp)(\?.*)?$/i.test(path)) return true;
    return false;
  } catch {
    return /\.(jpe?g|png|gif|webp|avif|bmp)(\?.*)?$/i.test(trimmed);
  }
}

export function normalizeConsignmentItem(item) {
  if (!item) return item;

  const referenceUrl = item.referenceUrl?.trim() || item.imageUrl?.trim() || null;
  const extraImages = Array.isArray(item.images)
    ? item.images.map((entry) => (typeof entry === "string" ? entry : entry?.url)).filter(Boolean)
    : [];

  const imageUrls = [
    ...(isImageReferenceUrl(referenceUrl) ? [referenceUrl] : []),
    ...extraImages.filter(isImageReferenceUrl),
  ];

  return {
    id: item.id,
    productName: item.productName,
    productType: item.productType,
    quantity: item.quantity ?? item.Quantity,
    weight: item.weight,
    width: item.width,
    height: item.height,
    length: item.length,
    declaredValue: item.declaredValue,
    referenceUrl,
    imageUrls,
    domesticTrackingCode: item.domesticTrackingCode ?? null,
  };
}
