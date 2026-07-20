"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as customerService from "@/modules/customers";
import { getErrorMessage } from "@/utils/apiError";

const { CUSTOMER_STATUS_LABELS } = customerService;

const statusOptions = Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function CustomerFormModal({ open, mode, customer, onClose, onSaved }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      fullName: form.elements.namedItem("fullName").value.trim(),
      phone: form.elements.namedItem("phone").value.trim(),
      email: form.elements.namedItem("email").value.trim(),
      address: form.elements.namedItem("address").value.trim(),
      companyName: form.elements.namedItem("companyName").value.trim(),
      taxId: form.elements.namedItem("taxId").value.trim(),
      status: form.elements.namedItem("status").value,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await customerService.createCustomer(payload);
        onSaved(response.customer, response.message || "Tạo hồ sơ khách hàng thành công.");
      } else if (customer) {
        const response = await customerService.updateCustomer(customer.id, payload);
        onSaved(response.customer, response.message || "Cập nhật hồ sơ khách hàng thành công.");
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-xl border border-border-muted shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-surface-elevated">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm khách hàng" : "Chỉnh sửa khách hàng"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-muted hover:text-ink">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error ? (
            <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-semibold text-ink">
              Họ tên <span className="text-danger">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              defaultValue={customer?.fullName ?? ""}
              placeholder="VD: Nguyen Van A"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-ink">
                Số điện thoại <span className="text-danger">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                required
                defaultValue={customer?.phone ?? ""}
                placeholder="VD: +84 901 234 567"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
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
                defaultValue={customer?.email ?? ""}
                placeholder="email@example.com"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-semibold text-ink">
              Địa chỉ
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={customer?.address ?? ""}
              placeholder="Địa chỉ liên hệ của khách"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-semibold text-ink">
                Công ty
              </label>
              <input
                id="companyName"
                name="companyName"
                defaultValue={customer?.companyName ?? ""}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="taxId" className="text-sm font-semibold text-ink">
                MST
              </label>
              <input
                id="taxId"
                name="taxId"
                defaultValue={customer?.taxId ?? ""}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-semibold text-ink">
              Trạng thái hồ sơ
            </label>
            <select
              id="status"
              name="status"
              defaultValue={customer?.status ?? "ACTIVE"}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-lg border border-border-muted text-sm font-semibold text-muted hover:bg-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo hồ sơ" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
