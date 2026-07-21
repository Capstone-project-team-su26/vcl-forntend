"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import * as authService from "@/modules/auth";
import * as userService from "@/modules/users";
import * as warehouseService from "@/modules/warehouses";
import { ApiError, getErrorMessage } from "@/utils/apiError";
import { normalizeEmployeeRole } from "@/utils/apiMappers";

const EMPLOYEE_ROLES = [
  {
    value: "Sale",
    label: "Sale",
    description: "Bán hàng — tạo đơn, báo giá, chăm sóc khách.",
  },
  {
    value: "OperationsManager",
    label: "Operations",
    description: "Vận hành — điều phối quy trình nội bộ.",
  },
  {
    value: "Warehouse",
    label: "Warehouse",
    description: "Kho — nhận/xuất hàng theo region được gán.",
  },
  {
    value: "Admin",
    label: "Admin",
    description: "Quản trị — toàn quyền hệ thống nội bộ.",
  },
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

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-danger" role="alert">
      {message}
    </p>
  );
}

export default function CreateUserModal({ open, onClose, onCreated, existingUsers = [] }) {
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
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
  const selectedRoleMeta = EMPLOYEE_ROLES.find((item) => item.value === selectedRole);

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

  useEffect(() => {
    if (!open) {
      setFormError("");
      setFieldErrors({});
      setIsSubmitting(false);
      setSelectedRole("Sale");
      setSelectedRegion("");
    }
  }, [open]);

  if (!open) return null;

  function clearErrors() {
    if (formError) setFormError("");
    if (Object.keys(fieldErrors).length) setFieldErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    const form = e.currentTarget;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const phone = form.phone.value.trim();
    const role = form.employeeRole.value;
    const region = needsRegion ? selectedRegionValue : "";

    const nextFieldErrors = userService.validateEmployeeRegister({
      fullName,
      email,
      password,
      phone,
      role,
      region,
      needsRegion,
      regionsLoading,
    });

    if (!nextFieldErrors.email && !nextFieldErrors.phone) {
      const duplicate = userService.findDuplicateUser(existingUsers, { email, phone });
      if (duplicate) nextFieldErrors[duplicate.field] = duplicate.message;
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setFieldErrors({});
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
        const message = getErrorMessage(err).toLowerCase();
        if (message.includes("phone") || message.includes("điện thoại") || message.includes("sđt")) {
          setFieldErrors({ phone: "Số điện thoại đã được sử dụng." });
        } else {
          setFieldErrors({ email: "Email đã được sử dụng." });
        }
      } else if (err instanceof ApiError && err.status === 403) {
        setFormError("Bạn không có quyền tạo người dùng.");
      } else {
        setFormError(getErrorMessage(err));
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-user-title"
        className="relative w-full max-w-lg bg-surface rounded-2xl border border-border shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="create-user-title" className="text-xl font-bold text-ink">
              Thêm nhân viên
            </h2>
            <p className="text-sm text-muted mt-1">
              Tạo tài khoản đăng nhập nội bộ. Email và số điện thoại phải chưa gắn tài khoản khác.
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-muted hover:text-ink">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        {formError ? (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} onInput={clearErrors} noValidate>
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-semibold text-ink">
              Họ tên <span className="text-danger">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              maxLength={255}
              autoComplete="name"
              placeholder="VD: Nguyễn Văn A"
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
            />
            <FieldError id="fullName-error" message={fieldErrors.fullName} />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-ink">
              Email đăng nhập <span className="text-danger">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              placeholder="ten@congty.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : "email-hint"}
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
            />
            {fieldErrors.email ? (
              <FieldError id="email-error" message={fieldErrors.email} />
            ) : (
              <p id="email-hint" className="text-xs text-muted">
                Dùng để đăng nhập hệ thống nội bộ; không trùng tài khoản hiện có.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-ink">
                Số điện thoại <span className="text-danger">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={50}
                autoComplete="tel"
                placeholder="VD: 0901234567"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "phone-error" : "phone-hint"}
                className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
              />
              {fieldErrors.phone ? (
                <FieldError id="phone-error" message={fieldErrors.phone} />
              ) : (
                <p id="phone-hint" className="text-xs text-muted">
                  Liên hệ nội bộ; chấp nhận +84 hoặc 0…; không trùng tài khoản khác.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="employeeRole" className="text-sm font-semibold text-ink">
                Vai trò <span className="text-danger">*</span>
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
                aria-invalid={Boolean(fieldErrors.employeeRole)}
                aria-describedby={
                  fieldErrors.employeeRole ? "employeeRole-error" : "employeeRole-hint"
                }
                className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring bg-surface-muted text-ink"
              >
                {EMPLOYEE_ROLES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {fieldErrors.employeeRole ? (
                <FieldError id="employeeRole-error" message={fieldErrors.employeeRole} />
              ) : (
                <p id="employeeRole-hint" className="text-xs text-muted">
                  {selectedRoleMeta?.description}
                </p>
              )}
            </div>
          </div>

          {needsRegion ? (
            <div className="space-y-2">
              <label htmlFor="region" className="text-sm font-semibold text-ink">
                Region <span className="text-danger">*</span>
              </label>
              <select
                id="region"
                name="region"
                required
                value={selectedRegionValue}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled={regionsLoading || regionOptions.length === 0}
                aria-invalid={Boolean(fieldErrors.region)}
                aria-describedby={fieldErrors.region ? "region-error" : "region-hint"}
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
              {fieldErrors.region ? (
                <FieldError id="region-error" message={fieldErrors.region} />
              ) : (
                <p id="region-hint" className="text-xs text-muted">
                  Region kho gắn với tài khoản Warehouse (theo quy ước nội bộ).
                </p>
              )}
              {regionsError ? (
                <p className="text-xs text-danger">Không tải được kho: {regionsError}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-ink">
              Mật khẩu tạm <span className="text-danger">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              placeholder="Ít nhất 8 ký tự"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm bg-surface-muted text-ink input-focus-ring"
            />
            {fieldErrors.password ? (
              <FieldError id="password-error" message={fieldErrors.password} />
            ) : (
              <p id="password-hint" className="text-xs text-muted">
                Nhân viên nên đổi mật khẩu sau lần đăng nhập đầu.
              </p>
            )}
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
