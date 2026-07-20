"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import * as authService from "@/utils/authService";
import * as warehouseService from "@/utils/warehouseService";
import { ApiError, getErrorMessage } from "@/utils/apiError";
import { normalizeEmployeeRole } from "@/utils/apiMappers";

const EMPLOYEE_ROLES = [
  { value: "Sale", label: "Sale" },
  { value: "OperationsManager", label: "Operations" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Delivery", label: "Delivery" },
  { value: "Admin", label: "Admin" },
];

/** VN-HCM → VN, US → US. */
function regionFromWarehouseCode(code) {
  const raw = String(code || "").trim().toUpperCase();
  if (!raw) return null;
  const prefix = raw.includes("-") ? raw.split("-")[0] : raw;
  if (!prefix || prefix.length > 4) return null;
  return prefix === "CN" ? "TQ" : prefix;
}

/**
 * Ưu tiên `region` từ Swagger; kho cũ chưa có field thì suy từ mã/tên/địa chỉ.
 * ponytail: heuristic đủ cho VN/US/TQ/TH/JP; kho lạ fallback theo code hoặc id ngắn.
 */
function inferWarehouseRegion(warehouse) {
  const apiRegion = String(warehouse?.region || "").trim().toUpperCase();
  if (apiRegion) return apiRegion;

  const fromCode = regionFromWarehouseCode(warehouse?.code);
  if (fromCode) return fromCode;

  const text = `${warehouse?.name || ""} ${warehouse?.address || ""}`.toUpperCase();

  if (/(HCM|HA NOI|HANOI|HÀ NỘI|DA NANG|ĐÀ NẴNG|VIET|VIỆT|\bVN\b|TÂN BÌNH|TAN BINH)/.test(text)) {
    return "VN";
  }
  if (/(TRUNG QUOC|TRUNG QUỐC|CHINA|\bTQ\b|\bCN\b|GUANGZHOU|SHENZHEN|SHANGHAI)/.test(text)) {
    return "TQ";
  }
  if (/(CALIFORNIA|\bUSA\b|\bUS\b|\bLA\b|NEW YORK|AMERICA)/.test(text)) {
    return "US";
  }
  if (/(BANGKOK|THAILAND|\bTH\b)/.test(text)) return "TH";
  if (/(JAPAN|TOKYO|\bJP\b)/.test(text)) return "JP";
  if (/(KOREA|SEOUL|\bKR\b)/.test(text)) return "KR";

  return null;
}

function buildRegionOptions(warehouses) {
  const regions = new Set();
  for (const warehouse of warehouses || []) {
    if (warehouse?.isActive === false) continue;
    const region = inferWarehouseRegion(warehouse);
    if (region) regions.add(region);
  }
  return Array.from(regions)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function CreateUserModal({ open, onClose, onCreated }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Sale");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [warehouses, setWarehouses] = useState(undefined);
  const [regionsError, setRegionsError] = useState("");

  const needsRegion = selectedRole === "Warehouse";
  const regionsLoading = warehouses === undefined;
  const regionOptions = useMemo(
    () => buildRegionOptions(Array.isArray(warehouses) ? warehouses : []),
    [warehouses]
  );
  const selectedRegionValue = regionOptions.some((item) => item.value === selectedRegion)
    ? selectedRegion
    : (regionOptions[0]?.value ?? "");

  useEffect(() => {
    if (!open) return undefined;

    let active = true;

    warehouseService
      .listWarehouses({ isActive: true })
      .then((data) => {
        if (!active) return;
        setWarehouses(Array.isArray(data) ? data : []);
        setRegionsError("");
      })
      .catch((err) => {
        if (!active) return;
        setWarehouses([]);
        setRegionsError(getErrorMessage(err));
      });

    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const phone = form.phone.value.trim();
    const role = form.employeeRole.value;
    const region = needsRegion ? selectedRegionValue : "";

    if (needsRegion && !region) {
      setError(
        regionsLoading
          ? "Đang tải danh sách kho, thử lại sau giây lát."
          : "Không suy ra được region từ kho hiện có."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.adminRegisterEmployee({
        fullName,
        email,
        password,
        phone,
        role,
        region: region || undefined,
      });
      const created = response?.user ?? response?.data ?? response;
      onCreated({
        id: created?.id ?? response?.id,
        name: fullName,
        email,
        phone,
        role: normalizeEmployeeRole(created?.role ?? role),
        rawRole: created?.role ?? role,
        userType: "Employee",
        region: region || created?.region || null,
        isEmailVerified: Boolean(created?.isEmailVerified ?? false),
        status: "ACTIVE",
        lastSeen: "Vừa tạo",
        avatar: getInitials(fullName),
      });
      form.reset();
      setSelectedRole("Sale");
      setSelectedRegion("");
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Email đã được sử dụng.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("Bạn không có quyền tạo người dùng.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-surface rounded-2xl border border-border shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink">Thêm nhân viên</h2>
            <p className="text-sm text-muted mt-1">Tạo tài khoản nhân viên mới.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-muted hover:text-ink">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
          onInput={() => {
            if (error) setError("");
          }}
        >
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-semibold text-ink">
              Họ tên
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-ink">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                required
                className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="employeeRole" className="text-sm font-semibold text-ink">
                Vai trò
              </label>
              <select
                id="employeeRole"
                name="employeeRole"
                required
                value={selectedRole}
                onChange={(e) => {
                  const nextRole = e.target.value;
                  setSelectedRole(nextRole);
                  if (nextRole !== "Warehouse") setSelectedRegion("");
                }}
                className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring bg-surface-muted text-ink"
              >
                {EMPLOYEE_ROLES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {needsRegion ? (
            <div className="space-y-2">
              <label htmlFor="region" className="text-sm font-semibold text-ink">
                Region
              </label>
              <select
                id="region"
                name="region"
                required
                value={selectedRegionValue}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled={regionsLoading || regionOptions.length === 0}
                className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring bg-surface-muted text-ink disabled:opacity-60"
              >
                {regionsLoading ? (
                  <option value="">Đang tải...</option>
                ) : regionOptions.length === 0 ? (
                  <option value="">Không có region</option>
                ) : (
                  regionOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))
                )}
              </select>
              {regionsError ? (
                <p className="text-xs text-danger">Không tải được kho: {regionsError}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-ink">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={100}
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg text-sm font-semibold text-muted hover:bg-surface-muted"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-lg text-sm font-bold bg-insight text-on-solid hover:bg-secondary disabled:opacity-60"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
