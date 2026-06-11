"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as authService from "@/shared/services/authService";
import { ApiError } from "@/shared/types/api";
import { getErrorMessage } from "@/shared/utils/apiError";

const EMPLOYEE_ROLES = [
  { value: "Sale", label: "Sale" },
  { value: "WarehouseStaff", label: "Warehouse Staff" },
  { value: "OperationsManager", label: "Operations Manager" },
  { value: "Delivery", label: "Delivery" },
  { value: "Admin", label: "Admin" },
];

type CreatedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "LOCKED";
  lastSeen: string;
  avatar: string;
};

type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (user: CreatedUser) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function CreateUserModal({ open, onClose, onCreated }: CreateUserModalProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const fullName = form.fullName.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const phone = form.phone.value.trim();
    const role = form.employeeRole.value;

    setIsSubmitting(true);

    try {
      const response = await authService.adminRegisterEmployee({
        fullName,
        email,
        password,
        phone,
        role,
      });

      onCreated({
        id: response.id,
        name: fullName,
        email,
        role,
        status: "ACTIVE",
        lastSeen: "Vừa tạo",
        avatar: getInitials(fullName),
      });
      form.reset();
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
        className="absolute inset-0 bg-black/40"
        aria-label="Đóng"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-border-muted shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-ink">Thêm nhân viên</h2>
            <p className="text-sm text-muted mt-1">Tạo tài khoản nhân viên mới qua API admin.</p>
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-semibold text-ink">
              Họ tên
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
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
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
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
                className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
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
                defaultValue="Sale"
                className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring bg-white"
              >
                {EMPLOYEE_ROLES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              className="w-full h-11 px-4 border border-border-muted rounded-lg text-sm input-focus-ring"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-lg text-sm font-semibold text-muted hover:bg-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-lg text-sm font-bold bg-insight text-white hover:bg-secondary disabled:opacity-60"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
