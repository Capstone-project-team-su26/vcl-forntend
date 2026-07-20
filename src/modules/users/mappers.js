import { formatDateTimeLocal } from "@/utils/dateTime";

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatUserDate(iso) {
  return formatDateTimeLocal(iso, { dateOnly: true });
}

/** WarehouseVN / WarehouseTQ / WarehouseStaff / … → Warehouse (region tách riêng). */
export function normalizeEmployeeRole(role) {
  const raw = String(role || "").trim();
  if (!raw) return raw;
  if (/^warehouse/i.test(raw)) return "Warehouse";
  return raw;
}

function inferRegionFromRole(role) {
  const raw = String(role || "");
  if (/VN|Vietnam|Việt/i.test(raw)) return "VN";
  if (/TQ|China|Trung/i.test(raw)) return "TQ";
  return null;
}

function normalizeUserStatus(status) {
  const raw = String(status || "Active")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (raw === "LOCKED") return "LOCKED";
  if (raw === "PENDING_VERIFICATION" || raw === "PENDINGVERIFICATION") {
    return "PENDING_VERIFICATION";
  }
  if (raw === "ACTIVE") return "ACTIVE";
  return raw || "ACTIVE";
}

export function normalizeUserFromApi(user) {
  const name = user.fullName ?? user.name ?? "—";
  const rawRole = user.role ?? null;
  const region =
    user.region ?? user.Region ?? inferRegionFromRole(rawRole) ?? null;

  return {
    id: user.id,
    name,
    email: user.email ?? null,
    phone: user.phone ?? user.phoneNumber ?? null,
    role: normalizeEmployeeRole(rawRole),
    rawRole,
    userType: user.userType ?? user.user_type ?? null,
    region,
    isEmailVerified: Boolean(
      user.isEmailVerified ?? user.is_email_verified ?? false
    ),
    status: normalizeUserStatus(user.status),
    lastSeen:
      user.lastSeen ??
      formatUserDate(user.createdAt ?? user.created_at),
    avatar: getInitials(name),
  };
}
