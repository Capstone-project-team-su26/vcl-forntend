"use client";
import styles from "./CreateUserModal.module.scss";

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
 * Kho API thường để code rỗng — suy region từ mã, rồi tên/địa chỉ.
 * ponytail: heuristic đủ cho VN/US/TQ/TH/JP; kho lạ fallback theo code hoặc id ngắn.
 */
function inferWarehouseRegion(warehouse) {
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
    <div className={styles.ta73cc4}>
      <button
        type="button"
        className={styles.tf04169}
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className={styles.tbab13e}>
        <div className={styles.t5972d8}>
          <div>
            <h2 className={styles.t9bc24c}>Thêm nhân viên</h2>
            <p className={styles.tfbeb38}>Tạo tài khoản nhân viên mới.</p>
          </div>
          <button type="button" onClick={onClose} className={styles.t6265d4}>
            <Icon icon="lucide:x" className={styles.ta8600f} />
          </button>
        </div>

        {error ? (
          <div className={styles.t6881d9}>
            {error}
          </div>
        ) : null}

        <form
          className={styles.t3e7ce5}
          onSubmit={handleSubmit}
          onInput={() => {
            if (error) setError("");
          }}
        >
          <div className={styles.t6f7e01}>
            <label htmlFor="fullName" className={styles.tae03fc}>
              Họ tên
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              className={`${styles.t54c2be} input-focus-ring`}
            />
          </div>

          <div className={styles.t6f7e01}>
            <label htmlFor="email" className={styles.tae03fc}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`${styles.t54c2be} input-focus-ring`}
            />
          </div>

          <div className={styles.t4c017d}>
            <div className={styles.t6f7e01}>
              <label htmlFor="phone" className={styles.tae03fc}>
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                required
                className={`${styles.t54c2be} input-focus-ring`}
              />
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="employeeRole" className={styles.tae03fc}>
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
                className={`${styles.t171853} input-focus-ring`}
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
            <div className={styles.t6f7e01}>
              <label htmlFor="region" className={styles.tae03fc}>
                Region
              </label>
              <select
                id="region"
                name="region"
                required
                value={selectedRegionValue}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled={regionsLoading || regionOptions.length === 0}
                className={`${styles.t4376e5} input-focus-ring`}
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
                <p className={styles.t72b72d}>Không tải được kho: {regionsError}</p>
              ) : null}
            </div>
          ) : null}

          <div className={styles.t6f7e01}>
            <label htmlFor="password" className={styles.tae03fc}>
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={100}
              className={`${styles.t54c2be} input-focus-ring`}
            />
          </div>

          <div className={styles.tfb9b0c}>
            <button
              type="button"
              onClick={onClose}
              className={styles.t93e0c3}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.t9c95ef}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
