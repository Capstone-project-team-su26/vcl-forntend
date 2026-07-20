/**
 * Múi giờ theo máy người dùng (browser).
 * getTimezoneOffset: phút cần cộng vào local để ra UTC → đảo dấu = offset UTC.
 */
export function getUserUtcOffsetLabel(date = new Date()) {
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  if (minutes === 0) return `UTC${sign}${hours}`;
  return `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

/** Ngày giờ local + (UTC±X) theo máy user. BE gửi ISO UTC thì hiển thị đúng múi giờ client. */
export function formatDateTimeLocal(isoDate, { dateOnly = false } = {}) {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) return "—";

  const formatted = dateOnly
    ? date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return `${formatted} (${getUserUtcOffsetLabel(date)})`;
}

if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
  const sample = new Date("2026-07-20T05:00:00.000Z");
  const label = getUserUtcOffsetLabel(sample);
  console.assert(/^UTC[+-]\d/.test(label), "getUserUtcOffsetLabel format");
  console.assert(
    formatDateTimeLocal("2026-07-20T05:00:00.000Z").includes(label),
    "formatDateTimeLocal must append user UTC offset"
  );
}
